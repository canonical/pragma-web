import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { after, before, test } from "node:test";
import { chromium } from "playwright";

const serve = async (directory) => {
  const root = join(process.cwd(), directory);
  const server = createServer(async (request, response) => {
    const path = normalize(
      new URL(request.url, "http://localhost").pathname,
    ).replace(/^\/+/, "");
    let file = join(root, path);
    try {
      if (!extname(path)) throw new Error("SPA route");
      const body = await readFile(file);
      const types = {
        ".js": "text/javascript",
        ".css": "text/css",
        ".woff2": "font/woff2",
        ".json": "application/json",
        ".svg": "image/svg+xml",
        ".html": "text/html",
      };
      response.writeHead(200, {
        "content-type": types[extname(file)] || "application/octet-stream",
      });
      response.end(body);
    } catch {
      if (extname(path) || directory !== "build-spa") {
        response.writeHead(404).end();
        return;
      }
      file = join(root, "200.html");
      response
        .writeHead(200, { "content-type": "text/html" })
        .end(await readFile(file));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server;
};

let browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
});

after(async () => {
  await browser?.close();
});

/** Serves `directory` and runs `check` with a fresh page and the base URL. */
async function withServer(directory, check) {
  const server = await serve(directory);
  const base = `http://127.0.0.1:${server.address().port}`;
  const context = await browser.newContext();
  try {
    await check(await context.newPage(), base, context);
  } finally {
    await context.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

const htmlClass = (page) => page.locator("html").getAttribute("class");

test("the SPA applies the theme on select and restores it from the cookie", async () => {
  await withServer("build-spa", async (page, base, context) => {
    await page.goto(`${base}/`);
    await page.getByRole("heading", { name: "Home" }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Apply" }).count(), 0);
    await page.getByLabel("Color theme").selectOption("dark");
    assert.equal(await htmlClass(page), "app comfortable dark");
    assert.equal(
      (await context.cookies()).find((cookie) => cookie.name === "theme")
        ?.value,
      "dark",
    );
    await page.reload();
    await page.waitForFunction(() =>
      document.documentElement.classList.contains("dark"),
    );
    assert.equal(await page.getByLabel("Color theme").inputValue(), "dark");
    await page.getByLabel("Color theme").selectOption("system");
    assert.equal(await htmlClass(page), "app comfortable");
  });
});

test("the SPA switches the language live and restores it from the cookie", async () => {
  await withServer("build-spa", async (page, base) => {
    await page.goto(`${base}/`);
    await page.getByLabel("Language").selectOption("ar");
    await page.waitForFunction(
      () =>
        document.documentElement.lang === "ar" &&
        document.documentElement.dir === "rtl",
    );
    await page.reload();
    await page.waitForFunction(
      () =>
        document.documentElement.lang === "ar" &&
        document.documentElement.dir === "rtl",
    );
    await page.getByLabel("اللغة").selectOption("fr");
    await page.getByRole("link", { name: "Accueil" }).first().waitFor();
  });
});

test("the SPA serves every route from the fallback", async () => {
  await withServer("build-spa", async (page, base) => {
    for (const [path, heading] of [
      ["/guides/router-core", "router-core"],
      ["/catalog", "Catalog"],
      ["/contact", "Contact"],
      ["/dashboard", "Overview"],
      ["/dashboard/instances", "Instances"],
      ["/dashboard/settings", "Settings"],
      ["/account?auth=1", "Account"],
    ]) {
      const response = await page.goto(`${base}${path}`);
      assert.equal(response.status(), 200, path);
      await page.getByRole("heading", { name: heading, level: 1 }).waitFor();
    }
    await page.goto(`${base}/catalog`);
    await page.getByText("— showing 4 of 6 products.").waitFor();
    await page.goto(`${base}/`);
    await page.getByText("Streamed in after a delay").waitFor();
    assert.equal(
      (await page.request.get(`${base}/icons/plus.svg`)).status(),
      200,
    );
  });
});

test("the SPA redirects the account, the legacy home and shows the 404", async () => {
  await withServer("build-spa", async (page, base) => {
    await page.goto(`${base}/account`);
    await page.waitForURL(`${base}/login?from=%2Faccount`);
    await page.getByRole("heading", { name: "Login" }).waitFor();
    await page.goto(`${base}/home`);
    await page.waitForURL(`${base}/`);
    await page.goto(`${base}/missing`);
    await page.getByRole("heading", { name: "Page not found" }).waitFor();
    await page.goto(`${base}/guides/Not_Kebab`);
    await page.getByRole("heading", { name: "Page not found" }).waitFor();
  });
});

test("the SPA dashboard creates an instance and confirms a deletion", async () => {
  await withServer("build-spa", async (page, base) => {
    await page.goto(`${base}/dashboard`);
    await page.getByRole("button", { name: "Create instance" }).click();
    await page.waitForURL(`${base}/dashboard/instances`);
    await page
      .locator("header")
      .getByRole("button", { name: "Create instance" })
      .click();
    const panel = page.getByRole("dialog", { name: "Create instance" });
    await panel.getByLabel("Instance name").fill("spa-01");
    await panel.getByRole("button", { name: "Create instance" }).click();
    await page.getByRole("heading", { name: "spa-01" }).waitFor();
    await page
      .getByRole("navigation", { name: "Dashboard" })
      .getByRole("link", { name: "Settings" })
      .click();
    await page.getByRole("button", { name: "Delete project" }).click();
    await page.getByRole("dialog", { name: "Delete project?" }).waitFor();
    await page.keyboard.press("Escape");
    await page
      .getByRole("dialog", { name: "Delete project?" })
      .waitFor({ state: "hidden" });
  });
});

test("the built Storybook holds the React app's stories, in every locale", async () => {
  await withServer("storybook-static", async (page, base) => {
    const index = await (await page.request.get(`${base}/index.json`)).json();
    const stories = Object.values(index.entries)
      .filter((entry) => entry.type === "story")
      .map((entry) => `${entry.title}/${entry.name}`)
      .sort();
    assert.deepEqual(stories, [
      "Catalog/ProductList/Default",
      "Catalog/ProductList/EmptyCatalog",
      "ExampleComponent/Default",
      "LazyComponent/Default",
      "common/ApplicationShell/Default",
      "common/ApplicationShell/WithoutFooter",
      "common/TopBar/Default",
    ]);
    const idOf = (title, name) =>
      Object.values(index.entries).find(
        (entry) => entry.title === title && entry.name === name,
      ).id;

    await page.goto(
      `${base}/iframe.html?id=${idOf("common/TopBar", "Default")}&globals=locale:fr`,
    );
    await page.getByRole("link", { name: "Accueil" }).waitFor();
    await page.goto(
      `${base}/iframe.html?id=${idOf("common/ApplicationShell", "Default")}&globals=locale:ar`,
    );
    await page.getByRole("heading", { name: "Page content" }).waitFor();
    assert.equal(await page.locator("[dir=rtl]").count(), 1);
    await page.goto(
      `${base}/iframe.html?id=${idOf("Catalog/ProductList", "Default")}&globals=locale:fr`,
    );
    await page.getByText("D'autres produits sont disponibles.").waitFor();
    await page.goto(
      `${base}/iframe.html?id=${idOf("LazyComponent", "Default")}`,
    );
    await page.getByText("Streamed in after a delay").waitFor();
  });
});
