'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const inputHtml = path.join(root, 'index.html');
const templateDir = path.join(root, 'templates');
const templateFile = path.join(templateDir, 'index.template.html');
const eventsFile = path.join(root, 'events.json');
const token = '{{EVENTS_JSON}}';
const dataBlock = /(<script\s+type="application\/json"\s+id="events-data">\s*)[\s\S]*?(\s*<\/script>)/i;

function fail(message) {
  console.error(`CHYBA: ${message}`);
  process.exit(1);
}

function readUtf8(file) {
  if (!fs.existsSync(file)) fail(`Chýba súbor ${path.relative(root, file)}.`);
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

if (process.argv.includes('--bootstrap-template')) {
  fs.mkdirSync(templateDir, { recursive: true });
  if (fs.existsSync(templateFile)) fail('Šablóna už existuje; bootstrap ju nesmie prepísať.');
  const current = readUtf8(inputHtml);
  if (!dataBlock.test(current)) fail('V index.html sa nenašiel vložený blok events-data.');
  const template = current.replace(dataBlock, `$1${token}$2`);
  fs.writeFileSync(templateFile, template, 'utf8');
  console.log('Vytvorená templates/index.template.html.');
}

const template = readUtf8(templateFile);
const occurrences = template.split(token).length - 1;
if (occurrences !== 1) fail(`Šablóna musí obsahovať práve jeden token ${token}; nájdené: ${occurrences}.`);

let data;
try {
  data = JSON.parse(readUtf8(eventsFile));
} catch (error) {
  fail(`events.json nie je validný JSON: ${error.message}`);
}

const embedded = JSON.stringify(data, null, 2).replace(/<\/script/gi, '<\\/script');
const output = template.replace(token, embedded);
fs.writeFileSync(inputHtml, output.endsWith('\n') ? output : `${output}\n`, 'utf8');
console.log(`Zostavený index.html (${data.events.length} udalostí, ${data.trends.length} trendov).`);
