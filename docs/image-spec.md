# 配圖規格（cover＋內文文繞圖）

## 圖源與授權
- 只用 **Pexels**（免授權可商用，仍一律標攝影者出處）。挑圖時用 WebSearch/WebFetch 找 `pexels.com/photo/…` 頁面，記下**照片數字 ID 與攝影者名**。
- 情境優先亞洲/台灣感（人物、街景、住宅、事務所、文件、長者、家庭）。
- **敏感主題鐵則**：詐欺、失智、資遣、繼承糾紛等負面情境的文章，禁用可辨識的臉部特寫——改用背影、遠景、手部、物件（文件/印章/計算機/房屋）照，避免影射真人。
- **全站不重複**：一張 Pexels 照片（同 ID）全站只能用一次。`npm run check:images` 會擋。

## 下載與檔案
- 一律用工具下載轉 WebP（禁止直接 curl 原圖進 repo）：
  `node scripts/fetch-image.mjs <PexelsID> public/images/covers/<slug>.webp 1200`（cover）
  `node scripts/fetch-image.mjs <PexelsID> public/images/inline/<slug>-1.webp 800`（內文圖，依序 -1 -2 -3…）
- 下載失敗（該 ID 非標準檔名）就換一張，不要硬抓。

## 文章掛圖方式
- frontmatter 加三行：
  ```yaml
  cover: images/covers/<slug>.webp
  coverAlt: （中文描述畫面）
  coverCredit: Photo by <攝影者> on Pexels
  ```
- 內文圖：在每個**主要 H2 段落標題的下一行**插入一張（緊貼 H2 之後、內文之前）：
  `![中文alt描述](/images/inline/<slug>-1.webp "Photo by <攝影者> on Pexels")`
  - title 引號內的出處會自動變成圖說（rehype 外掛處理，左右交錯文繞圖也是自動）
  - **跳過**：資料來源、常見問題/FAQ、時限表這幾種 H2 不配圖
  - 一篇約 3–4 張內文圖＋1 張 cover

## Registry（必寫，稽核依據）
每篇一檔 `docs/image-registry.d/<slug>.json`：
```json
{ "slug": "<slug>",
  "cover": {"file": "images/covers/<slug>.webp", "pexels": 12345, "photographer": "Name"},
  "inline": [{"file": "images/inline/<slug>-1.webp", "pexels": 23456, "photographer": "Name"}] }
```

## 交稿前自查
`node scripts/audit-images.mjs`（檔案存在/來源齊全/無重複）＋ `npm run build` 過。
