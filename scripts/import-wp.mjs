// Eenmalige import van de oude WordPress-site via de publieke REST API.
// Schrijft berichten naar src/content/posts/<slug>/index.md, met de afbeeldingen ernaast.
// Pagina's (over ons, agenda, contact, ...) zijn met de hand omgezet en worden niet geïmporteerd.
// Gebruik: node scripts/import-wp.mjs
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';

const SITE = 'https://kultuurfabriekkooiaap.nl';
const API = `${SITE}/wp-json/wp/v2`;
const ROOT = path.resolve(import.meta.dirname, '..');

async function all(type) {
  const out = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const res = await fetch(`${API}/${type}?per_page=100&page=${page}`);
    if (!res.ok) break;
    pages = +res.headers.get('x-wp-totalpages');
    out.push(...(await res.json()));
  }
  return out;
}

const decode = (s) =>
  s
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8220;|&#8221;|&#8243;|&#8242;|&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

const attrs = (s) => Object.fromEntries([...decode(s).matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

function youtubeId(url) {
  return url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)?.[1];
}
const videoEmbed = (url) => {
  const id = youtubeId(url);
  if (id) return `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video" loading="lazy" allowfullscreen></iframe>`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) return `<iframe src="https://player.vimeo.com/video/${vimeo}" title="Video" loading="lazy" allowfullscreen></iframe>`;
  return `<a href="${url}">${url}</a>`;
};

// Visual Composer-shortcodes komen ongerenderd uit de API; zet de bruikbare om naar HTML, gooi de rest weg.
function shortcodes(html, media) {
  return html
    .replace(/\[vc_single_image([^\]]*)\]/g, (_, a) => {
      const m = media.get(+attrs(a).image);
      return m ? `<img src="${m.source_url}" alt="${m.alt_text || ''}">` : '';
    })
    .replace(/\[vc_video([^\]]*)\]/g, (_, a) => `<p>${videoEmbed(attrs(a).link || '')}</p>`)
    .replace(/\[vc_text_separator([^\]]*)\]/g, (_, a) => `<h3>${attrs(a).title || ''}</h3>`)
    .replace(/\[vc_separator[^\]]*\]/g, '<hr>')
    .replace(/\[\/?vc_\w+[^\]]*\]/g, '')
    .replace(/\[\/?(caption|embed)[^\]]*\]/g, '');
}

const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', hr: '---', emDelimiter: '*' });
td.keep(['iframe']);
td.addRule('smiley', { filter: (n) => n.nodeName === 'IMG' && /wp-smiley|s\.w\.org/.test(n.className + n.getAttribute('src')), replacement: (_, n) => n.getAttribute('alt') || '' });
// Link rond een geüploade afbeelding weghalen: de afbeelding komt lokaal te staan.
td.addRule('imgLink', {
  filter: (n) => n.nodeName === 'A' && n.children.length === 1 && n.firstElementChild?.nodeName === 'IMG',
  replacement: (content) => content,
});

function toMarkdown(html, media) {
  html = shortcodes(html, media)
    .replace(/<p>(\s|&nbsp;|\u00a0)*<\/p>/g, '')
    // Smush lazyload: de echte bron staat in data-src, src is een placeholder.
    .replace(/\ssrc="data:[^"]*"/g, '')
    .replace(/\sdata-src="/g, ' src="');
  let md = td.turndown(html);
  md = md
    .replace(/https?:\/\/(www\.)?kultuurfabriekkooiaap\.nl\/wp-content\//g, 'WPCONTENT/')
    .replace(/https?:\/\/(www\.)?kultuurfabriekkooiaap\.nl\//g, '/')
    .replaceAll('WPCONTENT/', `${SITE}/wp-content/`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return md;
}

const unsized = (url) => url.replace(/-\d+x\d+(?=\.\w+$)/, '');

async function download(url, dir, used) {
  for (const candidate of [unsized(url), url]) {
    const res = await fetch(candidate);
    if (!res.ok) continue;
    let name = decodeURIComponent(path.basename(new URL(candidate).pathname)).toLowerCase().replace(/[^a-z0-9._-]/g, '-');
    while (used.has(name) && used.get(name) !== candidate) name = `x-${name}`;
    used.set(name, candidate);
    const file = path.join(dir, name);
    try {
      await access(file);
    } catch {
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    return `./${name}`;
  }
  console.warn('  ! niet gevonden:', url);
  return null;
}

// Alle afbeeldingen van de eigen site naar de map van het bericht halen.
async function localizeImages(md, dir) {
  const used = new Map();
  const urls = [...new Set([...md.matchAll(/!\[[^\]]*\]\((https:\/\/kultuurfabriekkooiaap\.nl\/wp-content\/uploads\/[^)\s]+)\)/g)].map((m) => m[1]))];
  for (const url of urls) {
    const local = await download(url, dir, used);
    md = md.replaceAll(`(${url})`, local ? `(${local})` : '()').replace(/!\[[^\]]*\]\(\)/g, '');
  }
  return { md, used };
}

const yaml = (v) => JSON.stringify(v);

async function run() {
  const [posts, mediaList, cats, users] = await Promise.all(['posts', 'media', 'categories', 'users'].map(all));
  const media = new Map(mediaList.map((m) => [m.id, m]));
  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const userName = new Map(users.map((u) => [u.id, u.name]));
  console.log(`${posts.length} berichten, ${mediaList.length} media`);

  for (const p of posts) {
    const dir = path.join(ROOT, 'src/content/posts', p.slug);
    await mkdir(dir, { recursive: true });
    let { md, used } = await localizeImages(toMarkdown(p.content.rendered, media), dir);
    const featured = media.get(p.featured_media);
    const cover = featured ? await download(featured.source_url, dir, used) : null;
    const categories = p.categories.map((c) => catName.get(c));
    const front = [
      '---',
      `title: ${yaml(decode(p.title.rendered))}`,
      `date: ${p.date}`,
      userName.get(p.author) && `author: ${yaml(userName.get(p.author))}`,
      cover && `cover: ${yaml(cover)}`,
      `home: ${categories.includes('Geen categorie')}`,
      `nieuws: ${categories.includes('Nieuwspage only')}`,
      '---',
    ].filter(Boolean);
    await writeFile(path.join(dir, 'index.md'), `${front.join('\n')}\n\n${md}\n`);
    process.stdout.write('.');
  }

  console.log('\nklaar');
}

run();
