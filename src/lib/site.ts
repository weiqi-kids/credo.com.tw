// 商家資訊唯一來源：要改公司名/聯絡方式/外部連結 → 只改這裡。
export const SITE_NAME = "詠業商略顧問有限公司";
export const SITE_BRAND = "詠業CREDO";
export const LINE_URL = "https://lin.ee/snYsbHA";
export const SCA_URL = "https://sca-ret.com/";
export const COPYRIGHT = "版權所有 © 2023 詠業商略顧問有限公司";

// 文章署名（YMYL/E-E-A-T）：真實律師姓名＋登錄字號後補，補上後全站自動生效。
// 文章 frontmatter `author` 對應這裡的 key；查不到就以 author 字串直接顯示。
export const AUTHORS: Record<string, { name: string; credential: string; bio: string }> = {
  "詠業CREDO 法務團隊": {
    name: "詠業CREDO 法務團隊",
    credential: "執業律師與上市公司法務主管組成",
    bio: "詠業商略顧問由執業律師、ISO27001 資安認證顧問與多家上市公司法務主管組成，專注個人與中小企業的「安全」解決方案。",
  },
};

// 文章分類＝SEO 關鍵字群（新增分類：這裡＋content.config.ts 的 enum 同步改）
// cta：分類頁在說明下方顯示的方案按鈕（選填）
export const CATEGORIES: Record<
  string,
  { label: string; description: string; cta?: { label: string; href: string; external?: boolean } }
> = {
  "corporate-legal": {
    label: "企業法務",
    description:
      "從公司草創到穩定發展，法務訂閱、合約審閱、勞資糾紛預防、營業秘密與專利商標保護——中小企業每個階段會遇到的法律課題。",
  },
  "personal-asset": {
    label: "個人資產保障",
    description:
      "不動產信託、意定監護、防詐措施、資產指定分配——把大半輩子賺來的錢照顧好，需要的是制度而不是運氣。",
  },
  "retirement-security": {
    label: "退休保障",
    description:
      "退休後的財務安全需要法律與信託雙重把關。從退休規劃、防詐到資金控管，專為退休人士整理的實務指南。",
    cta: { label: "SCA退休安心 三寶 專為退休人士設計的退休保障方案！", href: SCA_URL, external: true },
  },
};

// 內容骨架：六大服務 × 主題（選題對照與關鍵字全文見 docs/content-taxonomy.md）。
// 文章 frontmatter `topic` 必須是所屬 category 底下的 slug（content.config.ts 會驗證）。
export interface Topic {
  label: string;
  keywords: string;
}
export interface Service {
  label: string;
  category: keyof typeof CATEGORIES;
  topics: Record<string, Topic>;
}
export const SERVICES: Record<string, Service> = {
  "startup-stage": {
    label: "公司初期",
    category: "corporate-legal",
    topics: {
      "company-formation": { label: "公司設立", keywords: "有限公司與股份有限公司差別、行號與公司比較、資本額規定" },
      "equity-partnership": { label: "股權與合夥", keywords: "股東協議書、合夥拆夥、技術入股、乾股" },
      "contract-basics": { label: "合約基礎", keywords: "合約範本、報價單效力、定型化契約、簽約注意事項" },
      "labor-basics": { label: "勞動基礎", keywords: "勞動契約範本、試用期資遣、勞健保投保、工讀生權益" },
    },
  },
  "growth-stage": {
    label: "高速衝鋒期",
    category: "corporate-legal",
    topics: {
      "labor-disputes": { label: "勞資糾紛", keywords: "資遣費怎麼算、非自願離職、加班費、勞資調解流程、職災賠償" },
      "debt-collection": { label: "債權催收", keywords: "貨款催收、存證信函範本、本票裁定、支付命令" },
      "business-cooperation": { label: "商業合作", keywords: "經銷合約、加盟糾紛、保密協議NDA、違約金上限" },
      "consumer-fairtrade": { label: "消保與公平交易", keywords: "廣告不實罰則、退貨規定、公平會檢舉" },
      "privacy-compliance": { label: "個資法遵", keywords: "個資法罰則、會員資料外洩責任" },
    },
  },
  "mature-stage": {
    label: "穩定發展",
    category: "corporate-legal",
    topics: {
      "trade-secrets": { label: "營業秘密", keywords: "競業禁止條款、離職帶走客戶名單、營業秘密法刑責" },
      "intellectual-property": { label: "智慧財產", keywords: "商標註冊流程費用、專利申請、著作權侵權、抄襲提告" },
      "cybersecurity-compliance": { label: "資安法遵", keywords: "ISO27001認證費用、資安法適用對象、駭客入侵公司責任" },
      "governance-succession": { label: "公司治理與接班", keywords: "董事責任、股權傳承、家族企業接班" },
    },
  },
  "real-estate": {
    label: "不動產管理與信託",
    category: "personal-asset",
    topics: {
      "property-transactions": { label: "買賣糾紛", keywords: "預售屋解約、漏水瑕疵擔保、履約保證、房屋買賣流程" },
      "leasing": { label: "租賃管理", keywords: "租賃專法、房客不搬走、押金不還、包租代管" },
      "title-registration": { label: "產權與繼承登記", keywords: "共有土地分割、借名登記、繼承過戶流程" },
      "real-estate-trust": { label: "不動產信託", keywords: "不動產信託費用、自益信託與他益信託、安養信託" },
    },
  },
  "guardianship-fraud": {
    label: "意定監護及防詐措施",
    category: "personal-asset",
    topics: {
      "adult-guardianship": { label: "意定監護", keywords: "意定監護契約費用、監護宣告與輔助宣告差別、失智財產管理" },
      "elder-fraud-prevention": { label: "高齡防詐", keywords: "投資詐騙追回、假檢警詐騙、被詐騙報警、詐欺提告" },
      "asset-protection": { label: "財產保護", keywords: "監護人動用財產、失智症過戶、安養信託" },
      "medical-autonomy": { label: "醫療自主", keywords: "預立醫療決定、病主法、DNR差別" },
    },
  },
  "asset-distribution": {
    label: "資產指定分配",
    category: "personal-asset",
    topics: {
      "wills": { label: "遺囑", keywords: "自書遺囑範例效力、代筆遺囑、公證遺囑費用" },
      "inheritance": { label: "繼承", keywords: "特留分怎麼算、拋棄繼承期限、遺產分割協議" },
      "estate-tax-planning": { label: "稅務規劃", keywords: "遺產稅免稅額、贈與稅244萬、生前贈與與繼承比較" },
      "trust-succession": { label: "信託傳承", keywords: "遺囑信託、保險金信託、家族信託門檻" },
    },
  },
};

// topic slug → 主題（跨服務彙整，供驗證與顯示）
export const TOPICS: Record<string, Topic & { service: string; category: string }> = Object.fromEntries(
  Object.entries(SERVICES).flatMap(([sKey, s]) =>
    Object.entries(s.topics).map(([tKey, t]) => [tKey, { ...t, service: sKey, category: s.category }])
  )
);

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: SITE_BRAND,
    url: "https://credo.com.tw/",
  };
}
