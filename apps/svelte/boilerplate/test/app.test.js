import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { after, before, test } from "node:test";
import { chromium } from "playwright";

let server;
let base;
let browser;

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

test("built server returns real statuses, isolated data and assets", async () => {
  const request = (path, options = {}) =>
    fetch(new URL(path, base), { redirect: "manual", ...options });
  const home = await request("/");
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /<title>Home \| Svelte reference<\/title>/);
  assert.match(html, /href="\/catalog"/);
  assert.doesNotMatch(html, /graphql/i);
  assert.equal((await request("/graphql-demo")).status, 404);
  assert.equal((await request("/graphql")).status, 404);
  const css = html.match(/href="([^"]+\.css)"/);
  assert.ok(css);
  assert.equal((await request(css[1])).status, 200);
  const icon = await request("/icons/information.svg");
  assert.equal(icon.status, 200);
  assert.match(icon.headers.get("content-type"), /image\/svg\+xml/);
  assert.match(await icon.text(), /id="information"/);
  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(await sitemap.text(), /\/catalog\/compute/);
  const legacy = await request("/home");
  assert.equal(legacy.status, 301);
  assert.equal(legacy.headers.get("location"), "/");
  const privatePage = await request("/dashboard");
  assert.equal(privatePage.status, 200);
  const account = await request("/account");
  assert.equal(account.status, 302);
  assert.equal(account.headers.get("location"), "/login?from=%2Faccount");
  assert.equal((await request("/login")).status, 200);
  assert.equal((await request("/account?auth=1")).status, 200);
  const protectedAction = await request("/dashboard/settings", {
    method: "POST",
    headers: {
      origin: base,
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "name=Alice",
  });
  assert.equal(protectedAction.status, 400);
  for (const path of ["/missing", "/catalog/missing"]) {
    const missing = await request(path);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /<h1>404<\/h1>/);
  }
  const [alice, bob] = await Promise.all([
    request("/catalog/compute?view=detail", {
      headers: { cookie: "visitor=Alice; theme=dark" },
    }).then((response) => response.text()),
    request("/catalog/compute?view=detail", {
      headers: { cookie: "visitor=Bob; theme=light" },
    }).then((response) => response.text()),
  ]);
  assert.match(alice, /Viewing as Alice/);
  assert.doesNotMatch(alice, /Viewing as Bob/);
  assert.match(alice, /class="app comfortable dark"/);
  assert.match(bob, /Viewing as Bob/);
  assert.doesNotMatch(bob, /Viewing as Alice/);
  assert.match(bob, /class="app comfortable light"/);
  assert.match(bob, /detail/);
  const escaped = await request("/catalog/compute", {
    headers: { cookie: "visitor=%3Cscript%3E" },
  });
  assert.doesNotMatch(await escaped.text(), /Viewing as <script>/);
  const invalidTheme = await request("/", {
    headers: { cookie: "theme=invalid" },
  });
  assert.match(await invalidTheme.text(), /class="app comfortable "/);
});

test("locale negotiation and concurrent SSR are isolated", async () => {
  const [fr, ar] = await Promise.all([
    fetch(base, { headers: { "accept-language": "fr-CA,fr;q=0.9" } }).then(
      (response) => response.text(),
    ),
    fetch(base, {
      headers: { cookie: "locale=ar", "accept-language": "fr" },
    }).then((response) => response.text()),
  ]);
  assert.match(fr, /lang="fr" dir="ltr"/);
  assert.match(fr, /Application de référence Svelte/);
  assert.match(ar, /lang="ar" dir="rtl"/);
  assert.match(ar, /تطبيق Svelte المرجعي/);
  assert.doesNotMatch(ar, /Application de référence Svelte/);
});

test("account POST uses the same demo guard and rejects cross-origin requests", async () => {
  const post = (path, cookie, origin = base) =>
    fetch(`${base}${path}`, {
      method: "POST",
      redirect: "manual",
      headers: {
        origin,
        accept: "text/html",
        "content-type": "application/x-www-form-urlencoded",
        ...(cookie ? { cookie } : {}),
      },
      body: "",
    });
  const denied = await post("/account");
  assert.equal(denied.status, 302);
  assert.equal(denied.headers.get("location"), "/login?from=%2Faccount");
  assert.equal(denied.headers.get("set-cookie"), null);
  const allowed = await post("/account", "demo-session=yes");
  assert.equal(allowed.status, 303);
  assert.equal(allowed.headers.get("location"), "/dashboard");
  assert.equal((await post("/account?auth=1")).status, 303);
  for (const path of ["/account", "/account?auth=1", "/login"]) {
    const response = await post(
      path,
      "demo-session=yes",
      "https://evil.example",
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("client navigation respects account demo guard", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: "Account", exact: true }).click();
    await page.waitForURL("**/login?from=%2Faccount");
    await page.getByRole("heading", { name: "Demo login" }).waitFor();
    await page.getByRole("button", { name: "Enter demo account" }).click();
    await page.getByRole("heading", { name: "Demo account" }).waitFor();
    await page.getByRole("button", { name: "Enter demo dashboard" }).click();
    await page.getByRole("heading", { name: "Dashboard" }).waitFor();
  } finally {
    await context.close();
  }
});

