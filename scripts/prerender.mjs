import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import {
  render,
  publicPaths,
  pageSeo,
  SITE_URL,
} from "../.cache/ssr/entry-server.js";

await copyFile("src/assets/taitien.png", "dist/og-image.png");
const template = await readFile("dist/index.html", "utf8");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
function head(seo) {
  const meta = (attr, key, value) =>
    `<meta ${attr}="${key}" content="${escape(value)}">`;
  return [
    `<title>${escape(seo.title)}</title>`,
    `<link rel="canonical" href="${escape(seo.url)}">`,
    meta("name", "description", seo.description),
    meta("name", "robots", seo.robots),
    meta(
      "property",
      "og:site_name",
      "泰艺电子-taitien官方授权代理商-上海芯聚电子",
    ),
    ...Object.entries({
      title: seo.title,
      description: seo.description,
      url: seo.url,
      image: seo.image,
      type: seo.type,
      locale: "zh_CN",
    }).map(([key, value]) => meta("property", "og:" + key, value)),
    meta("name", "twitter:card", "summary_large_image"),
    ...Object.entries({
      title: seo.title,
      description: seo.description,
      image: seo.image,
    }).map(([key, value]) => meta("name", "twitter:" + key, value)),
    `<script type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, "\\u003c")}</script>`,
  ].join("\n    ");
}
if (new Set(publicPaths).size !== publicPaths.length)
  throw new Error("Duplicate public route");
for (const path of [...publicPaths, "/404"]) {
  if (!/^\/(?:[a-z0-9_-]+\/?)*$/.test(path))
    throw new Error("Unsafe route: " + path);
  const file = resolve(
    "dist",
    path === "/"
      ? "index.html"
      : path === "/404"
        ? "404.html"
        : path.slice(1) + "/index.html",
  );
  await mkdir(dirname(file), { recursive: true });
  const html = template
    .replace("<!--seo-head-->", () => head(pageSeo(path)))
    .replace("<!--app-html-->", () => render(path));
  if (!html.includes("<h1") || html.includes("<!--app-html-->"))
    throw new Error("Missing page content: " + path);
  await writeFile(file, html);
}
const indexable = publicPaths.filter((path) =>
  pageSeo(path).robots.startsWith("index"),
);
await writeFile(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    indexable
      .map((path) => `  <url><loc>${escape(SITE_URL + path)}</loc></url>`)
      .join("\n") +
    "\n</urlset>\n",
);
// Let crawlers fetch search pages and observe noindex instead of blocking that directive.
await writeFile(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
);
console.log(
  `Prerendered ${publicPaths.length} public pages + 404; sitemap contains ${indexable.length} canonical URLs.`,
);
