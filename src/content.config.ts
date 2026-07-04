import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TOPICS } from "./lib/site";

// 法律新知文章（自動發文管線的落點）：src/content/insights/<slug>.md
// 檔名＝URL slug，路由為 /insights/<category>/<slug>/
// topic＝內容骨架主題（docs/content-taxonomy.md），必須屬於文章的 category
//（retirement-security 例外：可借用 personal-asset 的主題）。
const insights = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/insights" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 需為 YYYY-MM-DD"),
      category: z.enum(["corporate-legal", "personal-asset", "retirement-security"]),
      topic: z.string().optional(),
      // 內容型態：pillar 鎮站文（每主題僅一篇）/ case 借鏡文（判決評析）/ news 時事文
      kind: z.enum(["pillar", "case", "news"]).default("case"),
      // 草稿不進 build（鎮站文批閱期間用）；過濾統一走 src/lib/content.ts getPublished()
      draft: z.boolean().default(false),
      // 借鏡文：判決字號（保留原字號、當事人去識別化）與法院
      caseNo: z.string().optional(),
      court: z.string().optional(),
      keywords: z.string().default(""),
      author: z.string().default("詠業CREDO 法務團隊"),
      // 選填：文內 FAQ（渲染成可見區塊＋FAQPage schema，AEO 用）
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    })
    .superRefine((data, ctx) => {
      if (!data.topic) return;
      const t = TOPICS[data.topic];
      if (!t) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["topic"],
          message: `未知的 topic「${data.topic}」，可用值見 docs/content-taxonomy.md`,
        });
      } else if (t.category !== data.category && data.category !== "retirement-security") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["topic"],
          message: `topic「${data.topic}」屬於 ${t.category}，與 category「${data.category}」不符`,
        });
      }
    }),
});

export const collections = { insights };