test("preference redirects remain on origin for hostile and normal referers", async () => {
  for (const [endpoint, body] of [
    ["/preferences", "theme=dark"],
    ["/language", "locale=fr"],
  ]) {
    for (const referer of [
      `${base}//evil.example/path?x=1`,
      `${base}/catalog?view=detail`,
      "https://evil.example/",
      "not a URL",
    ]) {
      const response = await fetch(base + endpoint, {
        method: "POST",
        redirect: "manual",
        headers: {
          origin: base,
          referer,
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
      });
      assert.equal(response.status, 303);
      const location = response.headers.get("location");
      assert.equal(new URL(location, base).origin, base);
      if (referer === `${base}/catalog?view=detail`)
        assert.equal(
          new URL(location, base).pathname + new URL(location, base).search,
          "/catalog?view=detail",
        );
      if (referer.startsWith(`${base}//`))
        assert.equal(new URL(location, base).pathname, "//evil.example/path");
    }
  }
});

test("contact rejects oversized data without truncating the submitted draft", async () => {
  for (const [name, value] of [
    ["email", `${"a".repeat(4001)}@example.com`],
    ["message", "x".repeat(4001)],
  ]) {
    const body = new URLSearchParams({
      email: "valid@example.com",
      message: "valid",
      [name]: value,
    });
    const response = await fetch(`${base}/contact`, {
      method: "POST",
      redirect: "manual",
      headers: {
        origin: base,
        accept: "text/html",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });
    assert.equal(response.status, 400);
    const html = await response.text();
    assert.match(html, /Enter no more than 4000 characters/);
    assert.ok(html.includes(value));
    assert.doesNotMatch(html, /Your message was received/);
  }
});

test("contact action validates and redisplays without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.getByLabel("Email").fill("incorrect");
    await page.getByLabel("Message").fill("A safe draft");
    const response = await Promise.all([
      page.waitForNavigation(),
      page.getByRole("button", { name: "Send" }).click(),
    ]);
    assert.equal(response[0].status(), 400);
    assert.equal(await page.getByLabel("Message").inputValue(), "A safe draft");
    assert.equal(
      await page.getByLabel("Email").getAttribute("aria-invalid"),
      "true",
    );
    assert.match(
      await page.locator("#email .field-error").textContent(),
      /valid email/,
    );
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: "Send" }).click();
    assert.match(
      await page.getByRole("status").filter({ hasText: /\S/ }).textContent(),
      /received/,
    );
  } finally {
    await context.close();
  }
});

test("enhanced contact keeps edits made during an earlier submission", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    let release;
    const blocked = new Promise((resolve) => {
      release = resolve;
    });
    let requests = 0;
    await page.route("**/contact", async (route) => {
      if (route.request().method() === "POST") {
        requests++;
        await blocked;
      }
      await route.continue();
    });
    await page.getByLabel("Email").fill("a@example.com");
    await page.getByLabel("Message").fill("First");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByLabel("Message").fill("Second draft");
    await page
      .locator("form[method=POST]")
      .last()
      .evaluate((form) => form.requestSubmit());
    release();
    await page.getByText(/earlier message was received/).waitFor();
    assert.equal(requests, 1);
    assert.equal(await page.getByLabel("Message").inputValue(), "Second draft");
    assert.equal(
      await page.getByRole("button", { name: "Send" }).isEnabled(),
      true,
    );
  } finally {
    await context.close();
  }
});

test("enhanced contact handles invalid and successful submissions", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("invalid");
    await page.getByLabel("Message").fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await page.locator("#email .field-error").waitFor();
    assert.equal(await page.getByLabel("Message").inputValue(), "Hello");
    await page.getByLabel("Email").fill("a@example.com");
    await page.getByRole("button", { name: "Send" }).click();
    await page
      .getByRole("status")
      .getByText("Your message was received.")
      .waitFor();
    assert.equal(await page.getByLabel("Message").inputValue(), "Hello");
  } finally {
    await context.close();
  }
});

