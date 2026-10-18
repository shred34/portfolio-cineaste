import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  groups: [
    {name: 'general', title: 'Général', default: true},
    {name: 'bio', title: 'Bio'},
    {name: 'contact', title: 'Contact'},
  ],
  fields: [
    // ——— Général ———
    defineField({name: 'name', title: 'Nom', type: 'string', group: 'general', initialValue: 'Julien Monges'}),
    defineField({
      name: 'description',
      title: 'Description pour Google',
      description: 'Une phrase courte, affichée dans les résultats de recherche.',
      type: 'string',
      group: 'general',
    }),
    defineField({
      name: 'location',
      title: 'Lieu (pied de page)',
      type: 'string',
      group: 'general',
      initialValue: 'Genève, CH',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordonnées (pied de page)',
      type: 'string',
      group: 'general',
      initialValue: '46.2044° N, 6.1432° E',
    }),

    // ——— Bio ———
    defineField({name: 'portrait', title: 'Portrait', type: 'image', group: 'bio', options: {hotspot: true}}),
    defineField({name: 'bio', title: 'Texte de bio', type: 'text', rows: 5, group: 'bio'}),
    defineField({
      name: 'bioInfos',
      title: 'Infos à côté du texte',
      description: 'Par exemple : En développement, Formation, Langues.',
      type: 'array',
      group: 'bio',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'infoBlock',
          title: 'Bloc',
          fields: [
            defineField({name: 'label', title: 'Titre (en gris)', type: 'string'}),
            defineField({
              name: 'lines',
              title: 'Lignes',
              type: 'array',
              of: [defineArrayMember({type: 'string'})],
            }),
            defineField({
              name: 'italicSecondLine',
              title: 'Deuxième ligne en italique',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'label', lines: 'lines'},
            prepare: ({title, lines}) => ({title, subtitle: (lines || []).join(' / ')}),
          },
        }),
      ],
    }),
    defineField({
      name: 'cv',
      title: 'CV (PDF, facultatif)',
      description: 'Si un fichier est ajouté, un lien « CV » apparaît sur la page Bio.',
      type: 'file',
      group: 'bio',
      options: {accept: 'application/pdf'},
    }),

    // ——— Contact ———
    defineField({name: 'email', title: 'Email', type: 'string', group: 'contact'}),
    defineField({name: 'phone', title: 'Téléphone', type: 'string', group: 'contact'}),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram (affiché)',
      description: 'Exemple : @julien.flips',
      type: 'string',
      group: 'contact',
    }),
    defineField({name: 'instagramUrl', title: 'Lien Instagram', type: 'url', group: 'contact'}),
  ],
  preview: {prepare: () => ({title: 'Réglages du site'})},
})
