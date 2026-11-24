import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

// Projet Sanity (le même que dans portfoliocinema/sanity.config.ts)
export const client = createClient({
  projectId: 'oeavtdhs',
  dataset: 'production',
  apiVersion: '2025-01-01',
  // useCdn: false => les modifications faites dans Sanity apparaissent
  // immédiatement en local (il suffit de recharger la page).
  useCdn: false,
})

const builder = createImageUrlBuilder(client)

export type SanityImage = {
  asset?: {_ref?: string; _id?: string; url?: string}
  hotspot?: unknown
  crop?: unknown
  alt?: string
  /** utilisé uniquement par les données de test locales */
  mockUrl?: string
}

export type Film = {
  _id: string
  title: string
  slug: string
  year?: number
  genre?: string
  duration?: string
  production?: string
  directors?: string
  role?: string
  synopsis?: string
  youtubeUrl?: string
  selections?: string[]
  coverImage?: SanityImage
  videoPoster?: SanityImage
  stills?: SanityImage[]
}

export type InfoBlock = {label: string; lines?: string[]; italicSecondLine?: boolean}

export type Settings = {
  name: string
  description?: string
  location?: string
  coordinates?: string
  bio?: string
  portrait?: SanityImage
  bioInfos?: InfoBlock[]
  cvUrl?: string
  email?: string
  phone?: string
  instagramHandle?: string
  instagramUrl?: string
}

const FILM_FIELDS = `
  _id, title, "slug": slug.current, year, genre, duration, production,
  directors, role, synopsis, youtubeUrl, selections,
  coverImage, videoPoster, stills
`

const FILMS_QUERY = `*[_type == "film" && defined(slug.current)]
  | order(coalesce(position, 9999) asc, year desc, _createdAt desc){${FILM_FIELDS}}`

const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  name, description, location, coordinates, bio, portrait, bioInfos,
  "cvUrl": cv.asset->url, email, phone, instagramHandle, instagramUrl
}`

export const DEFAULT_SETTINGS: Settings = {
  name: 'Julien Monges',
  location: 'Genève, CH',
  coordinates: '46.2044° N, 6.1432° E',
}

// Données de test (fichier local facultatif, jamais utilisé en production).
const mocks = import.meta.glob('./mock-data.js', {eager: true}) as Record<
  string,
  {films: Film[]; settings: Settings}
>
const mock = import.meta.env.SANITY_MOCK === '1' ? Object.values(mocks)[0] : undefined

export async function getFilms(): Promise<Film[]> {
  if (mock) return mock.films
  return (await client.fetch<Film[]>(FILMS_QUERY)) ?? []
}

export async function getSettings(): Promise<Settings> {
  if (mock) return mock.settings
  const s = await client.fetch<Settings | null>(SETTINGS_QUERY)
  return {...DEFAULT_SETTINGS, ...(s ?? {})}
}

/** URL d'image recadrée (respecte le point focal défini dans Sanity). */
export function imageUrl(img: SanityImage | undefined, w: number, h?: number): string | undefined {
  if (!img) return undefined
  if (img.mockUrl) return img.mockUrl
  if (!img.asset) return undefined
  let b = builder.image(img).width(w).auto('format').quality(82)
  if (h) b = b.height(h).fit('crop')
  return b.url()
}

/** srcset pour images responsives, avec un ratio largeur/hauteur fixe. */
export function srcSet(img: SanityImage | undefined, ratio?: number, widths = [480, 800, 1200, 1600, 2200]) {
  if (!img) return undefined
  if (img.mockUrl) return undefined
  return widths
    .map((w) => `${imageUrl(img, w, ratio ? Math.round(w / ratio) : undefined)} ${w}w`)
    .join(', ')
}

export type Video =
  | {kind: 'embed'; src: string; provider: 'youtube' | 'vimeo'}
  | {kind: 'file'; src: string}
  | {kind: 'link'; src: string}

/**
 * Transforme le lien vidéo collé dans Sanity en lecteur :
 * - YouTube et Vimeo : lecteur intégré épuré, chargé seulement au clic ;
 * - fichier vidéo direct (.mp4, .webm, .mov) : lecteur natif du navigateur ;
 * - tout autre lien : l'image ouvre la vidéo dans un nouvel onglet.
 */
export function videoFromUrl(url?: string): Video | undefined {
  if (!url || !url.trim()) return undefined
  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return undefined
  }
  const host = u.hostname.replace(/^www\./, '')

  // YouTube
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    let id: string | undefined
    if (host === 'youtu.be') id = u.pathname.split('/')[1]
    else id = u.searchParams.get('v') || u.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/)?.[2]
    if (id) {
      const params = new URLSearchParams({
        autoplay: '1',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        iv_load_policy: '3',
        color: 'white',
      })
      return {kind: 'embed', provider: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?${params}`}
    }
  }

  // Vimeo (y compris les liens privés du type vimeo.com/123456/abcdef)
  if (host.endsWith('vimeo.com')) {
    const parts = u.pathname.split('/').filter(Boolean)
    const i = parts.findIndex((x) => /^\d+$/.test(x))
    if (i >= 0) {
      const id = parts[i]
      const hash = u.searchParams.get('h') || (parts[i + 1] && /^[0-9a-f]+$/i.test(parts[i + 1]) ? parts[i + 1] : '')
      const params = new URLSearchParams({autoplay: '1', title: '0', byline: '0', portrait: '0', dnt: '1', color: 'ffffff'})
      if (hash) params.set('h', hash)
      return {kind: 'embed', provider: 'vimeo', src: `https://player.vimeo.com/video/${id}?${params}`}
    }
  }

  // Fichier vidéo direct
  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return {kind: 'file', src: u.toString()}

  // Autre plateforme : on ouvre simplement le lien
  return {kind: 'link', src: u.toString()}
}

export function filmMeta(f: Film, withYear = true) {
  return [f.genre, f.duration, withYear ? f.year : undefined].filter(Boolean).join(' · ')
}

/** Lien interne qui fonctionne aussi quand le site est dans un sous-dossier (GitHub Pages). */
export function href(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path}`
}
