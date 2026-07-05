// 圖片稽核（硬性 gate）：
// 1. 全站圖片不重複——同一 Pexels 照片 ID 只能用一次、同一檔案只能屬於一篇文章
// 2. 每張圖都要有 registry 紀錄（來源 ID＋攝影者＝授權出處）
// 3. frontmatter cover 檔案必須存在；registry 記錄的檔案必須存在
// registry＝docs/image-registry.d/<slug>.json，一篇文章一檔：
//   { "slug": "...", "cover": {"file":"images/covers/x.webp","pexels":123,"photographer":"..."},
//     "inline": [{"file":"images/inline/y.webp","pexels":456,"photographer":"..."}] }
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const REG_DIR = 'docs/image-registry.d';
const problems = [];
const byPexels = new Map();
const byFile = new Map();

const regs = existsSync(REG_DIR) ? readdirSync(REG_DIR).filter((f) => f.endsWith('.json')) : [];
for (const f of regs) {
  const r = JSON.parse(readFileSync(`${REG_DIR}/${f}`, 'utf8'));
  const entries = [r.cover, ...(r.inline || [])].filter(Boolean);
  for (const e of entries) {
    if (!e.file || !e.pexels || !e.photographer) { problems.push(`${f}: 條目缺 file/pexels/photographer`); continue; }
    if (!existsSync(`public/${e.file}`)) problems.push(`${f}: 檔案不存在 public/${e.file}`);
    if (byPexels.has(String(e.pexels))) problems.push(`Pexels ${e.pexels} 重複使用：${f} 與 ${byPexels.get(String(e.pexels))}`);
    else byPexels.set(String(e.pexels), f);
    if (byFile.has(e.file)) problems.push(`檔案 ${e.file} 被兩篇使用：${f} 與 ${byFile.get(e.file)}`);
    else byFile.set(e.file, f);
  }
}

// 每篇有 cover 的文章：檔案存在＋有 registry
for (const dir of ['src/content/insights', 'src/content/resources']) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const s = readFileSync(`${dir}/${f}`, 'utf8');
    const cover = s.match(/^cover: *(.+)$/m)?.[1]?.trim();
    if (!cover) continue;
    if (!existsSync(`public/${cover}`)) problems.push(`${f}: cover 檔不存在 public/${cover}`);
    const slug = f.replace(/\.md$/, '');
    if (!existsSync(`${REG_DIR}/${slug}.json`)) problems.push(`${f}: 缺 registry ${REG_DIR}/${slug}.json`);
    // 內文引用的 inline 圖也要存在
    for (const m of s.matchAll(/!\[[^\]]*\]\(\/(images\/[^) ]+)/g)) {
      if (!existsSync(`public/${m[1]}`)) problems.push(`${f}: 內文圖不存在 public/${m[1]}`);
    }
  }
}

if (problems.length) {
  console.error('圖片稽核未過：\n' + problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`圖片稽核通過：${byFile.size} 張圖、${regs.length} 篇 registry，全站無重複。`);
