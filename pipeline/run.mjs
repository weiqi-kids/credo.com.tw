// 借鏡文管線主流程。用法：
//   DRY_RUN=1 node pipeline/run.mjs   # 全流程但不寫正式檔、不記帳本
//   node pipeline/run.mjs             # 正式：寫 md＋記帳本＋published-log（commit 由 cron.sh 做）
// 服務窗：司法院 API 僅台灣 00:00–06:00（UTC 16–22）可用。
import { readFileSync, writeFileSync, mkdirSync, readdirSync, appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { auth, getChangeList, getDoc, fullText } from './judicial.mjs';
import { extractCourtName } from './courts.mjs';
import { prefilterJids, classifyDoc } from './classify.mjs';
import { parseJid } from './jid.mjs';
import { claudePrint } from './claude.mjs';
import { buildRewritePrompt, buildVerifyPrompt } from './rewrite.mjs';
import { gate1, gate2, gate3 } from './gates.mjs';
import { buildMarkdown, buildSlug, judgmentUrlOf } from './markdown.mjs';
import { loadSeen, saveSeen, loadSignatures, saveSignatures, signatureOf, isDuplicateSignature } from './state.mjs';
import { LIMITS, PATHS } from './config.mjs';

const DRY = process.env.DRY_RUN === '1';
const today = new Date().toISOString().slice(0, 10);
const log = (...a) => console.log(`[pipeline]`, ...a);

function quarantine(name, payload) {
  mkdirSync(PATHS.quarantine, { recursive: true });
  writeFileSync(`${PATHS.quarantine}/${today}-${name}.json`, JSON.stringify(payload, null, 1));
}

// 同主題既有文章（標題＋摘要），餵給改寫與查核做撞題防線
function existingOfTopic(topic) {
  const out = [];
  for (const f of readdirSync(PATHS.articles)) {
    if (!f.endsWith('.md')) continue;
    const s = readFileSync(`${PATHS.articles}/${f}`, 'utf8');
    if (!s.includes(`topic: ${topic}`)) continue;
    const t = s.match(/^title: (.+)$/m)?.[1] ?? f;
    const d = s.match(/^description: (.+)$/m)?.[1] ?? '';
    out.push(`${t}｜${d.slice(0, 60)}`);
  }
  return out;
}

function caseNoOf(doc, courtName) {
  const p = parseJid(doc.JID);
  return `${courtName}${p.year}年度${p.jcase}字第${p.no}號`;
}

const user = process.env.JUD_USER, pass = process.env.JUD_PASS;
if (!user || !pass) { console.error('缺 JUD_USER/JUD_PASS（pipeline/.env）'); process.exit(1); }

log(`開始（${DRY ? 'DRY_RUN' : '正式'}）`);
const token = await auth(user, pass);
const days = await getChangeList(token);
const allJids = days.flatMap((d) => d.list || []);
log(`JList 共 ${allJids.length} 筆異動`);

const seen = loadSeen();
const signatures = loadSignatures();
const fresh = prefilterJids(allJids).filter((j) => !seen.has(j));
log(`字別過濾＋帳本去重後剩 ${fresh.length} 筆`);

let published = 0, attempts = 0;
const publishedTopics = new Set();
const publishedFiles = [];

for (const jid of fresh) {
  if (published >= LIMITS.perDayTotal || attempts >= LIMITS.maxRewriteAttemptsPerDay) break;
  let doc;
  try { doc = await getDoc(token, jid); } catch (e) { log(`JDoc 失敗 ${jid}: ${e.message}`); continue; }
  if (!DRY) { seen.add(jid); }
  const hit = classifyDoc(doc);
  if (!hit) continue;
  const { rule } = hit;
  if (publishedTopics.has(rule.topic)) continue;

  const sig = signatureOf(rule, doc);
  if (isDuplicateSignature(signatures, sig, today)) { log(`簽名重複跳過 ${jid} (${sig})`); continue; }

  const courtName = extractCourtName(fullText(doc)) || '法院';
  const caseNo = caseNoOf(doc, courtName);
  const existing = existingOfTopic(rule.topic);
  log(`改編 ${caseNo}（${rule.topic}，score ${hit.score}）`);

  attempts += 1;
  let article;
  try {
    article = await claudePrint(buildRewritePrompt({ doc, rule, caseNo, courtName, existingTitles: existing }), { timeoutMs: 300000 });
  } catch (e) { log(`改編失敗: ${e.message}`); continue; }

  const g1 = gate1(article);
  if (!g1.ok) { log(`閘門一退件: ${g1.problems.join('; ')}`); quarantine(`g1-${jid.replace(/,/g, '_')}`, { article, problems: g1.problems }); continue; }

  attempts += 1;
  let verdict;
  try {
    verdict = await claudePrint(buildVerifyPrompt({ article, doc, existingList: existing }), { timeoutMs: 300000 });
  } catch (e) { log(`查核失敗: ${e.message}`); continue; }
  const g2 = gate2(verdict);
  if (!g2.ok) { log(`閘門二退件: ${g2.problems.join('; ')}`); quarantine(`g2-${jid.replace(/,/g, '_')}`, { article, verdict }); continue; }

  const g3 = await gate3(article, judgmentUrlOf(jid));
  if (!g3.ok) { log(`閘門三退件: ${g3.problems.join('; ')}`); quarantine(`g3-${jid.replace(/,/g, '_')}`, { article, problems: g3.problems }); continue; }

  const slug = buildSlug(rule, doc);
  const md = buildMarkdown({ article, rule, caseNo, courtName, jid, validatedLaws: g3.validated, dateStr: today });
  const outPath = `${PATHS.articles}/${slug}.md`;

  if (DRY) {
    mkdirSync(PATHS.quarantine, { recursive: true });
    writeFileSync(`${PATHS.quarantine}/DRY-${slug}.md`, md);
    log(`✓ DRY 通過全部閘門 → ${PATHS.quarantine}/DRY-${slug}.md`);
  } else {
    writeFileSync(outPath, md);
    // 全站 AI 味稽核（含新檔）——不過就撤檔隔離
    try { execSync('node scripts/audit-ai-tone.mjs', { stdio: 'pipe' }); }
    catch (e) {
      execSync(`mv ${outPath} ${PATHS.quarantine}/aitone-${slug}.md`);
      log(`AI 味稽核退件 ${slug}`);
      continue;
    }
    signatures.push({ sig, date: today, slug });
    appendFileSync(PATHS.publishedLog, `| ${today} | ${article.title} | ${caseNo} | /insights/${rule.category}/${slug}/ |\n`);
    publishedFiles.push(outPath);
    log(`✓ 發佈 ${outPath}`);
  }
  publishedTopics.add(rule.topic);
  published += 1;
}

if (!DRY) { saveSeen(seen); saveSignatures(signatures); }
log(`完成：發佈 ${published} 篇，嘗試 ${attempts} 次 claude 呼叫`);