test("editing a field only clears that field's server error", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByText("Enter a valid email address.").waitFor();
    await page.getByText("Enter a message.").waitFor();
    await page.getByLabel("Email").fill("valid@example.com");
    assert.equal(await page.locator("#email .field-error").count(), 0);
    assert.equal(
      await page.getByLabel("Email").getAttribute("aria-invalid"),
      "false",
    );
    assert.equal(
      await page.getByLabel("Message").getAttribute("aria-invalid"),
      "true",
    );
    assert.match(
      await page.locator("#message .field-error").textContent(),
      /Enter a message/,
    );
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByText("Enter a message.").waitFor();
    await page.getByLabel("Message").fill("Hello");
    await page.getByRole("button", { name: "Send" }).click();
    await page
      .getByRole("status")
      .getByText("Your message was received.")
      .waitFor();
  } finally {
    await context.close();
  }
});

test("server errors remain independent after failed native submission and hydration", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const response = await page.request.post(`${base}/contact`, {
      headers: { origin: base, accept: "text/html" },
      form: { email: "", message: "" },
    });
    assert.equal(response.status(), 400);
    const body = await response.text();
    await page.route(
      "**/contact",
      (route) => route.fulfill({ status: 400, contentType: "text/html", body }),
      { times: 1 },
    );
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Email").fill("valid@example.com");
    assert.equal(await page.locator("#email .field-error").count(), 0);
    assert.match(
      await page.locator("#message .field-error").textContent(),
      /Enter a message/,
    );
    assert.equal(
      await page.getByLabel("Message").getAttribute("aria-describedby"),
      await page.locator("#message .field-error").getAttribute("id"),
    );
  } finally {
    await context.close();
  }
});

test("an obsolete validation failure does not overwrite the current draft", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    let release;
    const blocked = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/contact", async (route) => {
      if (route.request().method() === "POST") await blocked;
      await route.continue();
    });
    await page.getByLabel("Email").fill("invalid");
    await page.getByLabel("Message").fill("First");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByLabel("Email").fill("valid@example.com");
    release();
    await page.getByText(/earlier submission was invalid/).waitFor();
    assert.equal(
      await page.getByLabel("Email").inputValue(),
      "valid@example.com",
    );
    assert.equal(await page.locator("#email .field-error").count(), 0);
  } finally {
    await context.close();
  }
});

test("contact reports a failed transport and allows retry", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/contact`);
    await page.waitForLoadState("networkidle");
    await page.route("**/contact", (route) =>
      route.request().method() === "POST"
        ? route.abort("failed")
        : route.continue(),
    );
    await page.getByLabel("Email").fill("valid@example.com");
    await page.getByLabel("Message").fill("Draft");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByText(/result could not be confirmed/).waitFor();
    assert.equal(await page.getByLabel("Message").inputValue(), "Draft");
    assert.equal(
      await page.getByRole("button", { name: "Send" }).isEnabled(),
      true,
    );
  } finally {
    await context.close();
  }
});

test("contact text typed before hydration survives client startup", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  try {
    const page = await context.newPage();
    await page.route("**/_app/immutable/entry/start.*.js", async (route) => {
      await blocked;
      await route.continue();
    });
    await page.goto(`${base}/contact`, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill("early@example.com");
    await page.getByLabel("Message").fill("Early draft");
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(
      await page.getByLabel("Email").inputValue(),
      "early@example.com",
    );
    assert.equal(await page.getByLabel("Message").inputValue(), "Early draft");
  } finally {
    release();
    await context.close();
  }
});

test("preferences selected before hydration survive and can be applied", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  try {
    const page = await context.newPage();
    await page.route(
      "**/_app/immutable/entry/start.*.js",
      async (route) => {
        await blocked;
        await route.continue();
      },
      { times: 1 },
    );
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.getByLabel("Theme").selectOption("dark");
    await page.getByLabel("Language").selectOption("fr");
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(await page.getByLabel("Theme").inputValue(), "dark");
    assert.equal(await page.getByLabel("Language").inputValue(), "fr");
    await page.locator('form[action="/language"] button').click();
    await page
      .getByRole("heading", { name: "Application de référence Svelte" })
      .waitFor();
    assert.equal(await page.getByLabel("Thème").inputValue(), "dark");
    await page.locator('form[action="/preferences"] button').click();
    assert.match(await page.locator("html").getAttribute("class"), /dark/);
    assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  } finally {
    release();
    await context.close();
  }
});

test("demo dashboard settings validate and persist without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/settings`);
    await page.getByLabel("Display name").fill("");
    await page.getByRole("button", { name: "Save" }).click();
    assert.match(
      await page.locator("#name .field-error").textContent(),
      /display name/,
    );
    await page.getByLabel("Display name").fill("Alex");
    await page.getByLabel("Default bridge").selectOption("ovn-1");
    await page.getByLabel("Enable IPv6 NAT").uncheck();
    await page.getByLabel("Nightly snapshots").uncheck();
    await page.getByLabel("Maximum instances").fill("12");
    await page.getByRole("button", { name: "Save" }).click();
    assert.match(await page.getByRole("status").textContent(), /saved/);
    await page.getByRole("link", { name: "Overview" }).click();
    assert.match(await page.locator("main").textContent(), /Welcome, Alex/);
    await page
      .getByRole("navigation", { name: "Dashboard navigation" })
      .getByRole("link", { name: "Settings" })
      .click();
    assert.equal(await page.getByLabel("Default bridge").inputValue(), "ovn-1");
    assert.equal(await page.getByLabel("Maximum instances").inputValue(), "12");
    assert.equal(await page.getByLabel("Enable IPv6 NAT").isChecked(), false);
    assert.equal(await page.getByLabel("Nightly snapshots").isChecked(), false);
  } finally {
    await context.close();
  }
});

