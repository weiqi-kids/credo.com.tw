// 借鏡文改寫與獨立查核的 prompt 建構（claude -p 單輪、只回 JSON）。
import { LAW_PCODES } from './laws.mjs';

const STYLE_RULES = `寫作鐵則（違反即退件）：
- 禁止 AI 味語言：全形括號（）補充句、「不僅…更」「不是/不只是…而是」「並非…而是」、值得注意的是、值得一提、換句話說、總的來說、總結來說、綜上所述、整體而言、真正的問題是、扮演…角色、至關重要、不可或缺、隨著…的發展、在…的今天、讓我們、不妨、你是否曾、希望本文、的燈塔、的見證、重要里程碑、首先…其次…最後、研究顯示、專家認為、有人說。對比句用「是Y，而非X」或正面直述。
- 只引用中華民國（台灣）法規與判決，禁止任何外國法、中國大陸法規、比較法。
- 當事人一律化名（如「一家貿易公司」「陳先生」），禁止出現真實姓名、身分證字號、統一編號、電話、完整地址；判決字號要保留。
- 禁止勝訴保證、招攬用語、「本所/本律師」自稱。
- 語氣：律師對客戶說人話，句子短，繁體中文台灣用語。`;

export function buildRewritePrompt({ doc, rule, caseNo, courtName, existingTitles }) {
  const full = ((doc.JFULLX && doc.JFULLX.JFULLCONTENT) || '').toString().slice(0, 12000);
  const lawList = Object.keys(LAW_PCODES).join('、');
  return `你是台灣執業律師事務所的資深法務編輯。把下面這份判決改寫成一篇「借鏡文」——判決評析文章，讓一般人看懂這個案子的教訓。

判決字號：${caseNo}（${courtName}）
案由：${doc.JTITLE || ''}
主題：${rule.topic}
判決全文（節錄）：
${full}

同主題既有文章標題（你的文章必須提出這些沒講過的新爭點或新教訓）：
${(existingTitles || []).map((t) => `- ${t}`).join('\n') || '（無）'}

${STYLE_RULES}

段落要求：
- facts：案例事實，化名敘事，200-350字，忠於判決
- dispute：雙方爭什麼，100-200字
- court：法院怎麼說，引用判決字號與關鍵法條，200-350字
- analysis：律師評析——這個判決為什麼這樣判、實務上的意義，200-350字
- advice：如果你遇到同樣的事——具體行動建議，150-250字
- laws：文中引用的所有法規，只能從這個清單挑：${lawList}。條號格式如 "17" 或 "9-1"

只輸出 JSON，不要其他文字：
{"title":"口語吸睛標題，含主要關鍵字，25字內","description":"120-150字摘要","facts":"...","dispute":"...","court":"...","analysis":"...","advice":"...","faq":[{"q":"...","a":"80-150字"}],"laws":[{"name":"法規全名","article":"條號"}],"self":{"relevance":1-5,"quality":1-5,"anonymization_ok":true/false}}`;
}

export function buildVerifyPrompt({ article, doc, existingList }) {
  const full = ((doc.JFULLX && doc.JFULLX.JFULLCONTENT) || '').toString().slice(0, 8000);
  return `你是獨立審稿律師，任務是「挑掉不合格的稿件」，寧可錯殺。逐項檢查這篇判決評析文章。

文章 JSON：
${JSON.stringify(article, null, 1).slice(0, 6000)}

判決原文（節錄，用來核對忠實度）：
${full}

同主題既有文章（標題｜摘要）：
${(existingList || []).map((x) => `- ${x}`).join('\n') || '（無）'}

檢查項目：
1. faithful：文章的事實與法院見解是否忠於判決原文，法條與字號引用是否正確
2. jurisdiction_ok：是否只引用中華民國（台灣）法源，出現任何外國法/中國法規即 false
3. ethics_ok：有無勝訴保證、招攬用語、對法院或當事人的不當評論
4. deid_ok：有無真實姓名、身分證、統編、電話、完整地址殘留
5. ai_tone_ok：有無 AI 味句型——全形括號（）、不是/不只是…而是、值得注意的是、換句話說、總的來說、至關重要、讓我們、首先其次最後等
6. novelty：對照既有文章，本篇有沒有新爭點/新見解/不同結果，1-5 分（同樣教訓已寫過給 1-2 分）

只輸出 JSON：
{"faithful":true/false,"jurisdiction_ok":true/false,"ethics_ok":true/false,"deid_ok":true/false,"ai_tone_ok":true/false,"novelty":1-5,"problems":["發現的具體問題"]}`;
}
