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

/** Extrait l'identifiant d'une vidéo YouTube depuis n'importe quel format de lien. */
export function youtubeId(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const u = new URL(url.trim())
    if (u.hostname.includes('youtu.be')) return u.pathname.split('/')[1] || undefined
    if (u.searchParams.get('v')) return u.searchParams.get('v') || undefined
    const m = u.pathname.match(/\/(embed|shorts|live)\/([^/?#]+)/)
    return m?.[2]
  } catch {
    return undefined
  }
}

export function filmMeta(f: Film, withYear = true) {
  return [f.genre, f.duration, withYear ? f.year : undefined].filter(Boolean).join(' · ')
}

/** Lien interne qui fonctionne aussi quand le site est dans un sous-dossier (GitHub Pages). */
export function href(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}${path}`
}
