#!/usr/bin/env bash
# 從 dreamer868 當日 seen-jids.json 的 git 差異取出當日 JID 清單。
# 背景：司法院 JList「領走即清空」，兩站共用帳號，dreamer868（17:11 UTC）先領；
# credo（17:40 UTC）改讀它的帳本差異，JDoc 不受領取限制。
set -euo pipefail
OUT="${1:-pipeline/.cache/today-jids.json}"
mkdir -p "$(dirname "$OUT")"
git -C /root/www.dreamer868.com diff HEAD~1 HEAD -- pipeline/state/seen-jids.json \
  | grep '^+' | grep -oE '"[A-Z]+,[^"]+"' | jq -s '.' > "$OUT"
echo "取得 $(jq length "$OUT") 筆 → $OUT"
