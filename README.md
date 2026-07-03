# credo.com.tw — 詠業商略顧問有限公司（靜態復刻）

接手 https://credo.com.tw/ （原站 WordPress 7.0 + Elementor 4.1.4，佈景 Velux）前的靜態復刻版，
部署於 GitHub Pages：**https://weiqi-kids.github.io/credo.com.tw/**

## 頁面

| 路徑 | 對應原站 | 內容 |
|------|----------|------|
| `/` | `https://credo.com.tw/` | 首頁：Hero、法人/自然人入口、生活與法律、合作與實績、聯絡 CTA |
| `/companysafe/` | `/companysafe` | 企業安全三階段方案 |
| `/naturalpersonsafe/` | `/naturalpersonsafe` | 個人安全三大方案 |
| `/startup/` | `/startup` | 服務流程三步驟 + LINE QR |

## 設計規範（沿用團隊標準）

- **配色一律 oklch**：所有顏色定義在 `assets/css/style.css` 的 `:root` token，
  色票由原站 Elementor CSS 轉換而來：
  - `--brand` `oklch(0.764 0.074 77.4)`（原 `#CDAD7D` 金棕主色）
  - `--brand-mid` / `--brand-light`（原 `#DBBF94` / `#E8D1AE`）
  - `--paper` `oklch(0.959 0.007 80.7)`（原 `#F4F1EC` 暖米白底）
  - `--overlay`（原 `#A2ACB0F7` 藍灰遮罩）
- **字級一律走 `--text-xs … --text-3xl` 階梯**（`--text-base` 為內文下限），
  禁止 px 硬編 font-size、禁止 `!important`。
- RWD：mobile-first，斷點只用 `min-width` 640 / 768 / 1024。
- 圖片素材取自原站 `wp-content/uploads/`，改為 ASCII 檔名置於 `assets/img/`。
- 純靜態 HTML/CSS，無外部 CDN、無 JS。

## 部署

GitHub Pages，`main` branch 根目錄直接發佈（含 `.nojekyll`）。
未來 DNS 切換到本 repo 時再加 `CNAME`（`credo.com.tw`）並於 repo Settings → Pages 設定 custom domain。

## 對原站的刻意差異

- 原站 header 無選單，本版加入三頁導覽連結（方便驗收瀏覽，可移除）。
- 原文「圖隊成員」修正為「團隊成員」（naturalpersonsafe 頁）。
- 原站 Google Fonts（Roboto 等）改為系統字型堆疊，符合「無外部 CDN」規範。
