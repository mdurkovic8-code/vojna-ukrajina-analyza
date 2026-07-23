'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`CHYBA: Neexistuje adresár ${root}.`);
  process.exit(1);
}

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  let file = candidate;
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Server beží na http://127.0.0.1:${port}`));
