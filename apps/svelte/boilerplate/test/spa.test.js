import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { test } from "node:test";
import { chromium } from "playwright";

const serve = async (directory) => {
  const root = join(process.cwd(), directory);
  const server = createServer(async (request, response) => {
    const path = normalize(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "");
    let file = join(root, path);
    try {
      if (!extname(path)) throw new Error("SPA route");
      const body = await readFile(file);
      const types = { ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json", ".svg": "image/svg+xml", ".html": "text/html" };
      response.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
      response.end(body);
    } catch {
      if (extname(path) || directory !== "build-spa") { response.writeHead(404).end(); return; }
      file = join(root, "200.html");
      response.writeHead(200, { "content-type": "text/html" }).end(await readFile(file));
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server;
};

test("static fallback supports cold routes and a client-only contact demo", async () => {
  const server = await serve("build-spa");
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/`);
    assert.equal(await page.getByRole("link", { name: /GraphQL/i }).count(), 0);
    await page.getByLabel("Theme").selectOption("dark");
    await page.reload();
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    assert.equal(await page.getByLabel("Theme").inputValue(), "dark");
    await page.getByLabel("Language").selectOption("ar");
    await page.waitForFunction(() => document.documentElement.lang === "ar" && document.documentElement.dir === "rtl");
    await page.reload();
    await page.waitForFunction(() => document.documentElement.lang === "ar" && document.documentElement.dir === "rtl");
    await page.getByLabel("اللغة").selectOption("en");
    await page.waitForFunction(() => document.documentElement.lang === "en" && document.documentElement.dir === "ltr");
    await page.goto(`${base}/account`);
    await page.getByRole("heading", { name: "Demo login" }).waitFor();
    await page.getByRole("button", { name: "Enter demo account" }).click();
    await page.getByRole("heading", { name: "Demo account" }).waitFor();
    const cold = await page.goto(`${base}/catalog/compute`);
    assert.equal(cold.status(), 200);
    assert.equal((await page.request.get(`${base}/icons/information.svg`)).status(), 200);
    await page.getByRole("heading", { name: "Compute" }).waitFor();
    await page.goto(`${base}/contact`);
    await page.getByRole("heading", { name: "Contact us" }).waitFor();
    await page.getByRole("button", { name: "Send" }).click();
    await page.locator("#email .field-error").waitFor();
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Message").fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByText("The draft is valid. Nothing was sent.").waitFor();
    await page.goto(`${base}/dashboard/settings`);
    assert.equal(await page.getByRole("navigation", { name: "Dashboard navigation" }).getByRole("link", { name: "Settings" }).getAttribute("aria-current"), "page");
    await page.getByLabel("Language").selectOption("fr");
    const frenchNav = page.getByRole("navigation", { name: "Navigation du tableau de bord" });
    await frenchNav.getByText("Aide", { exact: true }).click();
    assert.equal(await frenchNav.getByRole("link", { name: "Informations légales" }).getAttribute("href"), "https://ubuntu.com/legal");
    await page.getByLabel("Langue").selectOption("en");
    await page.getByLabel("Display name").fill("");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("link", { name: "Enter a display name." }).waitFor();
    await page.getByLabel("Display name").fill("SPA user");
    await page.getByLabel("Default bridge").selectOption("ovn-1");
    await page.getByLabel("Maximum instances").fill("11");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByText("Settings saved.").waitFor();
    await page.reload();
    assert.equal(await page.getByLabel("Display name").inputValue(), "SPA user");
    assert.equal(await page.getByLabel("Default bridge").inputValue(), "ovn-1");
    await page.goto(`${base}/dashboard`);
    const releaseCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Ubuntu 20.04 LTS" }) });
    await releaseCard.getByRole("link", { name: "Create an instance" }).click();
    await page.getByLabel("Release").waitFor();
    assert.equal(await page.getByLabel("Release").inputValue(), "focal");
    await page.keyboard.press("Escape");
    await page.goto(`${base}/dashboard/instances`);
    await page.locator(".instance-panel summary").click();
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.getByRole("alert").waitFor();
    await page.getByLabel("Instance name").fill("spa-01");
    await page.getByLabel("Release").selectOption("jammy");
    await page.getByLabel("Enable Pro").check();
    await page.getByLabel("Cloud-init user data").fill("#cloud-config");
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.locator("#details").waitFor();
    await page.reload();
    await page.getByRole("button", { name: "spa-01" }).click();
    await page.getByRole("button", { name: "Remove demo instance" }).click();
    await page.getByRole("dialog").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await page.getByRole("button", { name: "Remove demo instance" }).evaluate((element) => element === document.activeElement), true);
    await page.getByRole("button", { name: "Remove demo instance" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Remove demo instance" }).click();
    await page.getByText("No demo instances yet.").waitFor();
    await page.getByRole("link", { name: "Project preview" }).click();
    await page.getByLabel("Project name").fill("Alpha");
    await page.getByText("Preview: Alpha").waitFor();
    await page.getByRole("button", { name: "Preview phone" }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(await page.locator("#preview-phone input[name=number]").getAttribute("aria-invalid"), "true");
    await page.getByLabel("Country code").selectOption("GB");
    await page.getByLabel("Phone number", { exact: true }).fill("1234567");
    await page.getByRole("button", { name: "Preview phone" }).click();
    await page.getByText("Phone preview: +441234567").waitFor();
    const missing = await page.goto(`${base}/missing`);
    assert.equal(missing.status(), 200);
    await page.getByRole("heading", { name: "404" }).waitFor();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});

test("built Storybook contact responds to locale globals", async () => {
  const server = await serve("storybook-static");
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/iframe.html?id=application-contact--empty&globals=locale:fr`);
    await page.getByRole("heading", { name: "Nous contacter" }).waitFor();
    await page.goto(`${base}/iframe.html?id=application-contact--server-validation&globals=locale:ar`);
    await page.getByRole("heading", { name: "اتصل بنا" }).waitFor();
    assert.equal(await page.locator("[dir=rtl]").count(), 1);
    assert.match(await page.locator("#email .field-error").textContent(), /بريد إلكتروني/);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
