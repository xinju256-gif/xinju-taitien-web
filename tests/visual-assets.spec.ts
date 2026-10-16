import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { applications, categories } from "../src/data/catalog";
import { products, productById } from "../src/data/products";
import { categoryImageProduct, applicationImage } from "../src/data/visuals";
import catalogAudit from "../docs/taitien-catalog-audit.json" with { type: "json" };

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

test("all product and application images retain verified manufacturer provenance", async ({
  request,
}) => {
  const sources = new Map(
    catalogAudit.assets.map((asset) => [asset.sourceUrl, asset]),
  );
  for (const product of products) {
    const source = catalogAudit.products.find(
      (entry) => entry.id === product.id,
    )!;
    expect(source, product.id).toBeTruthy();
    const asset = sources.get(source.imageSource)!;
    expect(asset.path, product.id).toBe(product.image);
  }
  expect(
    new Set(categories.map((c) => categoryImageProduct(c.id).image)).size,
  ).toBe(5);
  for (const category of categories) {
    expect(categoryImageProduct(category.id).category).toBe(category.id);
  }
  expect(
    new Set(applications.map((app) => applicationImage(app.id).path)).size,
  ).toBe(4);
  for (const app of applications) {
    const image = applicationImage(app.id);
    expect(image.sourceImage).toMatch(
      /^https:\/\/www\.taitien\.com\/wp-content\/uploads\//,
    );
    expect(image.sourcePage).toBe(
      `https://www.taitien.com/wp-json/wp/v2/media/${image.mediaId}`,
    );
    const original = readFileSync(`public/${image.path}`);
    expect(createHash("sha256").update(original).digest("hex")).toBe(
      image.sha256,
    );
    expect(readFileSync(`dist/${image.path}`).equals(original)).toBe(true);
    expect((await request.head(`/${image.path}`)).status()).toBe(200);
  }
});

async function loadedImages(page: Page) {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
  expect(
    await page
      .locator("svg.crystal, .app-graphic > svg, .application-story > svg")
      .count(),
  ).toBe(0);
}

async function checkCategoryCards(page: Page, ids: string[]) {
  await expect(page.locator(".product-card")).toHaveCount(ids.length);
  for (const id of ids) {
    const product = categoryImageProduct(id);
    const image = page.locator(`.product-card[href="#/products/${id}"] img`);
    await expect(image).toHaveAttribute("src", `./${product.image}`);
    await expect(image).toHaveAttribute("data-product-image", product.id);
  }
  await loadedImages(page);
}

for (const width of [1440, 390, 320]) {
  test(`home, category, filtered and application entries share the correct images at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (/taitien\.com/.test(request.url())) external.push(request.url());
    });
    for (const route of ["/", "/products"]) {
      await page.goto(`/#${route}`);
      await checkCategoryCards(
        page,
        categories.map((category) => category.id),
      );
    }
    for (const category of categories) {
      const model = categoryImageProduct(category.id);
      await page.goto(`/#/products/${category.id}`);
      await expect(page.locator(".detail-illustration img")).toHaveAttribute(
        "src",
        `./${model.image}`,
      );
      await expect(page.locator(".detail-illustration small")).toContainText(
        model.model,
      );
      await loadedImages(page);
      await page.goto(`/#/products?category=${category.id}`);
      await checkCategoryCards(page, [category.id]);
    }
    for (const route of ["/", "/applications"]) {
      await page.goto(`/#${route}`);
      await expect(page.locator(".app-graphic img")).toHaveCount(4);
      for (const app of applications) {
        await expect(
          page.locator(
            `.application-card[href="#/applications/${app.id}"] img`,
          ),
        ).toHaveAttribute("src", `./${applicationImage(app.id).path}`);
      }
      await loadedImages(page);
    }
    for (const app of applications) {
      await page.goto(`/#/applications/${app.id}`);
      await expect(page.locator(".application-story img")).toHaveAttribute(
        "src",
        `./${applicationImage(app.id).path}`,
      );
      await checkCategoryCards(page, app.types);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("every catalog thumbnail and search result uses the same image as its model detail", async ({
  page,
}) => {
  await page.goto("/#/products");
  const seen = new Set<string>();
  while (true) {
    await loadedImages(page);
    const entries = await page.locator(".catalog-row").evaluateAll((rows) =>
      rows.map((row) => ({
        id: row.getAttribute("data-product")!,
        src: row.querySelector("img")!.getAttribute("src"),
        imageId: row.querySelector("img")!.getAttribute("data-product-image"),
      })),
    );
    for (const entry of entries) {
      expect(entry.src).toBe(`./${productById.get(entry.id)!.image}`);
      expect(entry.imageId).toBe(entry.id);
      seen.add(entry.id);
    }
    const next = page.getByRole("button", { name: "下一页", exact: true });
    if (await next.isDisabled()) break;
    await next.click();
  }
  expect(seen.size).toBe(products.length);
  await page.goto("/#/search?q=OX");
  await loadedImages(page);
  const results = await page.locator(".catalog-row").evaluateAll((rows) =>
    rows.map((row) => ({
      id: row.getAttribute("data-product")!,
      src: row.querySelector("img")!.getAttribute("src"),
    })),
  );
  expect(results.length).toBeGreaterThan(0);
  for (const result of results) {
    await page.goto(`/#/products/${result.id}`);
    await expect(page.locator(".catalog-model-image img")).toHaveAttribute(
      "src",
      result.src!,
    );
  }
});
