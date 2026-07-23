'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');
const editionsRoot = path.join(root, 'editions');
const required = ['index.html', 'events.json', 'military.md', 'politics.md', 'economy.md'];

function fail(message) {
  console.error(`CHYBA: ${message}`);
  process.exit(1);
}

if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') fail('Neplatný cieľový priečinok dist.');
if (fs.existsSync(dist) && fs.lstatSync(dist).isSymbolicLink()) fail('Priečinok dist nesmie byť symbolický odkaz.');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist);

for (const file of required) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) fail(`Chýba ${file}.`);
  fs.copyFileSync(source, path.join(dist, file));
}

const entries = fs.readdirSync(editionsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
  .map(entry => entry.name)
  .sort()
  .reverse();

if (!entries.length) fail('Nie je dostupné žiadne archívne vydanie.');

const archiveRoot = path.join(dist, 'archive');
fs.mkdirSync(archiveRoot);
const manifest = [];

for (const edition of entries) {
  const sourceDir = path.join(editionsRoot, edition);
  const targetDir = path.join(archiveRoot, edition);
  fs.mkdirSync(targetDir);
  for (const file of required) {
    const source = path.join(sourceDir, file);
    if (!fs.existsSync(source)) fail(`Vydaniu ${edition} chýba ${file}.`);
    fs.copyFileSync(source, path.join(targetDir, file));
  }
  const data = JSON.parse(fs.readFileSync(path.join(sourceDir, 'events.json'), 'utf8'));
  manifest.push({
    date: edition,
    generated_at_utc: data.metadata.generated_at_utc,
    research_cutoff_utc: data.metadata.research_cutoff_utc,
    start_date: data.metadata.analysis_window.start_date,
    end_date: data.metadata.analysis_window.end_date,
    trigger_event: data.metadata.analysis_window.trigger_event,
    events: data.events.length,
    trends: data.trends.length,
    url: `./${edition}/`
  });
}

fs.writeFileSync(path.join(archiveRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(dist, '.nojekyll'), '', 'utf8');

const cards = manifest.map(item => `
      <article class="card">
        <p class="date">Uzávierka ${item.date}</p>
        <h2>${escapeHtml(item.start_date)} – ${escapeHtml(item.end_date)}</h2>
        <p>${escapeHtml(item.trigger_event)}</p>
        <p class="stats">${item.events} udalostí · ${item.trends} trendov</p>
        <a href="${item.url}">Otvoriť vydanie</a>
      </article>`).join('');

const archiveHtml = `<!doctype html>
<html lang="sk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Archív vydaní – Vojna na Ukrajine</title>
  <style>
    :root{color-scheme:light;--navy:#142b3c;--paper:#f5f1e8;--line:#c9bfae;--blue:#dcebf2;--red:#9a342f}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:#24333d;font:100%/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}main{width:min(72rem,calc(100% - 2rem));margin:0 auto;padding:3rem 0 5rem}header{max-width:50rem;margin-bottom:2.5rem}h1,h2{color:var(--navy);font-family:Georgia,"Times New Roman",serif}h1{font-size:clamp(2.2rem,7vw,4.8rem);line-height:1.02;margin:.3rem 0 1rem}.eyebrow{color:var(--red);font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:1rem}.card{padding:1.4rem;background:#fff;border:1px solid var(--line);border-radius:.35rem;box-shadow:0 .4rem 1.2rem #142b3c12}.card h2{font-size:1.3rem}.date,.stats{font-size:.85rem;color:#60717d}.card a,.back{display:inline-block;color:var(--navy);font-weight:800;text-decoration-thickness:.12em;text-underline-offset:.2em}.back{margin-top:2.5rem}@media(max-width:420px){main{width:min(100% - 1.2rem,72rem);padding-top:2rem}}
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Analytická databáza</p>
      <h1>Archív vydaní</h1>
      <p>Každé vydanie je nemennou snímkou údajov, zdrojov a analytického článku k uvedenej výskumnej uzávierke.</p>
    </header>
    <section class="grid" aria-label="Vydania">${cards}
    </section>
    <a class="back" href="../">Späť na najnovšie vydanie</a>
  </main>
</body>
</html>
`;

fs.writeFileSync(path.join(archiveRoot, 'index.html'), archiveHtml, 'utf8');
console.log(`Pripravený dist/ s ${manifest.length} archívnym vydaním.`);

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
