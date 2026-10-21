# Kultuurfabriek Kooi-Aap

Website van Kultuurfabriek Kooi-Aap, gebouwd met [Astro](https://astro.build) als statische site.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # bouwt naar dist/
```

- Berichten: `src/content/posts/<slug>/index.md`
- Agenda: `src/content/agenda/<slug>/index.md`
- Vaste pagina's: `src/pages/`

Zie [CLAUDE.md](CLAUDE.md) voor het formaat van berichten en optredens.

`scripts/import-wp.mjs` is de eenmalige import van de oude WordPress-site.
