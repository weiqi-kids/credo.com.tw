import type { APIRoute } from "astro";

// 開放搜尋引擎與 AI 爬蟲（AEO/GEO 慣例，同 olderkkk）。
// 注意：GitHub Pages 子路徑期間本檔不在網域根目錄、不會生效；
// CUSTOM_DOMAIN 切換後（BASE=/）即自動生效。
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const sitemap = new URL(`${base}sitemap-index.xml`, site);
  const body = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
