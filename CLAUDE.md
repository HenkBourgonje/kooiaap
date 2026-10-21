@AGENTS.md

# Kultuurfabriek Kooi-Aap

Statische Astro-site (vervanger van de oude WordPress-site kultuurfabriekkooiaap.nl). Alle teksten zijn Nederlands.

## Nieuw bericht (blog/interview/nieuws)

Maak een map `src/content/posts/<slug>/` met `index.md` en zet de afbeeldingen ernaast. De slug wordt de URL (`/<slug>/`): kleine letters, koppeltekens.

```md
---
title: "Titel zoals hij op de site moet staan"
date: 2026-10-21T12:00:00
cover: "./foto.jpg"     # optioneel, uitgelichte afbeelding bovenaan en op het kaartje
home: true              # op de homepage tonen (standaard true)
nieuws: false           # op /nieuws/ tonen
---

*Door Harry de Jong*

**Intro in vet.**

Lopende tekst. Afbeeldingen: ![](./foto2.jpg). Video: <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="Video" loading="lazy" allowfullscreen></iframe>
```

## Nieuw optreden (agenda)

Maak `src/content/agenda/<slug>/index.md` met de poster ernaast. Alles met een datum in de toekomst staat onder "Verwacht" (met ticketknop), de rest onder "Geweest".

```md
---
title: "Naam artiest"
date: 2026-12-13T16:00:00   # zonder tijdzone; wordt als lokale tijd getoond
image: "./poster.jpg"
tickets: "https://kultuurfabriek-kooiaap.weticket.io/..."   # optioneel
---

**Op zondagmiddag 13 december staat ... op het podium van de Kultuurfabriek Kooi-Aap aan de Leijesterhegedijk 27 B in Alde Leie. Het optreden begint om 16.00 uur. De prijs per kaartje is 18 euro.**

Beschrijving van de artiest.
```

Controleer na elke wijziging met `npm run build`.
