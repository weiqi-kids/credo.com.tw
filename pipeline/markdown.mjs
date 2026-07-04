// 借鏡文 md 產生器：文章 JSON ＋ 驗證過的引用連結 → src/content/insights/<slug>.md
import { lawUrl } from './laws.mjs';

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"').replace(/\n/g, ' ');
}

export function judgmentUrlOf(jid) {
  return `https://judgment.judicial.gov.tw/FJUD/data.aspx?ty=JD&id=${encodeURIComponent(jid)}`;
}

export function buildSlug(rule, doc) {
  // slug：topic 前綴＋年度＋號次，穩定且唯一
  const p = doc.JID.split(',');
  return `${rule.topic}-case-${p[1]}-${p[3]}`.toLowerCase();
}

export function buildMarkdown({ article, rule, caseNo, courtName, jid, validatedLaws, dateStr }) {
  const fm = [
    '---',
    `title: ${yamlEscape(article.title)}`,
    `description: ${yamlEscape(article.description)}`,
    `date: "${dateStr}"`,
    `category: ${rule.category}`,
    `topic: ${rule.topic}`,
    'kind: case',
    `caseNo: ${yamlEscape(caseNo)}`,
    `court: ${yamlEscape(courtName)}`,
  ];
  if (article.faq && article.faq.length) {
    fm.push('faq:');
    for (const f of article.faq) {
      fm.push(`  - q: ${yamlEscape(f.q)}`);
      fm.push(`    a: ${yamlEscape(f.a)}`);
    }
  }
  fm.push('---');

  const sources = [
    `- 判決原文：[${caseNo}](${judgmentUrlOf(jid)})——司法院法學資料檢索系統`,
    ...validatedLaws.map((l) => `- [${l.name}第 ${l.article} 條](${l.url})——全國法規資料庫`),
  ];

  return `${fm.join('\n')}

## 案例事實

${article.facts}

## 雙方爭什麼

${article.dispute}

## 法院怎麼說

${article.court}

## 律師評析

${article.analysis}

## 如果你遇到同樣的事

${article.advice}

## 資料來源

${sources.join('\n')}

本文為判決評析，當事人均已化名，個案情況不同，具體權益請洽專業律師。
`;
}
