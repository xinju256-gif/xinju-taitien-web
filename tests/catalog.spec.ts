import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import snapshot from "../src/data/products.json" with { type: "json" };
import audit from "../docs/taitien-catalog-audit.json" with { type: "json" };
import {
  directProductMatch,
  normalizeSearch,
  productGroups,
  searchProducts,
} from "../src/data/products";
import { SITE_TITLE } from "../src/data/site";

const products = snapshot.products;
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

test("every official entry has a local, intact datasheet and image", async ({
  request,
}) => {
  expect(products.length).toBe(audit.sitemapProducts);
  expect(new Set(products.map((product) => product.id)).size).toBe(
    products.length,
  );
  const referenced = new Set<string>();
  for (const product of products) {
    expect(productGroups.some((group) => group.id === product.category)).toBe(
      true,
    );
    const datasheet = product.documents.find(
      (document) => document.label === "Datasheet",
    );
    expect(datasheet?.format).toBe("PDF");
    for (const document of product.documents) referenced.add(document.path);
    referenced.add(product.image);
  }
  expect(referenced.size).toBe(audit.assets.length);
  for (const asset of audit.assets) {
    const source = readFileSync(`public/${asset.path}`);
    const built = readFileSync(`dist/${asset.path}`);
    expect(createHash("sha256").update(source).digest("hex")).toBe(
      asset.sha256,
    );
    expect(built.equals(source)).toBe(true);
    const response = await request.head(`/${asset.path}`);
    expect(response.status(), asset.path).toBe(200);
    if (asset.path.endsWith(".pdf")) {
      expect(source.subarray(0, 5).toString()).toBe("%PDF-");
      expect(response.headers()["content-type"]).toContain("application/pdf");
    } else {
      expect(response.headers()["content-type"]).toMatch(/^image\//);
    }
  }
});

test("model matching handles aliases and variants without inventing full order codes", () => {
  expect(directProductMatch(" ｘｙ ")?.model).toBe("XY");
  expect(directProductMatch("nf16m3847000")?.model).toBe("NF-16.384M-7000");
  expect(directProductMatch("OX")).toBeUndefined();
  const variants = searchProducts("OX").filter(
    (match) => match.product.model === "OX",
  );
  expect(variants).toHaveLength(4);
  expect(searchProducts("温补晶振")).toHaveLength(28);
  expect(searchProducts("ni 100m 2900")[0].product.model).toBe("NI-100M-2900");
  expect(searchProducts("TYETBCSANF-26.000000")[0]).toMatchObject({
    seriesMatch: true,
    product: { model: "TY" },
  });
  expect(searchProducts("---")).toHaveLength(0);
  expect(searchProducts("不存在的型号")).toHaveLength(0);
  expect(normalizeSearch("NA‑100M‑6800")).toBe("na100m6800");
});

test("header search opens a unique model; variants show results; local download is the original PDF", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await expect(page).toHaveTitle(SITE_TITLE);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    SITE_TITLE,
  );
  await page.locator(".search-form input").fill("XY");
  await page.locator(".search-form button").click();
  await expect(page).toHaveURL(/\/products\/mhz-range-crystal-xy-type$/);
  await expect(page.locator("h1")).toContainText("XY");
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("link", { name: "下载 XY Datasheet", exact: true })
    .click();
  const download = await downloading;
  const product = products.find((product) => product.model === "XY")!;
  const document = product.documents.find(
    (document) => document.label === "Datasheet",
  )!;
  expect(
    readFileSync((await download.path())!).equals(
      readFileSync(`public/${document.path}`),
    ),
  ).toBe(true);
  await page.locator(".search-form input").fill("OX");
  await page.locator(".search-form button").click();
  await expect(page).toHaveURL(/\/search\?q=OX$/);
  await expect(page.locator(".catalog-row")).not.toHaveCount(0);
  await page.locator(".large-search input").fill("温补晶振");
  await page.locator(".large-search button").click();
  await expect(page.getByRole("status")).toContainText("28 个系列");
  expect(requests.filter((url) => /taitien\.com/.test(url))).toEqual([]);
});

for (const width of [1440, 390, 320]) {
  test(`catalog filtering, pagination, model interactions and layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/products");
    await expect(page.locator(".catalog-row")).toHaveCount(12);
    await page.getByRole("button", { name: "下一页", exact: true }).click();
    await expect(page.locator(".catalog-pagination")).toContainText(
      "第 2 / 13 页",
    );
    await page.locator(".catalog-filter select").selectOption("tsx");
    await page.getByRole("button", { name: "查找型号" }).click();
    await expect(page.locator(".catalog-row")).toHaveCount(1);
    await expect(page.locator(".catalog-row")).toContainText("B3");
    await page.getByRole("link", { name: "查看型号详情", exact: true }).click();
    await expect(page.locator("h1")).toContainText("B3");
    await page.locator(".floating-button").click();
    await expect(page.getByRole("dialog")).toContainText("021-62271972");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.locator('[data-action="language"]').click();
    await expect(page.locator("h1")).toContainText("Thermistor");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator('[data-action="language"]').click();
    await page.getByRole("link", { name: "咨询此型号", exact: true }).click();
    await expect(page.locator('textarea[name="message"]')).toHaveValue(
      /Model: B3/,
    );
  });
}

test("all product routes render with correct links, images, notes, and no external navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const product of products) {
    await page.evaluate((id) => {
      location.hash = `/products/${id}`;
    }, product.id);
    await expect(page.locator("h1")).toContainText(product.model);
    await expect(page.locator(".page-intro .description")).toHaveText(
      product.nameZh,
    );
    await expect(page.locator(".catalog-model-image img")).toHaveAttribute(
      "src",
      `/${product.image}`,
    );
    await expect(page.locator(".catalog-documents a")).toHaveCount(
      product.documents.length,
    );
    expect(
      await page
        .locator(".catalog-documents a")
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
    ).toEqual(product.documents.map((document) => `/${document.path}`));
    await expect(page).toHaveTitle(new RegExp(SITE_TITLE));
    const links = await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!));
    expect(
      links.every((link) => /^(\/|#main$|tel:|mailto:)/.test(link)),
      product.id,
    ).toBe(true);
  }
  await page.goto("/#/products/qcm_5mhz-series-s-caaaa-5mk02");
  await expect(page.locator(".catalog-series-note")).toContainText(
    "S-CAAAA-5MG02-1",
  );
  await page.goto(
    "/#/products/ultra-low-power-disciplined-oscillator-dtq-100a",
  );
  await expect(page.locator('a[href*="application-notes"]')).toHaveAttribute(
    "href",
    /^\/contact/,
  );
  await page.goto("/#/products/does-not-exist");
  await expect(page.locator(".empty-state")).toBeVisible();
  expect(errors).toEqual([]);
});