test("demo instances validate, create, select and remove without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances`);
    await page.locator(".instance-panel summary").click();
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(await page.getByRole("alert").count(), 1);
    assert.equal(
      await page.getByLabel("Instance name").getAttribute("aria-invalid"),
      "true",
    );
    await page.getByLabel("Instance name").fill("web-01");
    await page.getByLabel("Release").selectOption("jammy");
    await page.getByLabel("Enable Pro").check();
    await page.getByLabel("Cloud-init user data").fill("#cloud-config");
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.locator("#instance-details").waitFor();
    assert.match(
      await page.locator("#instance-details").locator("..").textContent(),
      /jammy/,
    );
    assert.match(
      await page.locator("#instance-details").locator("..").textContent(),
      /Yes/,
    );
    assert.match(
      await page.locator("#instance-details").locator("..").textContent(),
      /#cloud-config/,
    );
    await page.locator(".instance-panel summary").click();
    await page.getByLabel("Instance name").fill("web-01");
    await page.getByRole("button", { name: "Create demo instance" }).click();
    assert.match(await page.getByRole("alert").textContent(), /already exists/);
    await page.getByRole("link", { name: "web-01" }).click();
    await page.getByRole("link", { name: "Remove demo instance" }).click();
    await page
      .getByRole("heading", { name: "Remove demo instance?" })
      .waitFor();
    await page.getByRole("link", { name: "Cancel" }).click();
    await page.getByRole("link", { name: "Remove demo instance" }).click();
    await page.getByRole("button", { name: "Remove demo instance" }).click();
    await page.getByText("No demo instances yet.").waitFor();
  } finally {
    await context.close();
  }
});

test("release options come from the endpoint and render on the server", async () => {
  const options = await fetch(`${base}/api/releases`).then((response) =>
    response.json(),
  );
  assert.deepEqual(
    options.map((option) => option.value),
    ["noble", "jammy", "focal"],
  );
  const html = await fetch(`${base}/dashboard/instances?create=1`).then(
    (response) => response.text(),
  );
  for (const option of options)
    assert.match(
      html,
      new RegExp(
        `<option[^>]*value="${option.value}"[^>]*>${option.label}</option>`,
      ),
    );
});

test("instance name endpoint answers the remote check from the request's cookie", async () => {
  const check = (value, cookie) =>
    fetch(`${base}/api/instance-name`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ value }),
    });
  const cookie = `demo-instances=${encodeURIComponent(JSON.stringify([{ name: "taken-01", release: "noble", pro: false, cloudInit: "" }]))}`;
  assert.equal((await check("taken-01")).status, 200);
  const taken = await check("taken-01", cookie);
  assert.equal(taken.status, 409);
  assert.deepEqual(await taken.json(), { error: "instanceDuplicate" });
  assert.equal((await check("free-01", cookie)).status, 200);
  assert.equal(
    (
      await fetch(`${base}/api/instance-name`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    400,
  );
});

test("hydrated instance name is checked remotely and a taken name does not post", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    await context.addCookies([
      {
        name: "demo-instances",
        value: encodeURIComponent(
          JSON.stringify([
            { name: "taken-01", release: "noble", pro: false, cloudInit: "" },
          ]),
        ),
        url: base,
      },
    ]);
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances?create=1`);
    await page.waitForLoadState("networkidle");
    let posts = 0;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/create"))
        posts++;
    });
    const name = page.getByLabel("Instance name");
    await name.fill("taken-01");
    await page
      .locator("#instance-name .field-error")
      .getByText("That instance name already exists.")
      .waitFor();
    assert.equal(await name.getAttribute("aria-invalid"), "true");
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.waitForTimeout(500);
    assert.equal(posts, 0);
    await name.fill("fresh-01");
    await page
      .locator("#instance-name .field-error")
      .waitFor({ state: "detached" });
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page.waitForURL("**/dashboard/instances?selected=fresh-01");
    await page.locator("#instance-details").waitFor();
    assert.equal(posts, 1);
  } finally {
    await context.close();
  }
});

test("enhanced instance creation shows the action's fail() message on the field", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances?create=1`);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Instance name").fill("Not Valid");
    await page.getByRole("button", { name: "Create demo instance" }).click();
    await page
      .locator("#instance-name .field-error")
      .getByText(/lowercase name/)
      .waitFor();
    assert.equal(await page.getByRole("alert").count(), 1);
    assert.equal(
      await page.getByLabel("Instance name").inputValue(),
      "Not Valid",
    );
    assert.equal(new URL(page.url()).pathname, "/dashboard/instances");
    await page.getByLabel("Instance name").fill("not-valid");
    assert.equal(await page.locator("#instance-name .field-error").count(), 0);
  } finally {
    await context.close();
  }
});

