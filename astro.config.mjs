// @ts-check
import { defineConfig } from 'astro/config';

// Oude losse evenementpagina's van WordPress wijzen nu naar het item op de agenda.
const oudeEvenementen = [
  'bob-sumner',
  'bob-sumner-17-mei',
  'djoeke-boomsma',
  '1-juni-2025-jimmy-dale',
  'zomer-2025-jimmy-dale',
  '1-december-wasted-major',
  '16-december-boaz-maurice',
  'the-history-of-country-duets',
  '23-juli-mary-lee-family-band',
  'timo-de-jong-band',
];

// Zonder eigen domein draait GitHub Pages op <user>.github.io/<repo>/; de deploy-workflow geeft dat door.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://kultuurfabriekkooiaap.nl',
  base,
  trailingSlash: 'always',
  redirects: {
    ...Object.fromEntries(oudeEvenementen.map((slug) => [`/${slug}`, `${base.replace(/\/$/, '')}/verwachte-artiesten/`])),
    '/interviews': base,
    '/artiesten': base,
  },
});
