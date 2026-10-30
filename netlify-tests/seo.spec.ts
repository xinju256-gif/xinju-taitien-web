import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { categories, applications, guides } from "../src/data/catalog";
import { products } from "../src/data/products";

const origin = "https://taitien-cn.com";
const routes = [
  "/",
  "/products",
  "/applications",
  "/resources",
  "/about",
  "/contact",
  "/search",
  ...categories.map((item) => `/products/${item.id}`),
  ...applications.map((item) => `/applications/${item.id}`),
  ...guides.map((item) => `/resources/${item.id}`),
  ...products.map((item) => `/products/${item.id}`),
];
const tailwind = readFileSync(
  "node_modules/@tailwindcss/browser/dist/index.global.js",
);
test.beforeEach(async ({ page }) => {
  await page.route(
    "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.18/dist/index.global.js",
    (route) =>
      route.fulfill({ contentType: "application/javascript", body: tailwind }),
  );
});

test("every public URL returns complete HTML and unique SEO without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route("**/*", (route) => route.abort());
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const assets = new Set<string>();
  for (const route of routes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    const html = await response.text();
    await page.setContent(html);
    await expect(page.locator("#main h1"), route).toHaveCount(1);
    expect(
      (await page.locator("#main").innerText()).length,
      route,
    ).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      origin + route,
    );
    const title = await page.title();
    expect(titles.has(title), `duplicate title: ${route}`).toBe(false);
    titles.add(title);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description!.length, route).toBeGreaterThan(15);
    expect(
      descriptions.has(description!),
      `duplicate description: ${route}`,
    ).toBe(false);
    descriptions.add(description!);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      title,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      origin + route,
    );
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute("content", description!);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      title,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      route === "/search" ? "noindex,follow" : "index,follow",
    );
    const schema = JSON.parse(
      await page.locator('script[type="application/ld+json"]').innerText(),
    );
    expect(schema["@context"]).toBe("https://schema.org");
    expect(
      schema["@graph"].some(
        (item: Record<string, unknown>) => item.url === origin + route,
      ),
    ).toBe(true);
    const product = products.find((item) => route === `/products/${item.id}`);
    if (product) {
      expect(await page.locator("#main h1").innerText()).toContain(
        product.model,
      );
      expect(await page.locator(".catalog-specs").innerText()).toContain(
        product.overview[0].value,
      );
      expect(
        schema["@graph"].find(
          (item: Record<string, unknown>) => item["@type"] === "Product",
        ).model,
      ).toBe(product.model);
    }
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!));
    expect(
      links.some((link) => link.startsWith("#/")),
      route,
    ).toBe(false);
    for (const url of await page
      .locator('script[src], link[rel="stylesheet"], img[src]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) => node.getAttribute("src") || node.getAttribute("href")!,
        ),
      )) {
      if (url.startsWith("/")) assets.add(url);
    }
    assets.add(
      new URL(
        (await page
          .locator('meta[property="og:image"]')
          .getAttribute("content"))!,
      ).pathname,
    );
  }
  for (const asset of assets)
    expect((await request.get(asset)).status(), asset).toBe(200);
  await context.close();
});

test("sitemap covers every indexable page; robots and 404 have correct HTTP behavior", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls.sort()).toEqual(
    routes
      .filter((route) => route !== "/search")
      .map((route) => origin + route)
      .sort(),
  );
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: " + origin + "/sitemap.xml");
  for (const route of [
    "/missing-page",
    "/products/missing-model",
    "/applications/missing",
    "/resources/missing",
    "/about/extra",
    "/missing.pdf",
  ]) {
    const missing = await request.get(route);
    expect(missing.status(), route).toBe(404);
  }
  // Netlify production selects this conventional file for native 404 responses.
  // The local primitives runtime returns a generic 404 body.
  const notFoundHtml = await (await request.get("/404.html")).text();
  expect(notFoundHtml).toContain("noindex,follow");
  expect(notFoundHtml).toContain("页面未找到");
});

test("direct details hydrate; navigation, history, queries and legacy links retain behavior", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("404"))
      errors.push(message.text());
  });
  await page.goto("/products/mhz-range-crystal-xy-type");
  await expect(page.locator("h1")).toContainText("XY");
  await page.locator('.catalog-model-overview a[href^="/contact?"]').click();
  await expect(page).toHaveURL(
    /\/contact\?category=crystal&product=mhz-range-crystal-xy-type$/,
  );
  await expect(page.locator('textarea[name="message"]')).toHaveValue(
    /Model: XY/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    origin + "/contact",
  );
  await page.goBack();
  await expect(page.locator("h1")).toContainText("XY");
  await page.goForward();
  await expect(page.locator('textarea[name="message"]')).toHaveValue(
    /Model: XY/,
  );
  await page.goto("/#/products?category=tcxo&frequency=26");
  await expect(page).toHaveURL(/\/products\?category=tcxo&frequency=26$/);
  await expect(page.locator(".filter-tabs .active")).toHaveText("TCXO");
  await expect(page.locator(".notice strong")).toHaveText("26 MHz");
  await page.reload();
  await expect(page.locator(".filter-tabs .active")).toHaveText("TCXO");
  await page.goto("/#/search?q=OX");
  await expect(page).toHaveURL(/\/search\?q=OX$/);
  await expect(page.locator(".catalog-row")).not.toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
  await page.goto(
    "/#/contact?product=mhz-range-crystal-xy-type&subject=application-notes",
  );
  await expect(page).toHaveURL(
    /\/contact\?product=mhz-range-crystal-xy-type&subject=application-notes$/,
  );
  await expect(page.locator('textarea[name="message"]')).toHaveValue(
    /Application notes request/,
  );
  await page.goto("/resources/parameters/");
  await expect(page.locator("h1")).toContainText("关键参数");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    origin + "/resources/parameters",
  );
  expect(errors).toEqual([]);
});
