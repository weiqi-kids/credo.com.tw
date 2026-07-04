// 判決 → 主題分類（案由命中 ×3、全文命中 ×1，門檻同 dreamer868：<2 不收）
import { TOPIC_RULES, ALLOWED_COURT_TYPES } from './config.mjs';
import { courtTypeOf } from './jid.mjs';

export function prefilterJids(jids) {
  return jids.filter((j) => ALLOWED_COURT_TYPES.has(courtTypeOf(j)));
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
