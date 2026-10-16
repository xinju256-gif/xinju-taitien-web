import {
  test,
  expect,
  type Browser,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { SITE_TITLE } from "../src/data/site";

const baseURL = "http://127.0.0.1:4173";
const cdnURL =
  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.18/dist/index.global.js";
const tailwind = readFileSync(
  "node_modules/@tailwindcss/browser/dist/index.global.js",
  "utf8",
);
const routes = [
  "/",
  "/applications",
  "/resources",
  "/about",
  "/contact",
  "/applications/communications",
  "/applications/automotive",
  "/applications/industrial",
  "/applications/consumer",
  "/resources/selection",
  "/resources/parameters",
  "/resources/bom",
];

// Approved changes: product/application imagery and the home hero redesign.
// Everything outside these fixed regions must still match the signed-off layout.
const approvedImageRegions = [
  ".hero",
  ".product-visual",
  ".app-graphic",
  ".application-story > :first-child",
].join(", ");

async function ready(page: Page) {
  await expect(page.locator("#main h1")).toHaveCount(1);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const image of document.images) image.loading = "eager";
    await Promise.all(Array.from(document.images, (image) => image.decode()));
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });
}

async function pair(
  browser: Browser,
  width: number,
  language = "zh",
  offline = false,
) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(
    (lang) => localStorage.setItem("simacity-language", lang),
    language,
  );
  await context.route(cdnURL, (route) =>
    offline
      ? route.abort()
      : route.fulfill({
          contentType: "application/javascript",
          body: tailwind,
        }),
  );
  const reference = await context.newPage(),
    app = await context.newPage();
  const errors: string[] = [];
  app.on("pageerror", (error) => errors.push(error.message));
  app.on("console", (message) => {
    if (
      message.type() === "error" &&
      !message.text().includes("net::ERR_FAILED")
    )
      errors.push(message.text());
  });
  await Promise.all([
    reference.goto(baseURL + "/reference/final-static.html", {
      waitUntil: "networkidle",
    }),
    app.goto(String(test.info().project.use.baseURL) + "/", {
      waitUntil: "networkidle",
    }),
  ]);
  return { context, reference, app, errors };
}

async function equalPixels(
  reference: Page,
  app: Page,
  name: string,
  info: TestInfo,
) {
  await Promise.all([ready(reference), ready(app)]);
  const options = {
    fullPage: true,
    animations: "disabled" as const,
    caret: "hide" as const,
    // Hide image paint during comparison, retaining its layout box. This also
    // excludes photo antialiasing and shadows that extend beyond a fractional
    // mask edge. Separate asset tests verify the actual visible image content.
    style: `
      .hero,
      .product-visual > .crystal,
      .app-graphic > img,
      .app-graphic > svg,
      .app-graphic > span,
      .app-graphic::before,
      .application-story > :first-child { visibility: hidden !important; }
    `,
  };
  const [expected, actual] = await Promise.all([
    reference.screenshot({
      ...options,
      mask: [reference.locator(approvedImageRegions)],
    }),
    app.screenshot({ ...options, mask: [app.locator(approvedImageRegions)] }),
  ]);
  if (!actual.equals(expected)) {
    await info.attach(name + "-static", {
      body: expected,
      contentType: "image/png",
    });
    await info.attach(name + "-react", {
      body: actual,
      contentType: "image/png",
    });
  }
  expect(
    actual.equals(expected),
    name +
      ": pixels outside the approved hero and product/application image regions must match",
  ).toBe(true);
}

test("original image bytes and CSS declarations are preserved", async ({
  browser,
}) => {
  const html = readFileSync("reference/final-static.html", "utf8");
  const images = JSON.parse(
    html.match(/const IMAGES=(\{[\s\S]*?\});/)![1],
  ) as Record<string, string>;
  const digest = (bytes: Buffer) =>
    createHash("sha256").update(bytes).digest("hex");
  for (const [name, data] of Object.entries(images)) {
    expect(
      digest(
        readFileSync(
          `src/assets/${name}.${name === "taitien" ? "png" : "jpg"}`,
        ),
      ),
    ).toBe(digest(Buffer.from(data.split(",")[1], "base64")));
  }
  const { reference, app, context } = await pair(browser, 1440);
  const cssRules = (page: Page) =>
    page.evaluate(() => {
      const sheet = Array.from(document.styleSheets).find(
        (sheet) =>
          sheet.ownerNode?.textContent?.includes("--navy") ||
          sheet.href?.includes("site.css"),
      );
      return Array.from(sheet!.cssRules, (rule) => rule.cssText);
    });
  const sourceRules = await app.evaluate(
    (source) => {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(source);
      return Array.from(sheet.cssRules, (rule) => rule.cssText);
    },
    readFileSync("src/styles/site.css", "utf8"),
  );
  expect(sourceRules).toEqual(await cssRules(reference));
  await context.close();
});

