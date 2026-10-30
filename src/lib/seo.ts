import { categories, applications, guides } from "../data/catalog";
import { products, productById } from "../data/products";
import { SITE_TITLE } from "../data/site";
import type { Language } from "../context/LanguageContext";

export const SITE_URL = "https://taitien-cn.com";
const homeDescription =
  "上海芯聚电子是 Taitien 泰艺电子官方授权代理商，提供石英晶体、XO、VCXO、TCXO、OCXO 等频率控制产品的型号查询、参数选型、Datasheet 规格书下载与供货支持。";
const pages = [
  ["/", "首页", homeDescription],
  [
    "/products",
    "产品与快速选型",
    "查询泰艺 Taitien 石英晶体、XO、VCXO、TCXO、OCXO 产品系列，比较参数、封装与频率，下载原厂规格书。",
  ],
  [
    "/applications",
    "频率控制应用方案",
    "面向通信与网络、汽车电子、工业控制及消费电子，了解泰艺频率控制器件的应用与选型要求。",
  ],
  [
    "/resources",
    "技术资源中心",
    "阅读晶振选型指南、关键参数解读和 BOM 询价准备清单，获取泰艺产品选型与技术支持。",
  ],
  [
    "/about",
    "关于上海芯聚电子",
    "了解上海芯聚电子科技有限公司与泰艺 Taitien 频率控制产品服务，获取型号核对、选型和供货支持。",
  ],
  [
    "/contact",
    "联系我们",
    "联系上海芯聚电子获取泰艺晶振选型、规格书及供货支持。电话 021-62271972，邮箱 taitien@simacity.com.cn。",
  ],
  ["/search", "站内搜索", "搜索泰艺产品型号、产品类别与技术资料。"],
] as const;
export const publicPaths = [
  ...pages.map(([path]) => path),
  ...categories.map((item) => `/products/${item.id}`),
  ...applications.map((item) => `/applications/${item.id}`),
  ...guides.map((item) => `/resources/${item.id}`),
  ...products.map((item) => `/products/${item.id}`),
];
const paths = new Set(publicPaths);
const englishTitles: Record<string, string> = {
  "/products": "Products & selection",
  "/applications": "Timing applications",
  "/resources": "Technical resources",
  "/about": "About Simacity",
  "/contact": "Contact & support",
  "/search": "Site search",
};

export function pageSeo(path: string, lang: Language = "zh") {
  path = path.replace(/\/+$/, "") || "/";
  const known = paths.has(path);
  const base = pages.find(([url]) => url === path);
  const [section, id] = path.split("/").filter(Boolean);
  const category =
    section === "products"
      ? categories.find((item) => item.id === id)
      : undefined;
  const product = section === "products" ? productById.get(id) : undefined;
  const application =
    section === "applications"
      ? applications.find((item) => item.id === id)
      : undefined;
  const guide =
    section === "resources" ? guides.find((item) => item.id === id) : undefined;
  const detail = category || application || guide;
  let name = base?.[1] as string | undefined;
  let description = base?.[2] as string | undefined;
  if (lang === "en" && base) name = englishTitles[path] || "Home";
  if (detail) {
    name = lang === "zh" ? detail.zh : detail.en;
    description = application
      ? application.body[lang === "zh" ? 0 : 1]
      : detail.desc[lang === "zh" ? 0 : 1];
  }
  if (product) {
    name = `${product.model} · ${lang === "zh" ? product.nameZh : product.nameEn}`;
    const specs = product.overview
      .slice(0, 3)
      .map((item) => `${item.label}: ${item.value}`)
      .join("；");
    description =
      lang === "zh"
        ? `泰艺 Taitien ${product.model} ${product.nameZh}。${specs}。查看产品参数、原厂 Datasheet 规格书并咨询选型与供货。`
        : `Taitien ${product.model} ${product.nameEn}. ${specs}. Specifications, manufacturer datasheets and selection support.`;
  }
  if (!known) {
    name = lang === "zh" ? "页面未找到" : "Page not found";
    description = "页面不存在，请浏览产品中心或联系上海芯聚电子。";
  }
  const title = path === "/" ? SITE_TITLE : `${name} | ${SITE_TITLE}`;
  const url = SITE_URL + path;
  const image = product
    ? SITE_URL + "/" + product.image
    : SITE_URL + "/og-image.png";
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "上海芯聚电子科技有限公司",
      url: SITE_URL + "/",
      telephone: "+86-21-62271972",
      email: "taitien@simacity.com.cn",
      address: {
        "@type": "PostalAddress",
        streetAddress: "延安西路2299号",
        addressLocality: "长宁区",
        addressRegion: "上海",
        addressCountry: "CN",
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: SITE_TITLE,
      publisher: { "@id": SITE_URL + "/#organization" },
    },
    {
      "@type": guide ? "Article" : "WebPage",
      "@id": url + "#webpage",
      url,
      name: title,
      headline: title,
      description,
      inLanguage: lang === "zh" ? "zh-CN" : "en",
      isPartOf: { "@id": SITE_URL + "/#website" },
    },
  ];
  if (known && path !== "/") {
    const parent = "/" + section;
    const crumbs = [{ name: "首页", item: SITE_URL + "/" }];
    if (id)
      crumbs.push({
        name: pages.find(([p]) => p === parent)?.[1] || section,
        item: SITE_URL + parent,
      });
    crumbs.push({ name: name!, item: url });
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        ...crumb,
      })),
    });
  }
  if (product)
    graph.push({
      "@type": "Product",
      name: product.model,
      description,
      image,
      model: product.model,
      category: product.nameZh,
      url,
      brand: { "@type": "Brand", name: "Taitien 泰艺电子" },
      manufacturer: { "@type": "Organization", name: "Taitien Electronics" },
    });
  return {
    path,
    title,
    description: description!,
    url,
    image,
    type: guide ? "article" : "website",
    robots: known && path !== "/search" ? "index,follow" : "noindex,follow",
    structuredData: { "@context": "https://schema.org", "@graph": graph },
  };
}

export function applySeo(path: string, lang: Language) {
  const seo = pageSeo(path, lang);
  document.title = seo.title;
  function meta(attr: "name" | "property", key: string, value: string) {
    let element = document.head.querySelector<HTMLMetaElement>(
      `meta[${attr}="${key}"]`,
    );
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attr, key);
      document.head.append(element);
    }
    element.content = value;
  }
  meta("name", "description", seo.description);
  meta("name", "robots", seo.robots);
  for (const [key, value] of Object.entries({
    title: seo.title,
    description: seo.description,
    url: seo.url,
    image: seo.image,
    type: seo.type,
    locale: lang === "zh" ? "zh_CN" : "en_US",
  }))
    meta("property", "og:" + key, value);
  for (const [key, value] of Object.entries({
    title: seo.title,
    description: seo.description,
    image: seo.image,
  }))
    meta("name", "twitter:" + key, value);
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = seo.url;
  let schema = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  );
  if (!schema) {
    schema = document.createElement("script");
    schema.type = "application/ld+json";
    document.head.append(schema);
  }
  schema.textContent = JSON.stringify(seo.structuredData).replace(
    /</g,
    "\\u003c",
  );
}
