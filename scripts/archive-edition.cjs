'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const editionsRoot = path.join(root, 'editions');
const required = ['index.html', 'events.json', 'military.md', 'politics.md', 'economy.md'];

function fail(message) {
  console.error(`CHYBA: ${message}`);
  process.exit(1);
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

let data;
try {
  data = JSON.parse(fs.readFileSync(path.join(root, 'events.json'), 'utf8'));
} catch (error) {
  fail(`events.json nie je validný: ${error.message}`);
}

const cutoff = data?.metadata?.research_cutoff_utc;
const editionDate = typeof cutoff === 'string' ? cutoff.slice(0, 10) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(editionDate)) fail('Chýba platný metadata.research_cutoff_utc.');

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) fail(`Chýba povinný súbor ${file}.`);
}

fs.mkdirSync(editionsRoot, { recursive: true });
const target = path.join(editionsRoot, editionDate);

if (fs.existsSync(target)) {
  const differences = required.filter(file => {
    const archived = path.join(target, file);
    return !fs.existsSync(archived) || digest(path.join(root, file)) !== digest(archived);
  });
  if (differences.length) {
    fail(`Vydanie ${editionDate} už existuje a nesmie sa prepísať. Rozdielne súbory: ${differences.join(', ')}.`);
  }
  console.log(`Archívne vydanie ${editionDate} už existuje a je zhodné.`);
  process.exit(0);
}

fs.mkdirSync(target);
for (const file of required) fs.copyFileSync(path.join(root, file), path.join(target, file));
console.log(`Vytvorené nemenné vydanie editions/${editionDate}.`);
