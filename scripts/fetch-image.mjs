// 取圖工具：從 Pexels CDN 下載並轉 WebP 自家託管（house 規範：無外部 CDN、先壓再上）。
// 用法：
//   node scripts/fetch-image.mjs <pexels照片ID或完整images.pexels.com網址> <輸出路徑.webp> [寬度=1200]
// 例：node scripts/fetch-image.mjs 5668473 public/images/covers/foo.webp 1200
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [src, out, w = '1200'] = process.argv.slice(2);
if (!src || !out) { console.error('用法: fetch-image.mjs <pexels-id|url> <out.webp> [width]'); process.exit(1); }
const url = /^\d+$/.test(src)
  ? `https://images.pexels.com/photos/${src}/pexels-photo-${src}.jpeg?auto=compress&cs=tinysrgb&w=${Math.min(Number(w) * 2, 2400)}`
  : src;

const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
if (!res.ok) { console.error(`下載失敗 HTTP ${res.status}: ${url}`); process.exit(1); }
const buf = Buffer.from(await res.arrayBuffer());
mkdirSync(path.dirname(out), { recursive: true });
const img = sharp(buf);
const meta = await img.metadata();
await img.resize({ width: Math.min(Number(w), meta.width), withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
const { size } = await import('node:fs').then((fs) => fs.statSync(out));
console.log(`${out} ${meta.width}x${meta.height} -> ${(size / 1024).toFixed(0)}K`);
