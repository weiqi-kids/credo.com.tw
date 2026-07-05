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

// rehype 外掛：內文 <img> 自動包成 <figure class="wrap-left|wrap-right">，
// 同篇文章左右交錯（文繞圖），img 的 title 屬性轉為 <figcaption>（攝影出處）。
function rehypeFloatFigures() {
  return (tree) => {
    let i = 0;
    const walk = (node, parent, idx) => {
      if (node.type === 'element' && node.tagName === 'p' && node.children?.length === 1 &&
          node.children[0].tagName === 'img') {
        const img = node.children[0];
        const side = i % 2 === 0 ? 'wrap-left' : 'wrap-right';
        i += 1;
        const caption = img.properties?.title;
        if (caption) delete img.properties.title;
        img.properties = { ...img.properties, loading: 'lazy', decoding: 'async' };
        const fig = {
          type: 'element', tagName: 'figure', properties: { className: [side] },
          children: caption
            ? [img, { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] }]
            : [img],
        };
        parent.children[idx] = fig;
        return;
      }
      (node.children || []).forEach((c, j) => walk(c, node, j));
    };
    walk(tree, null, 0);
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeBasePrefix, rehypeFloatFigures],
  },
});
