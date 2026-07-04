// 商家資訊唯一來源：要改公司名/聯絡方式/外部連結 → 只改這裡。
export const SITE_NAME = "詠業商略顧問有限公司";
export const SITE_BRAND = "詠業CREDO";
export const LINE_URL = "https://lin.ee/snYsbHA";
export const SCA_URL = "https://sca-ret.com/";
export const COPYRIGHT = "版權所有 © 2023 詠業商略顧問有限公司";

// 文章分類＝SEO 關鍵字群（新增分類：這裡＋content.config.ts 的 enum 同步改）
export const CATEGORIES: Record<string, { label: string; description: string }> = {
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
  },
};

export function orgSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: SITE_BRAND,
    url: "https://credo.com.tw/",
  };
}
