# www.credo.com.tw — 維運手冊

詠業商略顧問有限公司官網改版專案。原站 https://credo.com.tw/ （WordPress+Elementor，尚未切換 DNS），
本 repo 為 **Astro 6 靜態站**（骨架同 olderkkk.com），Pages：https://weiqi-kids.github.io/credo.com.tw/
Repo：`weiqi-kids/credo.com.tw`（public）。

**架構、發文方式、設計規範、部署與網域切換 → 全在 `README.md`，改東西前先讀。**

## 硬規則（違反會壞站或壞規範）

1. **設計規範守門 v2（2026-07-20 全站統一，`scripts/check-design.mjs`，`npm run build` 前自動跑、CI 也擋）五條**：
   ① font-size 禁 px，一律 `var(--text-*)` 階梯（最小 18px）；② 顏色（hex/rgb/hsl）只准出現在 `src/styles/variables.css`（oklch 為準＋hex fallback），元件禁寫死色值；③ 禁 `!important`；④ 禁外部 CDN（fonts.googleapis/cdnjs/unpkg/jsdelivr）；⑤ `src/` 下 `.css` 只准 `src/styles/{variables,global}.css`，元件樣式用 scoped `<style>`。
2. **內容守門（去 AI 味）v2（2026-07-21 統一為 new-astro-site skill 引擎，`scripts/check-content.mjs`，`npm run build` 前自動跑、CI 也擋）**：舊自有 `scripts/audit-ai-tone.mjs`（`check:aitone`）已移除。統一引擎＝兩級（ERROR 擋 build／WARN 軟訊號跨 ≥3 層才升級）＋grandfather（預設只掃相對 `origin/main` 的變動 `.md/.mdx`，存量不追殺；`--all` 全站盤點不擋）。credo 特化已 port 進檔內 `SITE_ERROR_TELLS`（全形括號旁白 `（…）`＝用戶紅線、扮演…角色）與 `ALLOW`（法律用語 `民國\d+年`／`第\d+條` 免誤判）；核心跨站規則勿改。指令：`check:content`（變動檔）／`check:content:all`（全站）。**法律主張稽核 `check:legal`、配圖稽核 `check:images` 為非 AI 腔守門，保留不動。**
3. commit 前 `npm run build` 必須全過（內含 `check:design` + `check:content`；舊 `check:fontsize`/`check:aitone` 已移除）。
4. **Markdown 文章內鏈用根路徑 Markdown 語法**（`[x](/companysafe/)`），禁 raw HTML `<a>/<img>`——不會被加 base 前綴，上線 404。
5. 有 base 子路徑：`.astro` 內部連結/圖片一律 `import.meta.env.BASE_URL` 前綴，禁寫死 `/xxx`。
6. 商家資訊（公司名/LINE/SCA 連結）只改 `src/lib/site.ts`。
7. 內容以原站為準；發文＝放 `src/content/insights/<slug>.md`（格式見 README）。
8. **選題/找素材對照 `docs/content-taxonomy.md`**（6 服務 × 25 主題 × 台灣搜尋關鍵字＋四種內容代名詞：借鏡文/鎮站文/錦囊/時事文）；文章 frontmatter `topic` 必須是表內 slug（build 會驗證），程式端映射在 `src/lib/site.ts` 的 `SERVICES`。
9. **法域鎖台灣＋引用附原始連結**：只引中華民國法規/判決；法條連結由程式查表生成驗證，禁止手寫或 AI 生成網址。
10. **取文一律走 `src/lib/content.ts` 的 `getPublished()`**（統一 draft 過濾），不要直接 `getCollection`。
11. 整體佈局與生長計畫見 `/root/.claude/plans/smooth-sparking-wall.md`（Phase 2 鎮站文 → Phase 3 借鏡文管線 → Phase 4 錦囊）。

## 現階段：文章製作流程細修（2026-07-04 起）

**用戶判定現有 31 篇為初稿等級、未達律師品牌文體標準。** 細修完成前：不掛 cron、新文章產製先讀 `docs/lessons-writing.md`（文體失敗模式與有效手段）再動筆。

## 借鏡文管線（pipeline/）

- 每日產線：`pipeline/cron.sh`（**尚未掛 cron**，排程建議 UTC 17:40）；乾跑 `DRY_RUN=1`。
- **司法院 JList 領走即清空且與 dreamer868 共用帳號**：dreamer868 17:11 UTC 先領，credo 用 `pipeline/sibling-jids.sh` 從它的帳本 git 差異取當日清單（JDoc 不受限）。若 credo 要獨立，需另辦司法院資料開放平臺帳號。
- 三道閘門：去識別化＋AI味＋自評 → 獨立查核（忠實/法域/倫理/新穎性）→ 法條連結查表驗證（`pipeline/laws.mjs`，42 部法規 pcode 已全數驗證）。退件進 `pipeline/quarantine/`。
- 發佈紀錄 `pipeline/published-log.md`（先發後審，律師抽查用）；下架＝`git revert`。

## 待辦（接手進度）

- [ ] **特留分修法進度每月檢視**（律師查核報告 2026-07-14 指示）：查立法院院會處理進度；**三讀通過當日**需改寫 forced-share-reform-guide 的「進度」與「迷思」兩節

- [ ] DNS 切換：設 repo 變數 `CUSTOM_DOMAIN=credo.com.tw`（deploy.yml 自動處理 CNAME/BASE/SITE）
- [ ] 接 seo-ops：備妥 GA4/GSC 服務帳號與 Slack 頻道後跑 `node /root/seo-ops/bin/site-preflight.mjs`
- [ ] 文章製作流程細修（進行中的階段，品質達標為 cron 前置條件）
- [ ] 借鏡文 cron 排程（文體達標＋用戶點頭後：`40 17 * * *`）＋司法院獨立帳號
- [ ] seo-ops 接入時寫 adapter 偵測 published-log
