import type { APIRoute } from "astro";
import { INSIGHTS_CRAWLABLE, INSIGHTS_PATH } from "../lib/crawl-policy.mjs";

// 開放搜尋引擎與 AI 爬蟲（AEO/GEO 慣例，同 olderkkk）。
// 2026-07-28 起：文體細修期間 /insights/ 暫不開放收錄，
// 開關在 src/lib/crawl-policy.mjs（sitemap 排除也讀同一個），不要只改這裡。
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const sitemap = new URL(`${base}sitemap-index.xml`, site);
  // base 結尾必有斜線，INSIGHTS_PATH 開頭也是，去掉重複的那一個。
  const insights = `${base.replace(/\/$/, "")}${INSIGHTS_PATH}`;
  const disallow = INSIGHTS_CRAWLABLE ? "" : `Disallow: ${insights}\n`;
  const agents = ["*", "GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"];
  const blocks = agents
    .map((ua) => `User-agent: ${ua}\nAllow: /\n${disallow}`)
    .join("\n");
  const body = `${blocks}\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
