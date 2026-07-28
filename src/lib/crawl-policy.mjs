// 收錄政策開關（2026-07-28 建立）
//
// 背景：DNS 於 2026-07-28 切換，本站成為正式站，但 CLAUDE.md 記載的
// 「現有文章為初稿等級、未達律師品牌文體標準」仍然成立。文體細修完成前，
// 不讓搜尋引擎與 AI 爬蟲收錄 /insights/，避免初稿內容先被索引、
// 之後改寫還要處理既有排名與快取。
//
// 放行方式（文體達標且用戶點頭後）：把 INSIGHTS_CRAWLABLE 改成 true，
// robots.txt 的 Disallow 與 sitemap 的排除會同時解除，重新 build/push 即生效。
// 這是唯一的開關，robots.txt.ts 與 astro.config.mjs 都讀這裡，不要各自改。
//
// 注意：Disallow 只擋爬取，不擋使用者瀏覽——/insights/ 對真人仍完全正常，
// 首頁與方案頁的「最新法律新知」區塊也照常顯示。

export const INSIGHTS_CRAWLABLE = false;

// robots Disallow 與 sitemap 排除共用的路徑片段（相對站根，前後都帶斜線）。
export const INSIGHTS_PATH = "/insights/";
