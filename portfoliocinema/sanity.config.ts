import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

// Les réglages du site (bio, contact, pied de page) sont un document unique.
const SINGLETONS = new Set(['siteSettings'])

export default defineConfig({
  name: 'default',
  title: 'Julien Monges',
  projectId: 'oeavtdhs',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenu')
          .items([
            S.documentTypeListItem('film')
              .title('Films')
              .child(
                S.documentTypeList('film')
                  .title('Films')
                  .defaultOrdering([
                    {field: 'position', direction: 'asc'},
                    {field: 'year', direction: 'desc'},
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title('Réglages du site')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    // pas de bouton « nouveau » pour les réglages (document unique)
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.has(schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
