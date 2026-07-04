// 判決 → 主題分類（案由命中 ×3、全文命中 ×1，門檻同 dreamer868：<2 不收）
import { TOPIC_RULES, ALLOWED_COURT_TYPES } from './config.mjs';
import { courtTypeOf, parseJid } from './jid.mjs';

// 排除非敘事性文書字別：司法事務官（司執/司促/司票…）、保全/裁定/聲請類。
// 這些是格式化裁定，無案例故事價值，且常缺當事人敘述導致改編品質崩壞。
const EXCLUDED_JCASE = /司|促|執|票|全|抗|聲|補|救|除|催|字第/;

export function prefilterJids(jids) {
  return jids.filter((j) => {
    if (!ALLOWED_COURT_TYPES.has(courtTypeOf(j))) return false;
    const p = parseJid(j);
    if (!p) return false;
    return !EXCLUDED_JCASE.test(p.jcase);
  });
}

export function classifyDoc(doc) {
  const title = (doc.JTITLE || '').toString();
  const full = ((doc.JFULLX && doc.JFULLX.JFULLCONTENT) || '').toString();
  const courtType = courtTypeOf(doc.JID);

  let best = null;
  for (const rule of TOPIC_RULES) {
    if (rule.courtTypes.length && !rule.courtTypes.includes(courtType)) continue;
    let score = 0;
    for (const kw of rule.keywords) {
      if (title.includes(kw)) score += 3;
      if (full.includes(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }
  if (!best || best.score < 2) return null;
  return best;
}
