import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 法律新知文章（自動發文管線的落點）：src/content/insights/<slug>.md
// 檔名＝URL slug，路由為 /insights/<category>/<slug>/
const insights = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/insights" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 需為 YYYY-MM-DD"),
    category: z.enum(["corporate-legal", "personal-asset", "retirement-security"]),
    keywords: z.string().default(""),
    author: z.string().default("詠業CREDO 法務團隊"),
    // 選填：文內 FAQ（渲染成可見區塊＋FAQPage schema，AEO 用）
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { insights };
