// 三道閘門：1) 確定性掃描＋自評門檻 2) 獨立查核 3) 引用連結驗證
import { THRESHOLDS } from './config.mjs';
import { validateCitation, fetchPage } from './laws.mjs';

// 閘門一 a：去識別化正則（沿用 dreamer868，加台灣市話）
const DEID_PATTERNS = [
  { kind: 'national_id', re: /[A-Z][12]\d{8}/g },
  { kind: 'tax_id', re: /統一?編號\s*[:：]?\s*\d{8}/g },
  { kind: 'phone', re: /09\d{2}[-\s]?\d{3}[-\s]?\d{3}/g },
  { kind: 'phone', re: /0\d{1,2}[-\s]?\d{7,8}/g },
  { kind: 'redacted_name', re: /[甲乙丙丁戊][○Ｏ]{1,3}/g },
  { kind: 'address', re: /\d+號\d+樓(?:之\d+)?/g },
  { kind: 'address', re: /[路街段巷弄][^，。、\s]{0,8}?\d+號/g },
];

// 閘門一 b：AI 味句型（與 scripts/check-content.mjs 同清單的核心子集，擋在寫檔前）
const AI_TONE_PATTERNS = [
  /（[^）]*）/, /不僅[^。！？\n]{1,30}(更|還|也)/, /不只?是[^。！？\n]{1,30}(更是|而是)/,
  /並非[^。！？\n]{1,30}而是/, /值得注意的是/, /值得一提/, /換句話說/, /總的來說/, /總結來說/,
  /綜上所述/, /整體而言/, /真正的問題是/, /至關重要/, /不可或缺/, /讓我們/, /不妨/,
  /希望本文/, /的燈塔/, /的見證(?!人)/, /重要里程碑/, /研究顯示/, /專家認為/, /有人說/,
];

export function gate1(article) {
  const text = ['title', 'description', 'facts', 'dispute', 'court', 'analysis', 'advice']
    .map((k) => article[k] || '').join('\n') + '\n' + (article.faq || []).map((f) => f.q + f.a).join('\n');
  const problems = [];
  for (const { kind, re } of DEID_PATTERNS) {
    const m = text.match(re);
    if (m) problems.push(`去識別化殘留 ${kind}: ${m[0]}`);
  }
  for (const re of AI_TONE_PATTERNS) {
    const m = text.match(re);
    if (m) problems.push(`AI 味句型: ${m[0].slice(0, 20)}`);
  }
  const self = article.self || {};
  if (self.anonymization_ok !== true) problems.push('自評 anonymization_ok != true');
  if (Number(self.relevance) < THRESHOLDS.relevanceMin) problems.push(`relevance ${self.relevance} < ${THRESHOLDS.relevanceMin}`);
  if (Number(self.quality) < THRESHOLDS.qualityMin) problems.push(`quality ${self.quality} < ${THRESHOLDS.qualityMin}`);
  return { ok: problems.length === 0, problems };
}

export function gate2(verdict) {
  const problems = [];
  if (!verdict) return { ok: false, problems: ['查核無回應'] };
  for (const k of ['faithful', 'jurisdiction_ok', 'ethics_ok', 'deid_ok', 'ai_tone_ok']) {
    if (verdict[k] !== true) problems.push(`${k}=${verdict[k]}`);
  }
  if (Number(verdict.novelty) < THRESHOLDS.noveltyMin) problems.push(`novelty ${verdict.novelty} < ${THRESHOLDS.noveltyMin}`);
  if (verdict.problems && verdict.problems.length) problems.push(...verdict.problems.map((p) => `查核: ${p}`));
  return { ok: problems.length === 0, problems };
}

// 閘門三：法條連結逐一驗證＋判決連結可達性
export async function gate3(article, judgmentUrl) {
  const problems = [];
  const validated = [];
  for (const { name, article: art } of article.laws || []) {
    const r = await validateCitation(name, art);
    if (!r.ok) problems.push(`法條驗證失敗 ${name}第${art}條: ${r.reason}`);
    else validated.push({ name, article: art, url: r.url });
  }
  if (!(article.laws || []).length) problems.push('未引用任何法條');
  // 判決連結由 JID 決定性組出（格式固定）；data.aspx 對查詢會延遲回應，
  // 這裡驗證檢索系統站台可達即可，避免逐篇長時間等待。
  const { status } = await fetchPage('https://judgment.judicial.gov.tw/FJUD/default.aspx');
  if (status === 0 || status >= 500) problems.push(`司法院檢索系統不可達 HTTP ${status}（判決連結 ${judgmentUrl} 無法驗證）`);
  return { ok: problems.length === 0, problems, validated };
}
