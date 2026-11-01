// 서울 문화행사 찾기 — 시작 상태. 의존성 없이 Node만으로 돈다(Node 22 이상).
// GET /api/events → data/events.json(서울 열린데이터광장 문화행사 정보 스냅숏)을 그대로 돌려준다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT ?? 5180);
const ROOT = fileURLToPath(new URL('.', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg' };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/events') {
    const rows = JSON.parse(await readFile(join(ROOT, 'data/events.json'), 'utf8'));
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(rows));
  }
  const file = normalize(join(ROOT, 'public', url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(join(ROOT, 'public'))) { res.writeHead(403); return res.end(); }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