test("dashboard navigation and creation panel work from the keyboard without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 800 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances`);
    const nav = page.getByRole("navigation", { name: "Dashboard navigation" });
    assert.equal(await nav.getByRole("link", { name: "Networks" }).count(), 0);
    assert.equal(
      await nav
        .getByText("Networks (Unavailable)")
        .getAttribute("aria-disabled"),
      "true",
    );
    await nav.getByText("Help", { exact: true }).click();
    assert.equal(
      await nav
        .getByRole("link", { name: "Legal information" })
        .getAttribute("href"),
      "https://ubuntu.com/legal",
    );
    await page.getByText("Select an instance to view its details.").waitFor();
    const summary = nav.locator("summary").first();
    await summary.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await nav.getByRole("link", { name: "Settings" }).isVisible(),
      false,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await nav.getByRole("link", { name: "Settings" }).isVisible(),
      true,
    );
    const panel = page.getByRole("complementary", {
      name: "Create demo instance",
    });
    await panel.locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.getByLabel("Instance name").isVisible(), true);
    await panel.locator("summary").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.getByLabel("Instance name").isVisible(), false);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
  } finally {
    await context.close();
  }
});

test("overview launch opens the requested release form with and without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      const page = await context.newPage();
      await page.goto(`${base}/dashboard`);
      assert.match(
        await page.getByRole("region", { name: "Sample status" }).textContent(),
        /128/,
      );
      assert.match(
        await page
          .getByRole("complementary", { name: "Sample activity" })
          .textContent(),
        /web-01/,
      );
      assert.equal(
        await page
          .getByRole("complementary", { name: "Sample activity" })
          .locator("li")
          .count(),
        5,
      );
      assert.match(
        await page.getByRole("region", { name: "Sample status" }).textContent(),
        /2\.4 TB/,
      );
      const card = page.getByRole("article").filter({
        has: page.getByRole("heading", { name: "Ubuntu 22.04 LTS" }),
      });
      await card.getByRole("link", { name: "Create an instance" }).click();
      await page.getByLabel("Instance name").waitFor();
      assert.equal(await page.getByLabel("Release").inputValue(), "jammy");
      await page.getByLabel("Instance name").fill("launched-01");
      await page.getByRole("button", { name: "Create demo instance" }).click();
      await page.locator("#instance-details").waitFor();
      assert.match(
        await page.locator("#instance-details").locator("..").textContent(),
        /jammy/,
      );
    } finally {
      await context.close();
    }
  }
});

test("hydrated instance confirmation supports Escape, focus and server removal", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    await context.addCookies([
      {
        name: "demo-instances",
        value: encodeURIComponent(
          JSON.stringify([
            { name: "modal-01", release: "noble", pro: false, cloudInit: "" },
          ]),
        ),
        url: base,
      },
    ]);
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances?selected=modal-01`);
    await page.waitForLoadState("networkidle");
    const remove = page.getByRole("link", { name: "Remove demo instance" });
    await remove.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Remove demo instance?" });
    await dialog.waitFor();
    assert.equal(
      await dialog.evaluate((element) => element.matches(":modal")),
      true,
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await remove.evaluate((element) => element === document.activeElement),
      true,
    );
    await remove.click();
    await dialog.getByRole("button", { name: "Remove demo instance" }).click();
    await page.getByText("No demo instances yet.").waitFor();
  } finally {
    await context.close();
  }
});

test("side sheet and settings confirmation retain keyboard and no-JS paths", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 800 },
  });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/instances`);
    await page.waitForLoadState("networkidle");
    const toggle = page.locator(".instance-panel summary");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("Instance name").waitFor();
    await page.waitForFunction(
      () =>
        document.activeElement?.closest("#instance-name") &&
        document.activeElement.tagName === "INPUT",
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByLabel("Instance name").isVisible(), false);
    assert.equal(
      await toggle.evaluate((element) => element === document.activeElement),
      true,
    );
    await page.goto(`${base}/dashboard/settings`);
    await page.waitForLoadState("networkidle");
    const danger = page.getByRole("link", { name: "Delete demo project" });
    await danger.click();
    const dialog = page.getByRole("dialog", { name: "Delete demo project?" });
    await dialog.waitFor();
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert.equal(
      await danger.evaluate((element) => element === document.activeElement),
      true,
    );
    await danger.click();
    await dialog.getByRole("button", { name: "Delete demo project" }).click();
    await page
      .getByText("Demo confirmation complete. No project was deleted.")
      .waitFor();
  } finally {
    await context.close();
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await noJs.newPage();
    await page.goto(`${base}/dashboard/settings`);
    await page.getByRole("link", { name: "Delete demo project" }).click();
    await page.getByRole("heading", { name: "Delete demo project?" }).waitFor();
    await page.getByRole("button", { name: "Delete demo project" }).click();
    await page.getByRole("status").waitFor();
    await page.getByRole("link", { name: "Cancel" }).click();
    await page.getByLabel("Default bridge").waitFor();
  } finally {
    await noJs.close();
  }
});

