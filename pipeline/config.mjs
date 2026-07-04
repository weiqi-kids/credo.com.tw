// 借鏡文管線設定：主題分類規則、上限、閘門門檻。
export const MODEL = 'claude-sonnet-5';

export const LIMITS = {
  perTopicPerDay: 1,
  perDayTotal: 2, // 初期保守，品質穩定後再調
  maxPoolPerTopic: 5,
  maxRewriteAttemptsPerDay: 8,
};

export const THRESHOLDS = { relevanceMin: 4, qualityMin: 4, noveltyMin: 3 };

// 裁判類別（JID 第一段最後一字）：V=民事 M=刑事 A=行政
export const ALLOWED_COURT_TYPES = new Set(['V', 'M', 'A']);

// 案由/全文關鍵字 → 25 主題（只列判決量大的主題；命中規則同 dreamer868：案由×3、全文×1）
// order 即平手時優先序。
export const TOPIC_RULES = [
  { topic: 'labor-disputes', category: 'corporate-legal', courtTypes: ['V'], keywords: ['資遣費', '給付工資', '加班費', '確認僱傭關係', '職業災害', '退休金差額', '非自願離職'] },
  { topic: 'trade-secrets', category: 'corporate-legal', courtTypes: ['V', 'M'], keywords: ['營業秘密', '競業禁止', '違反營業秘密法'] },
  { topic: 'debt-collection', category: 'corporate-legal', courtTypes: ['V'], keywords: ['給付貨款', '清償借款', '本票裁定', '支付命令', '給付票款', '清償債務'] },
  { topic: 'business-cooperation', category: 'corporate-legal', courtTypes: ['V'], keywords: ['給付違約金', '經銷', '加盟', '合作契約', '損害賠償等'] },
  { topic: 'equity-partnership', category: 'corporate-legal', courtTypes: ['V'], keywords: ['股東', '出資', '合夥', '股權轉讓', '公司決議'] },
  { topic: 'intellectual-property', category: 'corporate-legal', courtTypes: ['V', 'M'], keywords: ['商標', '著作權', '專利', '侵害商標權', '侵害著作權'] },
  { topic: 'privacy-compliance', category: 'corporate-legal', courtTypes: ['V', 'M'], keywords: ['個人資料保護法', '個資'] },
  { topic: 'inheritance', category: 'personal-asset', courtTypes: ['V'], keywords: ['分割遺產', '確認繼承', '特留分', '繼承回復', '遺產分割'] },
  { topic: 'wills', category: 'personal-asset', courtTypes: ['V'], keywords: ['遺囑無效', '確認遺囑', '遺囑真正'] },
  { topic: 'title-registration', category: 'personal-asset', courtTypes: ['V'], keywords: ['分割共有物', '借名登記', '塗銷所有權移轉登記', '所有權移轉登記'] },
  { topic: 'property-transactions', category: 'personal-asset', courtTypes: ['V'], keywords: ['解除契約', '減少價金', '瑕疵', '給付買賣價金', '預售屋'] },
  { topic: 'leasing', category: 'personal-asset', courtTypes: ['V'], keywords: ['遷讓房屋', '給付租金', '返還押租金', '返還租賃房屋'] },
  { topic: 'elder-fraud-prevention', category: 'personal-asset', courtTypes: ['M'], keywords: ['詐欺', '詐騙', '洗錢防制法', '加重詐欺'] },
  { topic: 'estate-tax-planning', category: 'personal-asset', courtTypes: ['A'], keywords: ['遺產稅', '贈與稅'] },
];

export const PATHS = {
  articles: 'src/content/insights',
  seen: 'pipeline/state/seen-jids.json',
  signatures: 'pipeline/state/signatures.json',
  quarantine: 'pipeline/quarantine',
  publishedLog: 'pipeline/published-log.md',
};

// 爭點簽名視窗：90 天內同簽名（同案不同審級）預設跳過
export const SIGNATURE_WINDOW_DAYS = 90;
