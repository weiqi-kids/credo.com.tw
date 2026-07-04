# www.credo.com.tw — 維運手冊

詠業商略顧問有限公司官網改版專案。原站 https://credo.com.tw/ （WordPress+Elementor，尚未切換 DNS），
本 repo 為 **Astro 6 靜態站**（骨架同 olderkkk.com），Pages：https://weiqi-kids.github.io/credo.com.tw/
Repo：`weiqi-kids/credo.com.tw`（public）。

**架構、發文方式、設計規範、部署與網域切換 → 全在 `README.md`，改東西前先讀。**

## 硬規則（違反會壞站或壞規範）

1. **顏色只改/只用 `src/styles/tokens.css` 的 token**（oklch 為準＋hex fallback）；元件禁寫死色值。
2. **字級只用 `--text-*` 階梯，最小 18px**；commit 前 `npm run check:fontsize` ＋ `npm run build` 必須全過（CI 也會擋）。
3. **Markdown 文章內鏈用根路徑 Markdown 語法**（`[x](/companysafe/)`），禁 raw HTML `<a>/<img>`——不會被加 base 前綴，上線 404。
4. 有 base 子路徑：`.astro` 內部連結/圖片一律 `import.meta.env.BASE_URL` 前綴，禁寫死 `/xxx`。
5. 商家資訊（公司名/LINE/SCA 連結）只改 `src/lib/site.ts`。
6. 內容以原站為準；發文＝放 `src/content/insights/<slug>.md`（格式見 README）。
7. **選題/找素材對照 `docs/content-taxonomy.md`**（6 服務 × 25 主題 × 台灣搜尋關鍵字＋四種內容代名詞：借鏡文/鎮站文/錦囊/時事文）；文章 frontmatter `topic` 必須是表內 slug（build 會驗證），程式端映射在 `src/lib/site.ts` 的 `SERVICES`。
8. **法域鎖台灣＋引用附原始連結**：只引中華民國法規/判決；法條連結由程式查表生成驗證，禁止手寫或 AI 生成網址。
9. **取文一律走 `src/lib/content.ts` 的 `getPublished()`**（統一 draft 過濾），不要直接 `getCollection`。
10. 整體佈局與生長計畫見 `/root/.claude/plans/smooth-sparking-wall.md`（Phase 2 鎮站文 → Phase 3 借鏡文管線 → Phase 4 錦囊）。

## 待辦（接手進度）

- [ ] DNS 切換：設 repo 變數 `CUSTOM_DOMAIN=credo.com.tw`（deploy.yml 自動處理 CNAME/BASE/SITE）
- [ ] 接 seo-ops：備妥 GA4/GSC 服務帳號與 Slack 頻道後跑 `node /root/seo-ops/bin/site-preflight.mjs`
- [ ] 自動發文 adapter（`/root/seo-ops/adapters/`，等內容產線定案）