test("hydration preserves a focused draft in an initially open side sheet", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  try {
    const page = await context.newPage();
    await page.route(
      "**/_app/immutable/entry/start.*.js",
      async (route) => {
        await blocked;
        await route.continue();
      },
      { times: 1 },
    );
    await page.goto(`${base}/dashboard/instances?create=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByLabel("Instance name").fill("early-draft");
    await page.getByLabel("Cloud-init user data").fill("early cloud draft");
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(
      await page
        .getByLabel("Cloud-init user data")
        .evaluate((element) => element === document.activeElement),
      true,
    );
    assert.equal(
      await page.getByLabel("Instance name").inputValue(),
      "early-draft",
    );
    assert.equal(
      await page.getByLabel("Cloud-init user data").inputValue(),
      "early cloud draft",
    );
  } finally {
    release();
    await context.close();
  }
});

test("demo actions reject tampered requests", async () => {
  const post = (body, cookie) =>
    fetch(`${base}/dashboard/instances?/create`, {
      method: "POST",
      redirect: "manual",
      headers: {
        origin: base,
        accept: "text/html",
        "content-type": "application/x-www-form-urlencoded",
        ...(cookie ? { cookie } : {}),
      },
      body,
    });
  for (const body of [
    "name=invalid%20name&release=noble",
    "name=web-01&release=invalid",
    `name=${"a".repeat(41)}&release=noble`,
  ]) {
    const response = await post(body, "demo-session=yes");
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  const tooLong = await fetch(`${base}/dashboard/settings`, {
    method: "POST",
    redirect: "manual",
    headers: {
      origin: base,
      accept: "text/html",
      cookie: "demo-session=yes",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `name=${"a".repeat(61)}`,
  });
  assert.equal(tooLong.status, 400);
  assert.equal(tooLong.headers.get("set-cookie"), null);
  for (const body of [
    "name=ok&bridge=bad&maxInstances=50",
    "name=ok&bridge=lxdbr0&maxInstances=0",
    "name=ok&bridge=lxdbr0&maxInstances=1.5",
  ]) {
    const invalid = await fetch(`${base}/dashboard/settings`, {
      method: "POST",
      redirect: "manual",
      headers: {
        origin: base,
        accept: "text/html",
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.headers.get("set-cookie"), null);
  }
  const crossOrigin = await fetch(`${base}/dashboard/settings`, {
    method: "POST",
    redirect: "manual",
    headers: {
      origin: "https://evil.example",
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "name=ok&bridge=lxdbr0&maxInstances=50",
  });
  assert.equal(crossOrigin.status, 403);
});

test("dashboard settings and instance cookies do not leak across requests", async () => {
  const settings = (name) =>
    encodeURIComponent(
      JSON.stringify({
        name,
        bridge: "lxdbr0",
        ipv6: true,
        snapshots: false,
        maxInstances: "50",
      }),
    );
  const instances = (name) =>
    encodeURIComponent(
      JSON.stringify([{ name, release: "noble", pro: false, cloudInit: "" }]),
    );
  const read = (cookie, path) =>
    fetch(`${base}${path}`, { headers: { cookie } }).then((response) =>
      response.text(),
    );
  const [alice, bob, aliceInstances, bobInstances] = await Promise.all([
    read(`demo-settings=${settings("Alice")}`, "/dashboard"),
    read(`demo-settings=${settings("Bob")}`, "/dashboard"),
    read(`demo-instances=${instances("alpha")}`, "/dashboard/instances"),
    read(`demo-instances=${instances("beta")}`, "/dashboard/instances"),
  ]);
  assert.match(alice, /Welcome, Alice/);
  assert.doesNotMatch(alice, /Welcome, Bob/);
  assert.match(bob, /Welcome, Bob/);
  assert.match(aliceInstances, /alpha/);
  assert.doesNotMatch(aliceInstances, /beta/);
  assert.match(bobInstances, /beta/);
  assert.doesNotMatch(bobInstances, /alpha/);
});

test("malformed duplicate demo records are not rendered as keyed instances", async () => {
  const record = { name: "same", release: "noble", pro: false, cloudInit: "" };
  const cookie = encodeURIComponent(JSON.stringify([record, record]));
  const response = await fetch(`${base}/dashboard/instances`, {
    headers: { cookie: `demo-instances=${cookie}` },
  });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /No demo instances yet/);
});

test("settings errors provide no-JS summary links and preserve other values", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/settings`);
    await page.getByLabel("Display name").fill("");
    await page.getByLabel("Default bridge").selectOption("ovn-1");
    await page.getByLabel("Maximum instances").fill("0");
    await page.getByRole("button", { name: "Save" }).click();
    const summary = page.getByRole("region", {
      name: "Review the following errors",
    });
    await summary
      .getByRole("link", { name: "Enter a display name." })
      .waitFor();
    await summary
      .getByRole("link", { name: "Enter a whole number from 1 to 100." })
      .click();
    assert.equal(new URL(page.url()).hash, "#maxInstances");
    assert.equal(await page.getByLabel("Default bridge").inputValue(), "ovn-1");
    assert.equal(
      await page.getByLabel("Maximum instances").getAttribute("aria-invalid"),
      "true",
    );
  } finally {
    await context.close();
  }
});

