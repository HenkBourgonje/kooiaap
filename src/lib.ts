import { getCollection } from 'astro:content';

export const PER_PAGE = 10;

export async function posts(lijst: 'home' | 'nieuws') {
  const all = await getCollection('posts', (p) => p.data[lijst]);
  return all.sort((a, b) => +b.data.date - +a.data.date);
}

// Platte tekst uit markdown voor de kaartjes op de overzichtspagina's.
export function excerpt(md = '', words = 60) {
  const w = md
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`|]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  return w.length > words ? `${w.slice(0, words).join(' ')}…` : w.join(' ');
}

// Datums staan zonder tijdzone in de bestanden en worden als UTC gelezen; daarom ook als UTC tonen.
export const datum = (d: Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  d.toLocaleString('nl-NL', { timeZone: 'UTC', ...opts });

// Interne link. Zonder eigen domein draait GitHub Pages onder een subpad (/kooiaap/); dat zet de build in BASE_URL.
export const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;
