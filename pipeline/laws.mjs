// 法規名 → 全國法規資料庫 pcode 對照表與連結驗證。
// 鐵則：法條連結一律由此查表生成，AI 只輸出 {法規名, 條號}；
// 名稱不在表內或條文頁驗證失敗 → 該篇退件（gate3）。
// 自測：node pipeline/laws.mjs 會逐筆驗證 pcode 是否對應正確法規名。
import https from 'node:https';
import { Resolver } from 'node:dns';

// *.judicial.gov.tw 在本機系統 DNS 會 SERVFAIL（同 judicial.mjs 註記），改走公共 DNS
const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);
function publicDnsLookup(hostname, options, cb) {
  resolver.resolve4(hostname, (err, addrs) => {
    if (err) return cb(err);
    if (!addrs || addrs.length === 0) return cb(new Error(`no A record for ${hostname}`));
    if (options && options.all) return cb(null, addrs.map((a) => ({ address: a, family: 4 })));
    cb(null, addrs[0], 4);
  });
}

export const LAW_PCODES = {
  '民法': 'B0000001',
  '民事訴訟法': 'B0010001',
  '強制執行法': 'B0010004',
  '非訟事件法': 'B0010008',
  '家事事件法': 'B0010048',
  '勞動事件法': 'B0010064',
  '公證法': 'B0010010',
  '中華民國刑法': 'C0000001',
  '刑法': 'C0000001',
  '刑事訴訟法': 'C0010001',
  '公司法': 'J0080001',
  '商業登記法': 'J0080004',
  '營業秘密法': 'J0080028',
  '商標法': 'J0070001',
  '專利法': 'J0070007',
  '著作權法': 'J0070017',
  '公平交易法': 'J0150002',
  '消費者保護法': 'J0170001',
  '個人資料保護法': 'I0050021',
  '資通安全管理法': 'A0030297',
  '勞動基準法': 'N0030001',
  '勞工退休金條例': 'N0030020',
  '勞工保險條例': 'N0050001',
  '就業保險法': 'N0050021',
  '勞資爭議處理法': 'N0020007',
  '就業服務法': 'N0090001',
  '職業安全衛生法': 'N0060001',
  '勞工職業災害保險及保護法': 'N0050031',
  '土地法': 'D0060001',
  '土地登記規則': 'D0060003',
  '租賃住宅市場發展及管理條例': 'D0060125',
  '信託法': 'I0020024',
  '信託業法': 'G0380122',
  '保險法': 'G0390002',
  '票據法': 'G0380028',
  '遺產及贈與稅法': 'G0340072',
  '所得稅法': 'G0340003',
  '稅捐稽徵法': 'G0340001',
  '詐欺犯罪危害防制條例': 'D0080226',
  '洗錢防制法': 'G0380131',
  '病人自主權利法': 'L0020189',
  '安寧緩和醫療條例': 'L0020066',
  '戶籍法': 'D0030006',
};

export function lawUrl(name, article) {
  const pcode = LAW_PCODES[name];
  if (!pcode) return null;
  if (!article) return `https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=${pcode}`;
  // 條號格式：17、9-1（第9條之1）
  const flno = String(article).replace(/第|條|之/g, (m) => (m === '之' ? '-' : '')).trim();
  return `https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=${pcode}&flno=${flno}`;
}

export function fetchPage(url, timeoutMs = 20000) {
  return new Promise((resolve) => {
    const opts = { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: timeoutMs };
    if (new URL(url).hostname.endsWith('judicial.gov.tw')) opts.lookup = publicDnsLookup;
    const req = https.get(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: '' }); });
    req.on('error', () => resolve({ status: 0, body: '' }));
  });
}

// 驗證單一引用：頁面存在且含該條號（LawSingle 頁會出現「第 N 條」字樣）
export async function validateCitation(name, article) {
  const url = lawUrl(name, article);
  if (!url) return { ok: false, url: null, reason: `法規「${name}」不在對照表` };
  const { status, body } = await fetchPage(url);
  if (status !== 200) return { ok: false, url, reason: `HTTP ${status}` };
  const flno = String(article).replace(/第|條/g, '').replace(/之/g, ' 之 ').trim();
  const plain = String(article).replace(/第|條|之/g, (m) => (m === '之' ? '-' : ''));
  const found = body.includes(`第 ${plain.replace('-', '-')} 條`) || body.includes(`第 ${flno} 條`) ||
    new RegExp(`第\\s*${plain.split('-')[0]}(-|\\s*之\\s*)?${plain.split('-')[1] ?? ''}\\s*條`).test(body);
  if (!found) return { ok: false, url, reason: '頁面不含該條號' };
  return { ok: true, url };
}

// 自測：node pipeline/laws.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const names = [...new Set(Object.keys(LAW_PCODES))];
  let bad = 0;
  for (const n of names) {
    const { status, body } = await fetchPage(lawUrl(n));
    const ok = status === 200 && body.includes(n.replace('中華民國刑法', '中華民國刑法'));
    if (!ok || !body.includes(n)) { console.log(`✗ ${n} pcode=${LAW_PCODES[n]} status=${status} 名稱${body.includes(n) ? '符' : '不符'}`); bad += 1; }
    else console.log(`✓ ${n}`);
  }
  console.log(bad ? `\n${bad} 筆待修` : '\n對照表全部正確');
  process.exit(bad ? 1 : 0);
}
