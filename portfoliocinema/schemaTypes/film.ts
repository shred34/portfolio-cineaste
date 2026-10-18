import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'film',
  title: 'Film',
  type: 'document',
  groups: [
    {name: 'infos', title: 'Infos', default: true},
    {name: 'images', title: 'Images & vidéo'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'infos',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      description: 'Générée à partir du titre (clique sur « Generate »). Exemple : misol-ha',
      type: 'slug',
      group: 'infos',
      options: {source: 'title', maxLength: 80},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'year',
      title: 'Année',
      type: 'number',
      group: 'infos',
      validation: (r) => r.required().integer().min(1990).max(2100),
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'string',
      group: 'infos',
      options: {
        list: ['Fiction', 'Documentaire', 'Clip', 'Expérimental', 'Publicité'],
      },
    }),
    defineField({
      name: 'duration',
      title: 'Durée',
      description: 'Exemple : 20 min',
      type: 'string',
      group: 'infos',
    }),
    defineField({
      name: 'directors',
      title: 'Réalisation',
      description: 'Noms des réalisateurs·rices, séparés par des virgules',
      type: 'string',
      group: 'infos',
    }),
    defineField({
      name: 'role',
      title: 'Rôle de Julien',
      description: 'Exemple : Co-réalisation, montage, image',
      type: 'string',
      group: 'infos',
    }),
    defineField({
      name: 'production',
      title: 'Production',
      description: 'Exemple : Prod. HEAD, Autoproduction',
      type: 'string',
      group: 'infos',
    }),
    defineField({
      name: 'synopsis',
      title: 'Synopsis',
      type: 'text',
      rows: 6,
      group: 'infos',
    }),
    defineField({
      name: 'selections',
      title: 'Sélections en festival',
      description: 'Une ligne par festival. Laisse vide s’il n’y en a pas.',
      type: 'array',
      group: 'infos',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'position',
      title: 'Position (facultatif)',
      description:
        'Laisse vide pour trier par année (le plus récent en premier). Mets 1, 2, 3… pour forcer un ordre : les films avec un numéro passent devant.',
      type: 'number',
      group: 'infos',
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      description:
        'Affichée sur l’accueil au format cinémascope (très allongé). Clique sur l’image puis sur l’icône de recadrage pour choisir le point important.',
      type: 'image',
      group: 'images',
      options: {hotspot: true},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'Lien YouTube',
      description: 'Colle simplement le lien de la vidéo (youtu.be/… ou youtube.com/watch?v=…). Laisse vide si pas encore en ligne.',
      type: 'url',
      group: 'images',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Image avant lecture',
      description: 'Image affichée à la place de la vidéo tant qu’on n’a pas cliqué. Si vide, la couverture est utilisée.',
      type: 'image',
      group: 'images',
      options: {hotspot: true},
    }),
    defineField({
      name: 'stills',
      title: 'Images du film',
      description: 'Affichées sous le texte, par rangées de trois.',
      type: 'array',
      group: 'images',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
    }),
  ],
  orderings: [
    {
      title: 'Ordre du site',
      name: 'siteOrder',
      by: [
        {field: 'position', direction: 'asc'},
        {field: 'year', direction: 'desc'},
      ],
    },
    {title: 'Année', name: 'yearDesc', by: [{field: 'year', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', year: 'year', genre: 'genre', media: 'coverImage'},
    prepare: ({title, year, genre, media}) => ({
      title,
      subtitle: [genre, year].filter(Boolean).join(' · '),
      media,
    }),
  },
})
