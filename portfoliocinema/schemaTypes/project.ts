import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Projet',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Titre', type: 'string'}),
    defineField({name: 'coverImage', title: 'Image de couverture', type: 'image'}),
    defineField({name: 'year', title: 'Année', type: 'number'}),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'videoUrl', title: 'Lien vidéo', type: 'url'}),
    defineField({name: 'category', title: 'Catégorie', type: 'string'}),
    defineField({name: 'role', title: 'Rôle', type: 'string'}),
  ],
})
