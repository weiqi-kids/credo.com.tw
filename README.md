# credo.com.tw — 詠業商略顧問有限公司

接手 https://credo.com.tw/ （原站 WordPress 7.0 + Elementor 4.1.4）的改版專案。
**Astro 6 靜態網站**（骨架同 olderkkk.com），部署 GitHub Pages：
**https://weiqi-kids.github.io/credo.com.tw/**

## 技術棧 / 常用指令

Astro 6 + @astrojs/sitemap，純靜態、無 JS framework、無外部 CDN。**Node ≥ 22.12**。

```bash
npm install
npm run dev              # 本機開發（有 base：http://localhost:4321/credo.com.tw/）
npm run build            # 產生 dist/
npm run check:design     # 設計規範守門 v2：px 字級/顏色 token/!important/CDN/css 白名單
```

## 部署

- push `main` → GitHub Actions（`.github/workflows/deploy.yml`）自動 build & 部署 Pages。
- 修改後務必：`npm run build` 成功（內含 `check:design` 守門），再 commit/push。
- **正式網域切換總開關**（同 olderkkk）：DNS 就緒後設 repo 變數
  `CUSTOM_DOMAIN=credo.com.tw` 即自動改用 `BASE_PATH=/`、寫入 CNAME；未設時維持子路徑。

## 頁面與內容

| 路由 | 來源 | 內容 |
|------|------|------|
| `/` | `src/pages/index.astro` | 首頁（Hero、法人/自然人入口、合作實績、LINE CTA） |
| `/companysafe/` | `src/pages/companysafe.astro` | 企業安全三階段方案 |
| `/naturalpersonsafe/` | `src/pages/naturalpersonsafe.astro` | 個人安全三大方案 |
| `/startup/` | `src/pages/startup.astro` | 服務流程三步驟 + LINE QR |
| `/insights/` | `src/pages/insights/` | 法律新知（總索引/分類/文章，路由自動生成） |

### 自動發文（SEO 文章區，對齊 olderkkk / dreamer868 模式）

**發一篇文章＝放一個 md 檔**：`src/content/insights/<slug>.md`（檔名＝URL slug），frontmatter：

```yaml
title: 文章標題
description: 150 字內摘要（會成為 meta description 與列表摘要）
date: "YYYY-MM-DD"
category: corporate-legal | personal-asset | retirement-security
keywords: 逗號分隔（選填）
faq:              # 選填：渲染成可見 FAQ 區塊 + FAQPage schema（AEO）
  - q: 問題
    a: 答案
```

- 路由自動成為 `/insights/<category>/<slug>/`，列表頁、分類頁、sitemap 全自動更新（`@astrojs/sitemap`）。

### 內容路由：一個 md 進來，會自動出現在哪裡

**所有文章實體檔都在同一個資料夾 `src/content/insights/`（不分子目錄）**，「分開顯示」完全由 frontmatter 的 `category`＋`topic` 決定，各頁面 build 時按條件撈取：

| 自動曝光位置 | 撈取條件 |
|---|---|
| `/insights/` 總索引 | 全部文章 |
| `/insights/<category>/` 分類頁 | `category` 相符 |
| `/insights/<category>/topic/<topic>/` 主題頁 | `topic` 相符（有文才開門） |
| `/companysafe/` 尾段「最新法律新知」 | `category: corporate-legal` 最新 3 篇 |
| `/naturalpersonsafe/` 尾段「最新法律新知」 | `category: personal-asset` 最新 3 篇 |
| 首頁尾段「最新法律新知」 | 全站最新 3 篇 |

三個新知區塊共用 `LatestInsights.astro` 元件（selector 相同、內容不同，差在 `category` 參數）。互鏈卡（導讀卡/案例卡/同主題推薦）也由 `topic` 自動接線。標錯 `category`/`topic` 會直接 build 失敗，不會默默放錯區。
- 文章內部連結用 Markdown 語法寫根路徑（如 `[企業安全](/companysafe/)`），rehype 會自動加 base 前綴；**勿用 raw HTML `<a>/<img>`**（不會被加前綴，上線 404）。
- 分類＝SEO 關鍵字群：企業法務（法務訂閱/合約審閱/勞資/營業秘密/ISO27001）、
  個人資產保障（不動產信託/意定監護/防詐/資產分配）、退休保障（退休規劃/SCA）。
  新增分類：改 `src/lib/site.ts` 的 `CATEGORIES` ＋ `src/content.config.ts` 的 enum。
- **主題（topic）採「有文才開門」**：`/insights/<分類>/topic/<主題>/` 只為「至少 1 篇文章」的主題生成（thin content 防線）；分類頁主題卡有文章才變連結並顯示篇數，文章 meta 的主題標籤連回主題頁。選題對照 `docs/content-taxonomy.md`。

## 設計規範（團隊標準）

- **OKLCH 配色 + hex fallback**，token 唯一來源 `src/styles/variables.css`（源自原站 Elementor 色票：金棕 `#CDAD7D` 系）；元件只用 `var(--…)`。
- **字級一律 `--text-xs … --text-3xl` 階梯，最小 18px，無例外**；`scripts/check-design.mjs`（設計規範守門 v2，2026-07-20 全站統一）會擋所有 px 字級、token 外顏色、`!important`、外部 CDN、白名單外 css 檔（deploy workflow 內也有 gate）。
- 禁：`!important`、px 硬編 font-size、外部 CDN（系統字型堆疊）。
- RWD mobile-first，斷點只用 `min-width` 640 / 768 / 1024。
- **商家資訊唯一來源 `src/lib/site.ts`**（公司名/LINE/SCA 連結/版權），改聯絡方式只改這裡。
- 結構化資料：`Base.astro` 全站輸出 Organization；文章頁自動輸出 Article（+FAQPage）。

## SEO

- `robots.txt`：`src/pages/robots.txt.ts`（開放 GPTBot/PerplexityBot/ClaudeBot/Google-Extended，指向 sitemap-index.xml）。子路徑期間不生效（robots 必須在網域根目錄），CUSTOM_DOMAIN 切換後自動生效。
- sitemap：`@astrojs/sitemap` 產 `sitemap-index.xml`，URL 隨 SITE_URL/BASE_PATH 自動切換。
- 尚未接 seo-ops（GA4/GSC/Slack 憑證備妥後走 `site-preflight.mjs` 流程）。

## 對原站的刻意差異

- 原站 header 無選單，本版加入四頁導覽連結。
- 原文「圖隊成員」修正為「團隊成員」（naturalpersonsafe 頁）。
- 原站 Google Fonts（Roboto 等）改為系統字型堆疊。
- 新增 `/insights/` 法律新知文章區（原站沒有）。
