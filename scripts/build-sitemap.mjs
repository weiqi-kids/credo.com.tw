#!/usr/bin/env node
/**
 * build-sitemap.mjs — 掃描全站靜態頁面，重建 sitemap.xml 與 insights 文章列表。
 *
 * 自動發文管線的唯一接口：
 *   1. 把文章放到 insights/<category>/<slug>/index.html
 *      （必含 <title>、<meta name="description">、<meta name="date" content="YYYY-MM-DD">）
 *   2. 跑 `node scripts/build-sitemap.mjs`
 *   → sitemap.xml、insights/index.html 與各分類頁列表全部自動更新。
 *
 * 網域切換：預設用 GitHub Pages 子路徑；DNS 切到正式站後改跑
 *   SITE_URL=https://credo.com.tw node scripts/build-sitemap.mjs
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { globSync } from 'node:fs';
import { dirname, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = (process.env.SITE_URL ?? 'https://weiqi-kids.github.io/credo.com.tw').replace(/\/$/, '');

const CATEGORIES = {
  'corporate-legal': '企業法務',
  'personal-asset': '個人資產保障',
  'retirement-security': '退休保障',
};

// —— 收集頁面 ——
const pages = globSync('**/index.html', { cwd: ROOT, exclude: (p) => p.includes('node_modules') })
  .map((rel) => {
    const url = rel === 'index.html' ? '' : rel.replace(/index\.html$/, '');
    const html = readFileSync(join(ROOT, rel), 'utf8');
    const meta = (name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1] ?? null;
    const m = rel.match(/^insights\/([^/]+)\/([^/]+)\/index\.html$/);
    return {
      rel, url,
      title: html.match(/<title>([^<]*)<\/title>/)?.[1] ?? url,
      description: meta('description') ?? '',
      date: meta('date'),
      category: m ? m[1] : null,
      slug: m ? m[2] : null,
      lastmod: (meta('date') ?? statSync(join(ROOT, rel)).mtime.toISOString()).slice(0, 10),
    };
  });

const articles = pages
  .filter((p) => p.category && CATEGORIES[p.category])
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

for (const a of articles) {
  if (!a.date) console.warn(`⚠ ${a.rel} 缺 <meta name="date">，列表排序會靠後`);
}

// —— 重建列表（頁面內 INSIGHTS:LIST 標記之間）——
function renderList(items, base) {
  if (!items.length) return '        <p class="section-sub">文章籌備中，敬請期待。</p>';
  return items.map((a) => `        <a class="insight-item" href="${relative(base, a.rel.replace(/index\.html$/, '')) || '.'}/">
          <span class="insight-cat">${CATEGORIES[a.category]}</span>
          <span class="insight-title">${a.title.split('—')[0].trim()}</span>
          <span class="insight-date">${a.date ?? ''}</span>
          <span class="insight-desc">${a.description}</span>
        </a>`).join('\n');
}

const START = '<!-- INSIGHTS:LIST:START -->', END = '<!-- INSIGHTS:LIST:END -->';
const listPages = [
  { rel: 'insights/index.html', items: articles },
  ...Object.keys(CATEGORIES).map((c) => ({
    rel: `insights/${c}/index.html`,
    items: articles.filter((a) => a.category === c),
  })),
];
for (const { rel, items } of listPages) {
  const path = join(ROOT, rel);
  let html;
  try { html = readFileSync(path, 'utf8'); } catch { continue; }
  const s = html.indexOf(START), e = html.indexOf(END);
  if (s === -1 || e === -1) { console.warn(`⚠ ${rel} 缺列表標記，跳過`); continue; }
  const next = html.slice(0, s + START.length) + '\n' + renderList(items, dirname(rel)) + '\n        ' + html.slice(e);
  if (next !== html) { writeFileSync(path, next); console.log(`✎ 列表更新 ${rel}（${items.length} 篇）`); }
}

// —— 產 sitemap.xml ——
function priority(p) {
  if (p.url === '') return '1.0';
  if (p.category) return '0.6';
  if (p.url.startsWith('insights')) return '0.7';
  return '0.8';
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url>
    <loc>${SITE}/${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.url.startsWith('insights') && !p.category ? 'daily' : p.category ? 'monthly' : 'weekly'}</changefreq>
    <priority>${priority(p)}</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`✓ sitemap.xml：${pages.length} 頁（${articles.length} 篇文章）｜SITE_URL=${SITE}`);
