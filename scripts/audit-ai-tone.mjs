// AI 味語言稽核（硬性 gate）：掃 src/content/ 全部 md，命中即 exit 1。
// 清單來源：用戶紅線（禁全形括號旁白）＋ evidencetoday audit-ai-tone 既有清單
// ＋ 2026-07 網路公認 AI 中文特徵（維基百科 AI 味指南、數位時代等）合併版。
// 例外白名單見 ALLOW；新增禁用句型改這裡一處即可。
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = "src/content";

// —— 一、句型禁用（正則）——
const AI_PHRASES = [
  ["（）括號旁白", /（[^）]*）/g],
  ["不僅…更/還/也", /不僅[^。！？\n]{1,30}(更|還|也)/g],
  ["不只是…更是/而是", /不只?是[^。！？\n]{1,30}(更是|而是)/g],
  ["並非…而是", /並非[^。！？\n]{1,30}而是/g],
  ["值得注意的是", /值得注意的是/g],
  ["值得一提", /值得一提/g],
  ["需要注意的是", /需要注意的是/g],
  ["重要的是要", /重要的是要/g],
  ["換句話說", /換句話說/g],
  ["總的來說", /總的來說/g],
  ["總結來說", /總結來說/g],
  ["綜上所述", /綜上所述/g],
  ["整體而言", /整體而言/g],
  ["真正的問題是", /真正的問題是/g],
  ["扮演…角色", /扮演[^。！？\n]{0,12}角色/g],
  ["至關重要", /至關重要/g],
  ["不可或缺", /不可或缺/g],
  ["舉足輕重", /舉足輕重/g],
  ["隨著…的(發展|普及|進步)", /隨著[^。！？\n]{1,20}的(發展|普及|進步)/g],
  ["在…的今天", /在[^。！？\n]{1,16}的今天/g],
  ["近年來（開頭空泛）", /^近年來/m],
  ["讓我們", /讓我們/g],
  ["不妨", /不妨/g],
  ["你是否曾", /你是否曾/g],
  ["希望本文", /希望本文/g],
  ["相信透過", /相信透過/g],
  ["燈塔/見證/里程碑式拔高", /(的燈塔|的見證(?!人)|重要里程碑)/g],
  ["首先…其次…最後", /首先[^]{0,200}其次[^]{0,200}最後/g],
];

// —— 二、模糊引用（法律版：主張要嘛附法條/判決字號，要嘛刪）——
const VAGUE_REFS = ["研究顯示", "有研究指出", "專家認為", "學者認為", "有人說", "普遍認為", "業界普遍"];

// —— 三、模板化開頭（正文第一句）——
const BANNED_OPENINGS = [/^我[^們]/, /^老實(講|說)/, /^最近[，,]?\s*有(讀者|客戶|朋友)/, /^在這個/, /^隨著/, /^近年來/];

// —— 白名單：法律固定用語，命中不算違規 ——
const ALLOW = [/民國\d+年/, /第\d+條(之\d+)?/];

function firstBodyLine(text) {
  const lines = text.split(/\r?\n/);
  let fm = 0;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (t === "---") { fm += 1; continue; }
    if (fm < 2) continue;
    if (!t) continue;
    if (/^(#|!\[|<|>|\||[-*]\s)/.test(t)) continue;
    return t;
  }
  return null;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".md") || p.endsWith(".mdx")) out.push(p);
  }
  return out;
}

let bad = 0;
for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  const findings = [];
  const opening = firstBodyLine(text);
  if (opening && BANNED_OPENINGS.some((re) => re.test(opening))) {
    findings.push(`模板化開頭「${opening.slice(0, 16)}…」`);
  }
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [label, re] of AI_PHRASES) {
      const m = line.match(re);
      re.lastIndex = 0;
      if (m && !ALLOW.some((a) => m.every((x) => a.test(x)))) {
        findings.push(`L${i + 1} ${label}：${m[0].slice(0, 30)}`);
      }
    }
    for (const v of VAGUE_REFS) {
      if (line.includes(v)) findings.push(`L${i + 1} 模糊引用：${v}`);
    }
  });
  if (findings.length) {
    bad += 1;
    console.error(`\n✗ ${file}`);
    for (const f of findings) console.error(`   ${f}`);
  }
}
if (bad) {
  console.error(`\nAI 味稽核未過：${bad} 檔有違規。清單見 scripts/audit-ai-tone.mjs。`);
  process.exit(1);
}
console.log("AI 味稽核通過：無違規句型。");
