import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { after, before, describe, test } from "node:test";
import { chromium } from "playwright";

/*
 * The built SSR server (adapter-node), exercised over HTTP for its responses
 * and the forms' no-JavaScript paths, and in Chromium for the pages' live
 * behaviour. The browser cases mirror the React app's component tests.
 */

let server;
let base;
let browser;

const form = "application/x-www-form-urlencoded";

before(async () => {
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const { port } = socket.address();
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.env.SERVER_RUNTIME || "node", ["build/index.js"], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      ORIGIN: base,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  server.stdout.on("data", (data) => {
    output += data;
  });
  server.stderr.on("data", (data) => {
    output += data;
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      /* Await startup. */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start: ${output}`);
});

after(async () => {
  await browser?.close();
  server?.kill();
});

const request = (path, options = {}) =>
  fetch(new URL(path, base), { redirect: "manual", ...options });

/** A page's HTML without Svelte's hydration comments. */
const strip = (text) => text.replaceAll(/<!--[^>]*-->/g, "");

const post = (path, body, headers = {}) =>
  request(path, {
    method: "POST",
    headers: { origin: base, "content-type": form, ...headers },
    body,
  });

/** Opens a browser context; `javaScriptEnabled: false` exercises the no-JS paths. */
async function withPage(options, run) {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext(options);
  try {
    await run(await context.newPage(), context);
  } finally {
    await context.close();
  }
}

/** Opens `path` once the client has hydrated. */
async function open(page, path) {
  await page.goto(new URL(path, base).href);
  await page.waitForLoadState("networkidle");
}

const htmlClass = (page) => page.locator("html").getAttribute("class");

describe("the server", () => {
  test("answers every route with the React app's status and title", async () => {
    for (const [path, status, title] of [
      ["/", 200, "Home — Boilerplate"],
      ["/guides/router-core", 200, "router-core — Boilerplate"],
      ["/catalog", 200, "Catalog — Boilerplate"],
      ["/contact", 200, "Contact — Boilerplate"],
      ["/dashboard", 200, "Dashboard — Boilerplate"],
      ["/dashboard/instances", 200, "Instances — Boilerplate"],
      ["/dashboard/settings", 200, "Settings — Boilerplate"],
      ["/account?auth=1", 200, "Account — Boilerplate"],
      ["/login?from=%2Faccount", 200, "Login — Boilerplate"],
      ["/missing", 404, "Page not found — Boilerplate"],
      ["/guides/Not_Kebab", 404, "Page not found — Boilerplate"],
    ]) {
      const response = await request(path);
      assert.equal(response.status, status, path);
      assert.match(
        await response.text().then(strip),
        new RegExp(`<title>${title}</title>`),
      );
    }
  });

  test("redirects the legacy home and the unauthenticated account", async () => {
    const legacy = await request("/home");
    assert.equal(legacy.status, 301);
    assert.equal(legacy.headers.get("location"), "/");
    const account = await request("/account");
    assert.equal(account.status, 302);
    assert.equal(account.headers.get("location"), "/login?from=%2Faccount");
  });

  test("renders the 404 page outside the top bar", async () => {
    const html = await (await request("/missing")).text().then(strip);
    assert.match(html, /<h1>Page not found<\/h1>/);
    assert.doesNotMatch(html, /top-bar/);
  });

  test("serves the sitemap, the icons and the stylesheet", async () => {
    const sitemap = await (await request("/sitemap.xml")).text().then(strip);
    assert.equal(sitemap.match(/<url>/g).length, 9);
    assert.match(sitemap, /<loc>[^<]*\/guides\/router-core<\/loc>/);
    assert.match(sitemap, /<priority>0.3<\/priority>/);
    const icon = await request("/icons/plus.svg");
    assert.equal(icon.status, 200);
    assert.match(icon.headers.get("content-type"), /image\/svg\+xml/);
    assert.equal((await request("/icons/..%2Fpackage.json")).status, 404);
    assert.equal((await request("/icons/not-an-icon.svg")).status, 404);
    const html = await (await request("/")).text().then(strip);
    const css = html.match(/href="([^"]+\.css)"/);
    assert.ok(css);
    assert.equal((await request(css[1])).status, 200);
  });

  test("renders the theme cookie's class on <html>", async () => {
    const page = (cookie) =>
      request("/", { headers: { cookie } }).then((response) =>
        response.text().then(strip),
      );
    const [dark, light, invalid, none] = await Promise.all([
      page("theme=dark"),
      page("theme=light"),
      page("theme=sepia"),
      page(""),
    ]);
    assert.match(dark, /class="app comfortable dark"/);
    assert.match(light, /class="app comfortable light"/);
    assert.match(invalid, /class="app comfortable"/);
    assert.match(none, /class="app comfortable"/);
    assert.match(dark, /<option value="dark" selected/);
  });

  test("negotiates the locale per request, with lang and dir", async () => {
    const [fr, ar] = await Promise.all([
      request("/", { headers: { "accept-language": "fr-CA,fr;q=0.9" } }).then(
        (response) => response.text().then(strip),
      ),
      request("/", {
        headers: { cookie: "locale=ar", "accept-language": "fr" },
      }).then((response) => response.text().then(strip)),
    ]);
    assert.match(fr, /lang="fr" dir="ltr"/);
    assert.match(fr, /<a aria-current="page" href="\/">Accueil<\/a>/);
    assert.match(ar, /lang="ar" dir="rtl"/);
    assert.doesNotMatch(ar, /Accueil/);
  });

  test("marks the current page in the top bar", async () => {
    const html = await (await request("/catalog")).text().then(strip);
    assert.match(html, /<a aria-current="page" href="\/catalog">Catalog<\/a>/);
    assert.match(html, /<a href="\/account\?auth=1">Demo sign-in<\/a>/);
  });

  test("server-renders the catalog's first page", async () => {
    const html = await (await request("/catalog")).text().then(strip);
    assert.match(html, /Signed in as <strong>Ada Lovelace<\/strong>/);
    assert.match(html, /showing 4 of 6 products/);
    assert.equal(html.match(/<article /g).length, 4);
    assert.match(html, /\$1,899.00/);
    assert.match(html, /More products are available./);
    const french = await (
      await request("/catalog", { headers: { cookie: "locale=fr" } })
    )
      .text()
      .then(strip);
    assert.match(french, /1\s899,00\s\$US/);
    assert.match(french, /noté 4,7/);
  });

  test("renders the dashboard in the application shell", async () => {
    const html = await (await request("/dashboard")).text().then(strip);
    assert.match(html, /class="ds application-shell surface"/);
    assert.match(html, /<main class="main" id="main-content">/);
    assert.match(html, /href="#main-content">Skip to main content</);
    assert.match(
      html,
      /<a aria-current="page" class="row" href="\/dashboard">/,
    );
    assert.match(
      html,
      /<span class="link" aria-current="page">Overview<\/span>/,
    );
    assert.match(html, /2 minutes ago/);
    assert.match(html, /2.4 TB/);
    const french = await (
      await request("/dashboard", { headers: { cookie: "locale=fr" } })
    )
      .text()
      .then(strip);
    assert.match(french, /il y a 2 minutes/);
    assert.match(french, /hier/);
  });
});

describe("the theme and language without JavaScript", () => {
  test("/preferences stores the theme cookie and the next render has its class", async () => {
    const response = await post("/preferences", "theme=dark", {
      referer: `${base}/catalog`,
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), `${base}/catalog`);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /^theme=dark; /);
    assert.match(cookie, /Path=\//);
    assert.match(cookie, /Max-Age=31536000/);
    assert.match(cookie, /SameSite=Lax/);
    assert.doesNotMatch(cookie, /HttpOnly/i);
    const next = await (
      await request("/catalog", { headers: { cookie: "theme=dark" } })
    )
      .text()
      .then(strip);
    assert.match(next, /class="app comfortable dark"/);
  });

  test("/preferences clears the cookie for system", async () => {
    const response = await post("/preferences", "theme=system");
    assert.equal(response.status, 303);
    assert.match(response.headers.get("set-cookie"), /^theme=; .*Max-Age=0/);
  });

  test("/language stores the locale cookie and the next render has lang and dir", async () => {
    const response = await post("/language", "locale=ar", {
      referer: `${base}/`,
    });
    assert.equal(response.status, 303);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /^locale=ar; /);
    assert.match(cookie, /Max-Age=31536000/);
    assert.match(cookie, /SameSite=Lax/);
    assert.doesNotMatch(cookie, /HttpOnly/i);
    const next = await (
      await request("/", { headers: { cookie: "locale=ar" } })
    )
      .text()
      .then(strip);
    assert.match(next, /lang="ar" dir="rtl"/);
    assert.equal(
      (await post("/language", "locale=pt")).headers.get("set-cookie"),
      null,
    );
  });

  test("both return only to this origin", async () => {
    for (const [endpoint, body] of [
      ["/preferences", "theme=dark"],
      ["/language", "locale=fr"],
    ]) {
      for (const [referer, expected] of [
        [`${base}/catalog?x=1`, `${base}/catalog?x=1`],
        ["https://evil.example/", "/"],
        ["not a URL", "/"],
      ]) {
        const response = await post(endpoint, body, { referer });
        assert.equal(response.status, 303);
        assert.equal(response.headers.get("location"), expected);
      }
    }
  });

  test("the Apply buttons post the forms in a browser without JavaScript", async () => {
    await withPage({ javaScriptEnabled: false }, async (page) => {
      await page.goto(`${base}/catalog`);
      const apply = page.getByRole("button", { name: "Apply" });
      assert.equal(await apply.count(), 2);
      await page.getByLabel("Color theme").selectOption("dark");
      await apply.first().click();
      await page.waitForURL(`${base}/catalog`);
      assert.equal(await htmlClass(page), "app comfortable dark");
      await page.getByLabel("Language").selectOption("ar");
      await page.getByRole("button", { name: "Apply" }).last().click();
      await page.waitForURL(`${base}/catalog`);
      assert.equal(await page.locator("html").getAttribute("lang"), "ar");
      assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
      assert.equal(await htmlClass(page), "app comfortable dark");
    });
  });
});

describe("the theme and language with JavaScript", () => {
  test("a theme applies on select, writes the cookie and shows no Apply", async () => {
    await withPage({}, async (page, context) => {
      await open(page, "/");
      assert.equal(
        await page.getByRole("button", { name: "Apply" }).count(),
        0,
      );
      await page.getByLabel("Color theme").selectOption("dark");
      assert.equal(await htmlClass(page), "app comfortable dark");
      const cookie = (await context.cookies()).find(
        (entry) => entry.name === "theme",
      );
      assert.equal(cookie?.value, "dark");
      assert.equal(cookie?.httpOnly, false);
      await page.reload();
      assert.equal(await htmlClass(page), "app comfortable dark");
      assert.equal(await page.getByLabel("Color theme").inputValue(), "dark");
      await page.getByLabel("Color theme").selectOption("system");
      assert.equal(await htmlClass(page), "app comfortable");
      assert.equal(
        (await context.cookies()).some((entry) => entry.name === "theme"),
        false,
      );
    });
  });

  test("a theme cookie the server set can be overwritten by the page", async () => {
    await withPage({}, async (page) => {
      await page.request.post(`${base}/preferences`, {
        form: { theme: "dark" },
        headers: { origin: base },
        maxRedirects: 0,
      });
      await open(page, "/");
      assert.equal(await htmlClass(page), "app comfortable dark");
      await page.getByLabel("Color theme").selectOption("light");
      await page.reload();
      assert.equal(await htmlClass(page), "app comfortable light");
    });
  });

  test("a language applies on select: every string, lang, dir and the cookie", async () => {
    await withPage({}, async (page, context) => {
      await open(page, "/");
      await page.getByLabel("Language").selectOption("fr");
      await page.getByRole("link", { name: "Accueil" }).first().waitFor();
      assert.equal(await page.locator("html").getAttribute("lang"), "fr");
      await page.getByLabel("Langue").selectOption("ar");
      await page.waitForFunction(() => document.documentElement.dir === "rtl");
      assert.equal(
        (await context.cookies()).find((entry) => entry.name === "locale")
          ?.value,
        "ar",
      );
      assert.equal(
        await page.getByRole("button", { name: /Apply|تطبيق/ }).count(),
        0,
      );
      await page.reload();
      assert.equal(await page.locator("html").getAttribute("lang"), "ar");
    });
  });

  test("the language selector lists each language by its endonym", async () => {
    await withPage({}, async (page) => {
      await open(page, "/");
      const options = page.getByLabel("Language").locator("option");
      assert.deepEqual(await options.allTextContents(), [
        "English",
        "français",
        "العربية",
      ]);
      assert.deepEqual(
        await options.evaluateAll((elements) =>
          elements.map((element) => element.lang),
        ),
        ["en", "fr", "ar"],
      );
    });
  });
});

describe("the pages", () => {
  test("the home page streams its delayed content in", async () => {
    await withPage({}, async (page) => {
      await page.goto(base);
      await page.getByText("Streamed in after a delay").waitFor();
      assert.equal(
        await page.locator("code.ds.inline-code").first().textContent(),
        "ExampleComponent.stories.svelte",
      );
    });
  });

  test("client navigation to the account page respects the demo guard", async () => {
    await withPage({}, async (page) => {
      await open(page, "/");
      await page.evaluate(() => {
        const link = document.createElement("a");
        link.href = "/account";
        link.textContent = "Protected";
        document.querySelector("main")?.append(link);
      });
      await page.getByRole("link", { name: "Protected" }).click();
      await page.waitForURL("**/login?from=%2Faccount");
      await page.getByText("You will be redirected to /account").waitFor();
      await page.getByRole("link", { name: "Demo sign-in" }).click();
      await page.getByRole("heading", { name: "Account" }).waitFor();
    });
  });

  test("the contact form requires the email and logs the values", async () => {
    await withPage({}, async (page) => {
      const logs = [];
      page.on("console", (message) => logs.push(message.text()));
      await open(page, "/contact");
      await page.getByLabel("Full name").fill("Ada");
      await page.getByLabel("Email address").fill("ada@example.com");
      await page.getByLabel("Message").fill("Hello");
      await page.getByRole("button", { name: "Send message" }).click();
      assert.ok(logs.some((line) => line.startsWith("Form submitted:")));
      assert.equal(page.url(), `${base}/contact`);
    });
  });

  test("the contact form validates without JavaScript", async () => {
    const response = await post("/contact", "name=Ada&email=&subject=support", {
      accept: "text/html",
    });
    assert.equal(response.status, 400);
    const html = await response.text().then(strip);
    assert.match(html, /Email is required/);
    assert.match(html, /value="Ada"/);
    const valid = await post("/contact", "name=Ada&email=ada%40example.com", {
      accept: "text/html",
    });
    assert.equal(valid.status, 200);
  });

  test("Create instance on the overview navigates to the instances", async () => {
    await withPage({}, async (page) => {
      await open(page, "/dashboard");
      await page.evaluate(() => {
        window.__sameDocument = true;
      });
      await page.getByRole("button", { name: "Create instance" }).click();
      await page.waitForURL(`${base}/dashboard/instances`);
      assert.equal(await page.evaluate(() => window.__sameDocument), true);
      await page
        .getByRole("navigation", { name: "Breadcrumb" })
        .getByText("Instances")
        .waitFor();
    });
  });

  test("the instances page selects, creates and closes its panel", async () => {
    await withPage({}, async (page) => {
      await open(page, "/dashboard/instances");
      await page.getByText("Select an instance to see its details.").waitFor();
      const details = page.getByRole("button", {
        name: "Show details of db-01",
      });
      await details.click();
      assert.equal(await details.getAttribute("aria-pressed"), "true");
      await page.getByRole("heading", { name: "db-01" }).waitFor();
      await page.getByText("16 GiB").waitFor();
      assert.equal(page.url(), `${base}/dashboard/instances`);

      const create = page
        .locator("header")
        .getByRole("button", { name: "Create instance" });
      await create.click();
      const panel = page.getByRole("dialog", { name: "Create instance" });
      await panel.waitFor();
      assert.equal(
        await panel.getByLabel("Instance name").inputValue(),
        "web-03",
      );
      assert.equal(
        await panel.getByLabel("Ubuntu release").inputValue(),
        "noble",
      );
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
      assert.equal(
        await create.evaluate((element) => element === document.activeElement),
        true,
      );

      await create.click();
      await panel.getByLabel("Instance name").fill("web-04");
      await panel.getByLabel("Ubuntu release").selectOption("jammy");
      await panel.getByRole("button", { name: "Create instance" }).click();
      await panel.waitFor({ state: "hidden" });
      await page.getByRole("heading", { name: "web-04" }).waitFor();
      assert.equal(await page.locator("h1 .ds.badge").textContent(), "7");
      assert.equal(
        await page
          .getByRole("button", { name: "Show details of web-04" })
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.getByText("Starting", { exact: true }).waitFor();
    });
  });

  test("the instances page works without JavaScript", async () => {
    const selected = await (
      await request("/dashboard/instances?selected=db-01")
    )
      .text()
      .then(strip);
    assert.match(selected, /<h2 id="details-title">db-01<\/h2>/);
    assert.match(selected, /aria-pressed="true"/);
    assert.match(
      await (await request("/dashboard/instances?create=1")).text().then(strip),
      /<dialog[^>]* open/,
    );
    const created = await post(
      "/dashboard/instances?/create",
      "instance_name=web-09&release=focal",
      { accept: "text/html" },
    );
    assert.equal(created.status, 200);
    const html = await created.text().then(strip);
    assert.match(html, /<div class="ds tile-header">web-09<\/div>/);
    assert.match(html, /<h2 id="details-title">web-09<\/h2>/);
    assert.match(html, /Ubuntu 20.04 LTS/);
    const invalid = await post(
      "/dashboard/instances?/create",
      "instance_name=&release=noble",
      { accept: "text/html" },
    );
    assert.equal(invalid.status, 400);
    assert.match(await invalid.text().then(strip), /Instance name is required/);
  });

  test("the settings page confirms the deletion in a modal", async () => {
    await withPage({}, async (page) => {
      const logs = [];
      page.on("console", (message) => logs.push(message.text()));
      await open(page, "/dashboard/settings");
      assert.equal(
        await page.getByLabel("Default bridge").inputValue(),
        "lxdbr0",
      );
      assert.equal(
        await page.getByLabel("Maximum instances").inputValue(),
        "50",
      );
      await page.getByRole("button", { name: "Save changes" }).click();
      assert.ok(logs.some((line) => line.startsWith("Settings saved:")));
      await page.getByRole("button", { name: "Delete project" }).click();
      const dialog = page.getByRole("dialog", { name: "Delete project?" });
      await dialog.waitFor();
      await dialog.getByText("default project").waitFor();
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await dialog.waitFor({ state: "hidden" });
    });
  });

  test("the settings form posts without JavaScript", async () => {
    const response = await post(
      "/dashboard/settings?/save",
      "bridge=ovn-1&max_instances=10",
      { accept: "text/html" },
    );
    assert.equal(response.status, 200);
  });

  test("the side navigation follows the page and discloses Help", async () => {
    await withPage({}, async (page) => {
      await open(page, "/dashboard");
      const navigation = page.getByRole("navigation", { name: "Dashboard" });
      await navigation.getByRole("link", { name: "Settings" }).click();
      await page.waitForURL(`${base}/dashboard/settings`);
      assert.equal(
        await navigation
          .getByRole("link", { name: "Settings" })
          .getAttribute("aria-current"),
        "page",
      );
      assert.equal(
        await navigation
          .getByText("Networks")
          .evaluate((element) => element.closest("a")),
        null,
      );
      await navigation.getByText("Help").click();
      assert.equal(
        await navigation
          .getByRole("link", { name: "Legal information" })
          .getAttribute("href"),
        "https://ubuntu.com/legal",
      );
    });
  });
});
