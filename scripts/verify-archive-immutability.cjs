'use strict';

const { execFileSync } = require('node:child_process');

const base = process.argv[2] || 'origin/main';

try {
  execFileSync('git', ['rev-parse', '--verify', base], { stdio: 'ignore' });
} catch {
  console.error(`CHYBA: Git referencia ${base} nie je dostupná.`);
  process.exit(1);
}

let output = '';
try {
  output = execFileSync('git', ['diff', '--name-status', `${base}...HEAD`, '--', 'editions'], { encoding: 'utf8' }).trim();
} catch (error) {
  console.error(`CHYBA: Archív sa nepodarilo porovnať: ${error.message}`);
  process.exit(1);
}

const forbidden = output.split(/\r?\n/).filter(Boolean).filter(line => !line.startsWith('A\t'));
if (forbidden.length) {
  console.error('CHYBA: Existujúce archívne vydania sú nemenné. Zakázané zmeny:');
  forbidden.forEach(line => console.error(`- ${line}`));
  process.exit(1);
}

console.log('Archívna nemennosť je zachovaná.');
