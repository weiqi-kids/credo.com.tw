// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 部署設定：預設為 GitHub Pages 專案頁（子路徑）。
// 未來 DNS 切換到 credo.com.tw 時，只要設 repo 變數 CUSTOM_DOMAIN=credo.com.tw
// （deploy.yml 會自動改帶 BASE_PATH=/ 與 SITE_URL，並寫入 public/CNAME）。
const BASE = process.env.BASE_PATH ?? '/credo.com.tw';
const SITE = process.env.SITE_URL ?? 'https://weiqi-kids.github.io';

// rehype 外掛：把 Markdown 內以 "/" 開頭的內部連結/圖片加上 base 前綴。
// 當 BASE 為 "/"（根網域）時不做任何事，避免產生 "//path"。
function rehypeBasePrefix() {
  const prefix = BASE === '/' ? '' : BASE;
  const fix = (node) => {
    if (prefix && node.type === 'element' && node.properties) {
      for (const attr of ['href', 'src']) {
        const v = node.properties[attr];
        if (typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith(prefix + '/')) {
          node.properties[attr] = prefix + v;
        }
      }
    }
    if (node.children) node.children.forEach(fix);
  };
  return (tree) => fix(tree);
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeBasePrefix],
  },
});
