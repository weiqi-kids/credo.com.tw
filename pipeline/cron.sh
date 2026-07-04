#!/usr/bin/env bash
# 借鏡文每日產線包裝：載 .env → run.mjs → build gate → commit+push。
# 排程（伺服器為 UTC；服務窗＝台灣 0–6 ＝ UTC 16–22，錯開 dreamer868 的 17:11）：
#   40 17 * * * /root/www.credo.com.tw/pipeline/cron.sh >> /root/www.credo.com.tw/pipeline/.cache/cron.log 2>&1
# ※ 尚未安裝 cron（依用戶指示），手動跑：pipeline/cron.sh
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
set -a; [ -f pipeline/.env ] && . pipeline/.env; set +a

node pipeline/run.mjs || echo "[cron] run.mjs 非零退出"

if [ "${DRY_RUN:-}" = "1" ]; then echo "[cron] DRY_RUN — 不 commit"; exit 0; fi

npm run check:aitone && npm run check:fontsize && npm run build

git add src/content/insights pipeline/state pipeline/published-log.md
if git diff --cached --quiet; then
  echo "[cron] 無新文章"
else
  git -c user.name="credo-pipeline" -c user.email="lightman.chang@gmail.com" commit -m "content: auto-publish case insight ($(date -u +%F))"
  git push origin main
  echo "[cron] 已發佈推送"
fi
