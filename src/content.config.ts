import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { TOPICS } from "./lib/site";

const topicField = z.string().optional();
function checkTopic(data: { topic?: string; category: string }, ctx: z.RefinementCtx) {
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
}

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
      topic: topicField,
      // 內容型態：pillar 鎮站文（每主題僅一篇）/ case 借鏡文（判決評析）/ news 時事文
      kind: z.enum(["pillar", "case", "news"]).default("case"),
      // 草稿不進 build；過濾統一走 src/lib/content.ts getPublished()
      draft: z.boolean().default(false),
      // 借鏡文：判決字號（保留原字號、當事人去識別化）與法院
      caseNo: z.string().optional(),
      court: z.string().optional(),
      keywords: z.string().default(""),
      author: z.string().default("詠業CREDO 法務團隊"),
      // 封面圖（列表卡右欄＋og:image）：相對 public/ 路徑，如 images/covers/x.webp
      cover: z.string().optional(),
      coverAlt: z.string().default(""),
      coverCredit: z.string().default(""),
      // 選填：文內 FAQ（渲染成可見區塊＋FAQPage schema，AEO 用）
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    })
    .superRefine(checkTopic),
});

// 錦囊（實用工具）：src/content/resources/<slug>.md → /resources/<slug>/
// 角色 × 關鍵時間點的行動工具：檢查清單/範本＋律師逐條解說＋「什麼情況這份不夠用」
const resources = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/resources" }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date 需為 YYYY-MM-DD"),
      category: z.enum(["corporate-legal", "personal-asset", "retirement-security"]),
      topic: topicField,
      audience: z.string(), // 給誰用：如「求職者/新進員工」「房客」「家屬」
      moment: z.string(), // 關鍵時間點：如「到職簽署文件時」「家人過世後 30 天內」
      cover: z.string().optional(),
      coverAlt: z.string().default(""),
      coverCredit: z.string().default(""),
      draft: z.boolean().default(false),
      keywords: z.string().default(""),
      author: z.string().default("詠業CREDO 法務團隊"),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    })
    .superRefine(checkTopic),
});

export const collections = { insights, resources };
