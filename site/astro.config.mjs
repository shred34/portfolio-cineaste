// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Adresse du site en ligne et sous-dossier éventuel (rempli automatiquement
  // par GitHub lors de la mise en ligne, voir .github/workflows/deploy.yml).
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  // cache la barre d'outils Astro qui apparaît en bas pendant le développement
  devToolbar: { enabled: false },
});