for (const width of [1440, 390, 320])
  for (const language of ["zh", "en"]) {
    test(`all unchanged routes · ${width}px · ${language}`, async ({
      browser,
    }, info) => {
      const { reference, app, context, errors } = await pair(
        browser,
        width,
        language,
      );
      for (const route of routes) {
        await Promise.all([
          reference.evaluate((route) => {
            location.hash = route;
          }, route),
          app.evaluate((route) => {
            location.hash = route;
          }, route),
        ]);
        await equalPixels(
          reference,
          app,
          route.replace(/[^a-z0-9]/gi, "_") || "home",
          info,
        );
        expect(await app.title()).toContain(SITE_TITLE);
        expect(
          await app.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const links = await app
          .locator("a[href]")
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute("href")!),
          );
        expect(links.every((link) => /^(#\/|tel:|mailto:)/.test(link))).toBe(
          true,
        );
      }
      expect(errors).toEqual([]);
      await context.close();
    });
  }

for (const width of [768, 1024])
  test(`home breakpoint · ${width}px`, async ({ browser }, info) => {
    const { reference, app, context, errors } = await pair(browser, width);
    await equalPixels(reference, app, "home", info);
    expect(errors).toEqual([]);
    await context.close();
  });

test("CDN unavailable, floating contact, mobile menu and keyboard", async ({
  browser,
}, info) => {
  const { reference, app, context, errors } = await pair(
    browser,
    390,
    "zh",
    true,
  );
  await equalPixels(reference, app, "offline-home", info);
  for (const page of [reference, app]) {
    await page.locator(".floating-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText("021-62271972");
    await expect(page.locator(".popover-close")).toBeFocused();
  }
  await equalPixels(reference, app, "contact-popover", info);
  for (const page of [reference, app]) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.locator(".floating-button")).toBeFocused();
    await page.locator(".menu-toggle").click();
    await expect(page.locator(".nav")).toBeVisible();
  }
  await equalPixels(reference, app, "mobile-menu", info);
  for (const page of [reference, app]) {
    await page
      .locator(".nav")
      .getByRole("link", { name: "联系我们", exact: true })
      .click();
    await expect(page.locator("h1")).toContainText("一起找到合适的方案");
    await expect(page.locator(".nav")).not.toBeVisible();
  }
  await equalPixels(reference, app, "mobile-contact", info);
  expect(errors).toEqual([]);
  await context.close();
});

test("selection, language, validation, BOM email and editing retain static behavior", async ({
  browser,
}, info) => {
  const { reference, app, context, errors } = await pair(browser, 1440);
  for (const page of [reference, app]) {
    await page.getByLabel("产品类别", { exact: true }).selectOption("tcxo");
    await page.getByLabel("目标频率 MHz", { exact: true }).fill("26");
    await page.getByRole("button", { name: "切换英文" }).click();
    await expect(page.getByLabel("Target frequency MHz")).toHaveValue("26");
    await page.getByRole("button", { name: "Switch to Chinese" }).click();
    await page.getByRole("button", { name: "开始选型", exact: true }).click();
    await expect(page.locator(".product-card")).toHaveCount(1);
  }
  // The product catalog is intentionally expanded; the subsequent contact flow stays pixel-identical.
  for (const page of [reference, app]) {
    await page.getByRole("link", { name: "发送选型需求" }).click();
    await expect(page.locator('textarea[name="message"]')).toHaveValue(
      "Product: TCXO\nFrequency: 26 MHz",
    );
    await page.locator('[name="name"]').fill("测试工程师");
    await page.locator('[name="company"]').fill("验证公司");
    await page.locator('[name="email"]').fill("engineer@example.com");
    await page.getByRole("button", { name: "切换英文" }).click();
    await expect(page.locator('[name="name"]')).toHaveValue("测试工程师");
    await page.getByRole("button", { name: "Switch to Chinese" }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: "bad.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("invalid"),
    });
    await expect(page.locator("#file-error")).toBeVisible();
  }
  await equalPixels(reference, app, "file-validation", info);
  for (const page of [reference, app]) {
    await page.locator('input[type="file"]').setInputFiles({
      name: "bom.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("part,qty\nTCXO,1000"),
    });
    await page
      .getByRole("button", { name: "生成询价邮件", exact: true })
      .click();
    await expect(page.locator(".prepared")).toContainText("尚未发送");
    await expect(page.locator(".prepared")).toContainText("bom.csv");
  }
  expect(await app.locator(".prepared a").getAttribute("href")).toBe(
    await reference.locator(".prepared a").getAttribute("href"),
  );
  await equalPixels(reference, app, "prepared-email", info);
  for (const page of [reference, app]) {
    await page.getByRole("button", { name: "修改需求", exact: true }).click();
    await expect(page.locator('[name="name"]')).toHaveValue("测试工程师");
  }
  await equalPixels(reference, app, "edit-enquiry", info);
  expect(errors).toEqual([]);
  await context.close();
});

test("category search remains available and guide downloads match the static page", async ({
  browser,
}, info) => {
  const { reference, app, context, errors } = await pair(browser, 1440);
  const downloads: string[] = [];
  for (const page of [reference, app]) {
    await page.locator(".search-form input").fill("TCXO");
    await page.locator(".search-form button").click();
    await expect(page.locator(".search-results")).toContainText("TCXO");
  }
  // Search now includes actual models and local datasheet links.
  for (const page of [reference, app]) {
    await page.locator(".large-search input").fill("不存在的型号");
    await page.locator(".large-search button").click();
    await expect(page.locator(".empty-state")).toContainText(
      "暂未找到匹配内容",
    );
    await page.evaluate(() => {
      location.hash = "/resources/selection";
    });
    await expect(page.locator("h1")).toContainText("频率控制元件选型指南");
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "下载指南 · MD" }).click();
    const download = await downloaded;
    downloads.push(readFileSync((await download.path())!, "utf8"));
  }
  expect(downloads[1]).toBe(downloads[0]);
  expect(downloads[1]).toContain("负载电容");
  expect(errors).toEqual([]);
  await context.close();
});