test("managed planner works without JavaScript and with live client state", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      const page = await context.newPage();
      await page.goto(`${base}/dashboard/planner`);
      if (javaScriptEnabled) await page.waitForLoadState("networkidle");
      await page.getByLabel("Project name").fill("Alpha");
      if (javaScriptEnabled) await page.getByText("Preview: Alpha").waitFor();
      await page.getByRole("button", { name: "Update preview" }).click();
      await page.waitForURL("**/dashboard/planner?project=Alpha");
      await page.getByText("Preview: Alpha").waitFor();
    } finally {
      await context.close();
    }
  }
});

test("managed planner adopts text entered before hydration", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  try {
    await context.addCookies([
      { name: "demo-session", value: "yes", url: base },
    ]);
    const page = await context.newPage();
    await page.route(
      "**/_app/immutable/entry/start.*.js",
      async (route) => {
        await blocked;
        await route.continue();
      },
      { times: 1 },
    );
    await page.goto(`${base}/dashboard/planner?project=Before`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByLabel("Project name").fill("Early draft");
    release();
    await page.waitForLoadState("networkidle");
    assert.equal(
      await page.getByLabel("Project name").inputValue(),
      "Early draft",
    );
    await page.getByText("Preview: Early draft").waitFor();
    await page.getByLabel("Project name").fill("Later draft");
    await page.getByText("Preview: Later draft").waitFor();
  } finally {
    release();
    await context.close();
  }
});

test("phone example decodes native submissions and updates in the hydrated app", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      const page = await context.newPage();
      await page.goto(`${base}/dashboard/planner`);
      if (javaScriptEnabled) await page.waitForLoadState("networkidle");
      await page.getByLabel("Country code").selectOption("GB");
      await page.getByLabel("Phone number", { exact: true }).fill("1234567");
      assert.equal(
        await page
          .getByLabel("Country code")
          .evaluate((element) =>
            new FormData(element.closest("form")).get("number"),
          ),
        "1234567",
      );
      await page.getByRole("button", { name: "Preview phone" }).click();
      await page.getByText("Phone preview: +441234567").waitFor();
    } finally {
      await context.close();
    }
  }
  const invalid = await fetch(`${base}/dashboard/phone`, {
    method: "POST",
    headers: {
      origin: base,
      accept: "text/html",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "number-country=ZZ&number=123",
  });
  assert.equal(invalid.status, 400);
  assert.match(await invalid.text(), /Choose a valid country/);
});

