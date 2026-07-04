// 文章讀取的唯一入口：所有頁面一律經此取文，確保 draft 過濾與排序一致。
import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"insights">;

/** 已發佈文章（draft: true 一律排除），可再帶自訂過濾 */
export async function getPublished(filter?: (p: Post) => boolean): Promise<Post[]> {
  return getCollection("insights", (p) => !p.data.draft && (filter ? filter(p) : true));
}

/** 列表排序：鎮站文置頂，其餘依日期新到舊 */
export function sortForList(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const pa = a.data.kind === "pillar" ? 1 : 0;
    const pb = b.data.kind === "pillar" ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return b.data.date.localeCompare(a.data.date);
  });
}

/** 某主題的鎮站文（每主題至多一篇） */
export async function getPillar(topic: string): Promise<Post | undefined> {
  const posts = await getPublished((p) => p.data.topic === topic && p.data.kind === "pillar");
  return posts[0];
}

/** 文章的 URL 路徑（不含 base） */
export function postPath(p: Post): string {
  return `insights/${p.data.category}/${p.id}/`;
}
