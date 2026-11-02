// server kecil, data disimpan di data.json
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = __dirname, DB = process.env.DATA || path.join(ROOT, 'data.json'), PORT = process.env.PORT || 3000;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
const alamatLAN = () => Object.entries(os.networkInterfaces()).flatMap(([nama, l]) =>
  l.filter((i) => (i.family === 'IPv4' || i.family === 4) && !i.internal)
    .map((i) => ({ nama, url: 'http://' + i.address + (PORT == 80 ? '' : ':' + PORT) })));
http.createServer((req, res) => {
  const u = req.url.split('?')[0];
  if (u === '/api/alamat') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(alamatLAN()));
  }
  if (u === '/api/db') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(fs.existsSync(DB) ? fs.readFileSync(DB) : 'null');
    }
    if (req.method === 'POST') {
      let b = '';
      req.on('data', c => { b += c; if (b.length > 2e7) req.destroy(); });
      req.on('end', () => {
        try { JSON.parse(b); fs.writeFileSync(DB, b); res.writeHead(200); res.end('ok'); }
        catch (e) { res.writeHead(400); res.end('bad'); }
      });
      return;
    }
  }
  const f = path.join(ROOT, u === '/' ? 'index.html' : decodeURIComponent(u));
  const ext = path.extname(f);
  if (!f.startsWith(ROOT) || !MIME[ext] || path.basename(f) === 'server.js' || !fs.existsSync(f)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': MIME[ext] });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('GameVault berjalan.');
  console.log('  Toko : http://localhost:' + PORT);
  console.log('  Admin: http://localhost:' + PORT + '/admin.html');
  console.log('  QR   : http://localhost:' + PORT + '/qr.html  (untuk dipindai teman)');
  alamatLAN().forEach((a) => console.log('  Dari HP (satu Wi-Fi): ' + a.url));
});
