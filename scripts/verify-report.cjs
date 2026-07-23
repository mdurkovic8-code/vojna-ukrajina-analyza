'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const required = ['index.html', 'events.json', 'military.md', 'politics.md', 'economy.md'];
const errors = [];
const allowedThemes = new Set(['military', 'politics', 'economy']);
const allowedTrendThemes = new Set([...allowedThemes, 'cross-domain']);
const allowedStatuses = new Set(['confirmed', 'likely', 'disputed', 'claim_only']);
const allowedConfidence = new Set(['high', 'medium', 'low']);
const allowedReliability = new Set(['A', 'B', 'C']);
const idPattern = /^(MIL|POL|ECO)-\d{8}-\d{3}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const eventRefPattern = /(?:MIL|POL|ECO)-\d{8}-\d{3}/g;

function check(condition, message) {
  if (!condition) errors.push(message);
}

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    errors.push(`Chýba ${file}.`);
    return '';
  }
  const value = fs.readFileSync(full, 'utf8');
  check(!value.startsWith('\uFEFF'), `${file} obsahuje UTF-8 BOM.`);
  check(!/[�ÃÂ]/u.test(value), `${file} obsahuje znaky typické pre poškodené kódovanie.`);
  return value;
}

function stripHtml(value) {
  return value
    .replace(/<a\b[^>]*class="[^"]*event-ref[^"]*"[^>]*>[\s\S]*?<\/a>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function withoutStyles(file) {
  return fs.readFileSync(file, 'utf8')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');
}

for (const file of required) read(file);

let data = null;
try {
  data = JSON.parse(read('events.json'));
} catch (error) {
  errors.push(`events.json nie je validný JSON: ${error.message}`);
}

if (data) {
  check(data.metadata && typeof data.metadata === 'object', 'Chýba metadata.');
  check(data.metadata?.language === 'sk', 'metadata.language musí byť sk.');
  check(datePattern.test(data.metadata?.analysis_window?.start_date || ''), 'Neplatný začiatok analytického obdobia.');
  check(datePattern.test(data.metadata?.analysis_window?.end_date || ''), 'Neplatný koniec analytického obdobia.');
  check(!Number.isNaN(Date.parse(data.metadata?.research_cutoff_utc || '')), 'Neplatný research_cutoff_utc.');
  check(Array.isArray(data.events) && data.events.length > 0, 'Pole events musí byť neprázdne.');
  check(Array.isArray(data.trends), 'Pole trends musí existovať.');

  const suspiciousText = [];
  (function walk(value, pointer = '') {
    if (typeof value === 'string' && !pointer.endsWith('source_url')) {
      const questionMarks = (value.match(/\?/g) || []).length;
      if (questionMarks >= 2 || /\?\p{L}/u.test(value)) suspiciousText.push(pointer);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${pointer}[${index}]`));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => walk(item, pointer ? `${pointer}.${key}` : key));
    }
  })(data);
  check(!suspiciousText.length, `Podozrivé náhradné otázniky v JSON: ${suspiciousText.join(', ')}.`);

  const ids = new Set();
  for (const [index, event] of (data.events || []).entries()) {
    const where = `events[${index}]`;
    check(idPattern.test(event.id || ''), `${where} má neplatné ID.`);
    check(!ids.has(event.id), `Duplicitné ID ${event.id}.`);
    ids.add(event.id);
    check(allowedThemes.has(event.theme), `${event.id}: neplatná téma.`);
    check(datePattern.test(event.event_date || ''), `${event.id}: neplatný event_date.`);
    check(Number.isInteger(event.significance) && event.significance >= 1 && event.significance <= 5, `${event.id}: significance musí byť 1–5.`);
    check(allowedStatuses.has(event.status), `${event.id}: neplatný status.`);
    check(allowedConfidence.has(event.confidence), `${event.id}: neplatná confidence.`);
    check(Array.isArray(event.evidence) && event.evidence.length > 0, `${event.id}: chýba evidence.`);
    for (const [sourceIndex, source] of (event.evidence || []).entries()) {
      const label = `${event.id}.evidence[${sourceIndex}]`;
      check(Boolean(source.source_name), `${label}: chýba source_name.`);
      check(Boolean(source.claim_supported), `${label}: chýba claim_supported.`);
      check(allowedReliability.has(source.reliability_tier), `${label}: neplatná reliability_tier.`);
      try {
        const url = new URL(source.source_url);
        check(url.protocol === 'http:' || url.protocol === 'https:', `${label}: zdroj musí používať HTTP(S).`);
      } catch {
        errors.push(`${label}: neplatná source_url.`);
      }
    }
  }

  for (const [index, trend] of (data.trends || []).entries()) {
    const label = trend.id || `trends[${index}]`;
    check(allowedTrendThemes.has(trend.theme), `${label}: neplatná téma trendu.`);
    check(Array.isArray(trend.supporting_event_ids) && trend.supporting_event_ids.length > 0, `${label}: chýbajú supporting_event_ids.`);
    for (const id of trend.supporting_event_ids || []) check(ids.has(id), `${label}: neexistujúca podporná udalosť ${id}.`);
    for (const id of trend.counterevidence_event_ids || []) check(ids.has(id), `${label}: neexistujúci protidôkaz ${id}.`);
  }

  for (const file of ['military.md', 'politics.md', 'economy.md']) {
    const refs = read(file).match(eventRefPattern) || [];
    for (const id of refs) check(ids.has(id), `${file}: odkaz na neexistujúcu udalosť ${id}.`);
  }

  const html = read('index.html');
  const block = html.match(/<script\s+type="application\/json"\s+id="events-data">\s*([\s\S]*?)\s*<\/script>/i);
  check(Boolean(block), 'index.html neobsahuje blok events-data.');
  if (block) {
    try {
      assert.deepStrictEqual(JSON.parse(block[1]), data);
    } catch (error) {
      errors.push(`Vložené events-data nie sú zhodné s events.json: ${error.message}`);
    }
  }

  check(!/<script\b[^>]*\bsrc\s*=/i.test(html), 'HTML obsahuje externý alebo samostatný script src.');
  check(!/<link\b[^>]*rel=["']stylesheet["'][^>]*>/i.test(html), 'HTML obsahuje externý stylesheet.');
  check(!/@import\s+url/i.test(html), 'CSS obsahuje @import.');

  const scriptBlocks = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [index, match] of scriptBlocks.entries()) {
    try { new Function(match[1]); } catch (error) { errors.push(`JavaScript blok ${index + 1} má syntaktickú chybu: ${error.message}`); }
  }

  const article = html.match(/<article\s+class="longread-shell">([\s\S]*?)<\/article>/i);
  check(Boolean(article), 'Chýba hlavný longform článok.');
  if (article) {
    const withoutRefs = article[1].replace(/<a\b[^>]*class="[^"]*event-ref[^"]*"[^>]*>[\s\S]*?<\/a>/gi, ' ');
    const words = stripHtml(withoutRefs).match(/[\p{L}\p{N}]+(?:[’'–-][\p{L}\p{N}]+)*/gu) || [];
    check(words.length >= 2500 && words.length <= 3500, `Hlavný článok má ${words.length} slov; povolené je 2 500–3 500.`);
    const chapters = article[1].match(/<h3\b/g) || [];
    check(chapters.length >= 7, `Hlavný článok má iba ${chapters.length} kapitol; očakáva sa aspoň 7.`);

    const paragraphs = [...article[1].matchAll(/<p(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/p>/gi)];
    for (const [index, match] of paragraphs.entries()) {
      if ((match[1] || '').split(/\s+/).includes('longread-meta')) continue;
      const text = stripHtml(match[2]);
      if (text.length < 80) continue;
      const refs = [...match[2].matchAll(/href="#event-((?:MIL|POL|ECO)-\d{8}-\d{3})"/g)].map(item => item[1]);
      check(refs.length >= 1 && refs.length <= 3, `Faktický odsek článku ${index + 1} má ${refs.length} odkazov na udalosti; povolené sú 1–3.`);
    }
  }

  const allHtmlRefs = [...html.matchAll(/href="#event-((?:MIL|POL|ECO)-\d{8}-\d{3})"/g)].map(item => item[1]);
  for (const id of allHtmlRefs) check(ids.has(id), `HTML odkazuje na neexistujúcu udalosť ${id}.`);
}

const editionsRoot = path.join(root, 'editions');
if (fs.existsSync(editionsRoot)) {
  const editions = fs.readdirSync(editionsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && datePattern.test(entry.name))
    .map(entry => entry.name)
    .sort();
  check(editions.length > 0, 'Chýba aspoň jedno archívne vydanie.');
  if (editions.length) {
    const latest = path.join(editionsRoot, editions.at(-1));
    for (const file of required) {
      const archived = path.join(latest, file);
      check(fs.existsSync(archived), `Najnovšiemu archívu chýba ${file}.`);
      if (fs.existsSync(archived)) {
        const current = path.join(root, file);
        const matchesArchive = file === 'index.html'
          ? withoutStyles(current) === withoutStyles(archived)
          : digest(current) === digest(archived);
        check(matchesArchive, `Obsah aktuálneho ${file} nie je zhodný s najnovším archívnym vydaním.`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Kontrola zlyhala (${errors.length}):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Kontrola úspešná: ${data.events.length} udalostí, ${data.trends.length} trendov, ${data.events.reduce((sum, event) => sum + event.evidence.length, 0)} zdrojových záznamov.`);