test("managed phone shows linked errors and keyboard focus in RTL", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({
    extraHTTPHeaders: { "accept-language": "ar" },
  });
  try {
    const page = await context.newPage();
    await page.goto(`${base}/dashboard/planner`);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    const select = page.getByLabel("رمز الدولة");
    const input = page.locator("#preview-phone input[name=number]");
    await page.getByRole("button", { name: "معاينة الهاتف" }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(await input.getAttribute("aria-invalid"), "true");
    assert.equal(await page.getByRole("alert").count(), 1);
    assert.match(
      await input.getAttribute("aria-describedby"),
      new RegExp(
        await page.locator("#preview-phone .field-error").getAttribute("id"),
      ),
    );
    assert.match(
      await page.locator("#preview-phone .field-error").textContent(),
      /دولة/,
    );
    await page.keyboard.press("Tab");
    await select.focus();
    await page.keyboard.press("Tab");
    assert.equal(
      await input.evaluate((element) => element === document.activeElement),
      true,
    );
    // The package draws the focus ring on the input chrome around the number, not as an outline.
    const ring = await input.evaluate((element) => ({
      visible: element.matches(":focus-visible"),
      shadow: getComputedStyle(element.closest(".ds.input.chrome") ?? element)
        .boxShadow,
    }));
    assert.equal(ring.visible, true);
    assert.notEqual(ring.shadow, "none");
    await input.fill("1234567");
    assert.equal(await input.getAttribute("aria-invalid"), "false");
    await page.getByRole("button", { name: "معاينة الهاتف" }).click();
    await page.getByRole("status").waitFor();
  } finally {
    await context.close();
  }
});

test("locale switch is live and persists for a cold request", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Language").selectOption("ar");
    await page.locator('form[action="/language"] button').click();
    assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
    await page.getByRole("heading", { name: "تطبيق Svelte المرجعي" }).waitFor();
    await page.reload();
    assert.equal(await page.locator("html").getAttribute("lang"), "ar");
    await page.getByRole("heading", { name: "تطبيق Svelte المرجعي" }).waitFor();
  } finally {
    await context.close();
  }
});

test("language selection works without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.getByLabel("Language").selectOption("fr");
    await page.locator('form[action="/language"] button').click();
    assert.equal(await page.locator("html").getAttribute("lang"), "fr");
    assert.equal(await page.locator("html").getAttribute("dir"), "ltr");
    await page
      .getByRole("heading", { name: "Application de référence Svelte" })
      .waitFor();
  } finally {
    await context.close();
  }
});

test("no-JavaScript navigation, preference and demo account", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.getByLabel("Theme").selectOption("dark");
    await page.locator('form[action="/preferences"] button').click();
    assert.match(await page.locator("html").getAttribute("class"), /dark/);
    await page.getByRole("link", { name: "Catalog", exact: true }).click();
    await page.getByRole("link", { name: "Compute" }).click();
    assert.equal(await page.locator("h1").textContent(), "Compute");
    assert.match(await page.locator("html").getAttribute("class"), /dark/);
    await page.goto(`${base}/account`);
    await page.getByRole("button", { name: "Enter demo account" }).click();
    await page.getByRole("button", { name: "Enter demo dashboard" }).click();
    assert.equal(await page.locator("h1").textContent(), "Dashboard");
  } finally {
    await context.close();
  }
});

test("client navigation preserves history, titles, focus and announcements", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`${base}/catalog/compute?view=detail`);
    await page.evaluate(() => {
      window.referenceMarker = 1;
    });
    await page
      .getByRole("link", { name: "Catalog", exact: true })
      .first()
      .click();
    await page.getByRole("link", { name: "Storage" }).click();
    await page.waitForURL("**/catalog/storage");
    await page.waitForFunction(
      () => document.title === "Storage | Svelte reference",
    );
    assert.equal(await page.evaluate(() => window.referenceMarker), 1);
    assert.equal(await page.locator("h1").textContent(), "Storage");
    assert.match(
      await page
        .locator("body")
        .evaluate((element) => getComputedStyle(element).fontFamily),
      /Ubuntu Sans/,
    );
    await page.waitForFunction(() =>
      document
        .querySelector("#svelte-announcer")
        ?.textContent?.includes("Storage"),
    );
    assert.equal(
      await page.evaluate(() => document.activeElement?.tagName),
      "H1",
    );
    await page.goBack();
    await page.waitForURL("**/catalog");
    await page.goBack();
    await page.waitForURL("**/catalog/compute?view=detail");
    await page.getByRole("heading", { name: "Compute" }).waitFor();
    assert.equal(await page.locator("h1").textContent(), "Compute");
    await page.goForward();
    await page.waitForURL("**/catalog");
    await page.getByRole("heading", { name: "Catalog" }).waitFor();
    assert.equal(await page.locator("h1").textContent(), "Catalog");
    assert.equal(
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Catalog", exact: true })
        .getAttribute("aria-current"),
      "page",
    );
    await page.goto(`${base}/dashboard`);
    assert.equal(await page.locator("h1").textContent(), "Dashboard");
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      "Skip to content",
    );
  } finally {
    await context.close();
  }
});

test("skip link targets the main landmark without JavaScript", async () => {
  browser ??= await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
  });
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(
      await page.evaluate(() => document.activeElement?.textContent?.trim()),
      "Skip to content",
    );
    await page.keyboard.press("Enter");
    assert.equal(await page.evaluate(() => document.activeElement?.id), "main");
  } finally {
    await context.close();
  }
});
