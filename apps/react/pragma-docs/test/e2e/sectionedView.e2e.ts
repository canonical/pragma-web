// @vitest-environment node

/**
 * The sectioned view in the browser at 1440px, where its aside holds the
 * last three of the canvas's twelve columns: on a standard's page the
 * aside sits on `-4 / -1`, sticky, 348px wide beside an 833px content
 * column whose Rule paragraph keeps a 592px measure; on Button's page the
 * aside stays where it is while the canvas scrolls to its end. Below three
 * groups, at 1366 and 390, Button's page opens on the "On this page" bar,
 * which sticks, names the current section and opens over the page without
 * moving it. At every width the section a reader chooses is current, and
 * the last one at the canvas's end. At 390 no page this unit changed
 * scrolls the document or the canvas sideways, and each of Button's tables
 * scrolls inside its own box, which ends within its section and on the
 * screen. At 1440 a token's name in the Tokens table draws its digits on
 * its letters' advance.
 */

import { launchBrowser } from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/** The desktop the view's three groups are designed for. */
const DESKTOP = { width: 1440, height: 900 } as const;

/** A laptop just below three groups, and a phone: both show the bar. */
const BAR_VIEWPORTS = [
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
] as const;

/** The phone the current section and the narrow pages are read on. */
const PHONE = { width: 390, height: 844 } as const;

/** The bar's height at most (M14). */
const BAR_MAX_BLOCK_SIZE_PX = 44;

/** The bar's hook (Annex D). */
const BAR = "[data-region=contents-bar]";

/** The fewest of Button's headings a scroll must bring to the bar's edge. */
const MIN_HEADINGS_REACHED = 2;

/** A standard's reading page, which has one section, the rule. */
const STANDARD_PATH = `/standards/${encodeURIComponent("http://pragma.canonical.com/codestandards#code.api.stability")}`;

/** Button's component page, whose sections run past the canvas's height. */
const BUTTON_PATH = `/components/${encodeURIComponent("ds:global.component.button")}`;

/** The aside's width at 1440: three columns and two gutters. */
const ASIDE_WIDTH_PX = 348;

/** The content's width at 1440: the nine columns before the aside. */
const CONTENT_WIDTH_PX = 833;

/** The prose measure at 1440. */
const PROSE_MEASURE_PX = 592;

/** How far a measured width or edge may round, in pixels. */
const TOLERANCE_PX = 1;

/** What the view's regions measure on a page. */
type ViewMeasure = {
  readonly asideColumn: readonly [string, string];
  readonly asidePosition: string;
  readonly asideWidth: number;
  readonly contentWidth: number;
  readonly ruleWidth: number | null;
};

let server: RunningServer;
let browser: Browser;

beforeAll(async () => {
  server = await startServer("dev:bun", CWD, { timeoutMs: DEV_READY_MS });
  browser = await launchBrowser();
}, DEV_READY_MS + PAGE_SETTLE_MS);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

/**
 * Open `path` at 1440 by 900, or at the viewport given, serving only the
 * app's and the graph's origins.
 *
 * @note Impure: opens a browser tab, which the caller closes.
 */
const open = async (
  path: string,
  {
    viewport = DESKTOP,
  }: {
    readonly viewport?: { readonly width: number; readonly height: number };
  } = {},
): Promise<Page> => {
  const page = await browser.newPage({ viewport });
  const origins = [
    new URL(server.base).origin,
    new URL(server.graphBase).origin,
  ];
  await page.route("**/*", (route) =>
    origins.includes(new URL(route.request().url()).origin)
      ? route.continue()
      : route.fulfill({ status: 204, body: "" }),
  );
  await page.routeWebSocket(
    () => true,
    () => {
      // Left unconnected, the dev server's live-reload socket stays silent.
    },
  );
  await page.goto(new URL(path, server.base).href, {
    waitUntil: "networkidle",
    timeout: PAGE_SETTLE_MS,
  });
  return page;
};

/**
 * Measure the view's aside, its content and the rule section's first
 * paragraph. Runs in the page.
 *
 * @throws When the page has no sectioned view or no aside.
 */
const measureView = (): ViewMeasure => {
  const view = document.querySelector(".ds.sectioned-view");
  const aside = view?.querySelector(":scope > .aside");
  const content = view?.querySelector(":scope > .content");
  if (!aside || !content) throw new Error("the page has no view with an aside");
  const style = getComputedStyle(aside);
  const rule = view?.querySelector(
    ":scope > .content > .section > .section-body p",
  );
  return {
    asideColumn: [style.gridColumnStart, style.gridColumnEnd],
    asidePosition: style.position,
    asideWidth: aside.getBoundingClientRect().width,
    contentWidth: content.getBoundingClientRect().width,
    ruleWidth: rule ? rule.getBoundingClientRect().width : null,
  };
};

describe("the sectioned view at 1440px", () => {
  it("puts a standard's aside on the last three columns, sticky, beside the content's measure", async () => {
    const page = await open(STANDARD_PATH);
    try {
      const view = await page.evaluate(measureView);
      expect(view.asideColumn).toEqual(["-4", "-1"]);
      expect(view.asidePosition).toBe("sticky");
      expect(Math.abs(view.asideWidth - ASIDE_WIDTH_PX)).toBeLessThanOrEqual(
        TOLERANCE_PX,
      );
      expect(
        Math.abs(view.contentWidth - CONTENT_WIDTH_PX),
      ).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(view.ruleWidth).not.toBeNull();
      expect(
        Math.abs((view.ruleWidth ?? 0) - PROSE_MEASURE_PX),
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    } finally {
      await page.close();
    }
  });

  it("keeps Button's aside where it is while the canvas scrolls to its end", async () => {
    const page = await open(BUTTON_PATH);
    try {
      const readAsideTop = () =>
        page.evaluate(
          () =>
            document
              .querySelector(".ds.sectioned-view > .aside")
              ?.getBoundingClientRect().top ?? null,
        );
      const before = await readAsideTop();
      const scrolled = await page.evaluate(async () => {
        const canvas = document.querySelector("main.ds.canvas");
        if (!canvas) throw new Error("the page has no canvas");
        canvas.scrollTop = canvas.scrollHeight;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        return canvas.scrollTop;
      });
      const after = await readAsideTop();
      expect(scrolled).toBeGreaterThan(0);
      expect(before).not.toBeNull();
      expect(Math.abs((after ?? 0) - (before ?? 0))).toBeLessThanOrEqual(
        TOLERANCE_PX,
      );
    } finally {
      await page.close();
    }
  });
});

/** What the bar and the page around it measure below three groups. */
type BarMeasure = {
  readonly asideDisplay: string | null;
  readonly contentsDisplay: string | null;
  readonly firstChildIsBar: boolean;
  readonly barPosition: string;
  readonly barTop: number;
  readonly barHeight: number;
  readonly scrollTop: number;
  readonly sectionTops: readonly number[];
  readonly headings: readonly { id: string; scrollMargin: number }[];
};

/**
 * Measure Button's view below three groups: its aside and index, its first
 * child, the bar, the canvas's scroll and every section heading. Runs in
 * the page.
 *
 * @throws When the page has no view, no bar or no canvas.
 */
const measureBar = (): BarMeasure => {
  const view = document.querySelector(".ds.sectioned-view");
  const bar = view?.querySelector(":scope > [data-region=contents-bar]");
  const canvas = document.querySelector("main.ds.canvas");
  if (!view || !bar || !canvas) throw new Error("the page has no bar");
  const aside = view.querySelector(":scope > .aside");
  const contents = view.querySelector(":scope > .aside > .contents");
  const headings = [
    ...view.querySelectorAll(":scope > .content > .section > h2"),
  ];
  const box = bar.getBoundingClientRect();
  return {
    asideDisplay: aside ? getComputedStyle(aside).display : null,
    contentsDisplay: contents ? getComputedStyle(contents).display : null,
    firstChildIsBar: view.firstElementChild === bar,
    barPosition: getComputedStyle(bar).position,
    barTop: box.top,
    barHeight: box.height,
    scrollTop: canvas.scrollTop,
    sectionTops: headings.map((heading) => heading.getBoundingClientRect().top),
    headings: headings.map((heading) => ({
      id: heading.id,
      scrollMargin: Number.parseFloat(
        getComputedStyle(heading).scrollMarginBlockStart,
      ),
    })),
  };
};

/**
 * Scroll the canvas to its end and wait a frame. Runs in the page.
 *
 * @throws When the page has no canvas.
 */
const scrollToEnd = async (): Promise<number> => {
  const canvas = document.querySelector("main.ds.canvas");
  if (!canvas) throw new Error("the page has no canvas");
  canvas.scrollTop = canvas.scrollHeight;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  return canvas.scrollTop;
};

describe("the sectioned view's contents bar below three groups", () => {
  it.each(BAR_VIEWPORTS)(
    "opens Button's page at $width on a sticky bar of at most 44px, with no aside (W6a-A5)",
    async (viewport) => {
      const page = await open(BUTTON_PATH, { viewport });
      try {
        const before = await page.evaluate(measureBar);
        expect(before.asideDisplay).toBe("contents");
        expect(before.contentsDisplay).toBe("none");
        expect(before.firstChildIsBar).toBe(true);
        expect(before.barPosition).toBe("sticky");
        expect(before.barHeight).toBeGreaterThan(0);
        expect(before.barHeight).toBeLessThanOrEqual(
          BAR_MAX_BLOCK_SIZE_PX + TOLERANCE_PX,
        );
        expect(before.headings.length).toBeGreaterThan(0);
        for (const { id, scrollMargin } of before.headings) {
          expect(id).not.toBe("");
          expect(Math.abs(scrollMargin - before.barHeight)).toBeLessThanOrEqual(
            TOLERANCE_PX,
          );
        }

        await page.locator(`${BAR} summary`).click();
        const opened = await page.evaluate(measureBar);
        expect(
          await page.locator(`${BAR} details`).getAttribute("open"),
        ).not.toBeNull();
        expect(await page.locator(`${BAR} .panel`).isVisible()).toBe(true);
        expect(opened.scrollTop).toBe(before.scrollTop);
        expect(opened.sectionTops).toEqual(before.sectionTops);
        await page.locator(`${BAR} summary`).click();

        expect(await page.evaluate(scrollToEnd)).toBeGreaterThan(0);
        const after = await page.evaluate(measureBar);
        expect(Math.abs(after.barTop - before.barTop)).toBeLessThanOrEqual(
          TOLERANCE_PX,
        );
      } finally {
        await page.close();
      }
    },
  );

  it("shows no bar at 1440, where the aside holds the index", async () => {
    const page = await open(BUTTON_PATH);
    try {
      expect(await page.locator(BAR).isVisible()).toBe(false);
      expect(
        await page.locator(".ds.sectioned-view > .aside").isVisible(),
      ).toBe(true);
    } finally {
      await page.close();
    }
  });

  it("names the section whose heading reached the bar, and marks its links (W6a-A3)", async () => {
    const page = await open(BUTTON_PATH, { viewport: PHONE });
    try {
      const sections = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            ".ds.sectioned-view > .content > .section > h2",
          ),
        ].map((heading) => ({
          id: heading.id,
          title: heading.textContent ?? "",
        })),
      );
      let reached = 0;
      for (const { id, title } of sections) {
        const rests = await page.evaluate(async (target) => {
          const heading = document.getElementById(target);
          const bar = document.querySelector("[data-region=contents-bar]");
          if (!heading || !bar) throw new Error("no heading or no bar");
          heading.scrollIntoView({ behavior: "instant", block: "start" });
          await new Promise((resolve) => requestAnimationFrame(resolve));
          return (
            Math.abs(
              heading.getBoundingClientRect().top -
                bar.getBoundingClientRect().bottom,
            ) <= 1
          );
        }, id);
        if (!rests) continue;
        reached += 1;
        await expect
          .poll(() => page.locator(`${BAR} summary .current`).textContent())
          .toBe(title);
        const marked = await page.evaluate(() =>
          [
            ...document.querySelectorAll(
              '.ds.sectioned-view a[aria-current="location"]',
            ),
          ].map((link) => link.getAttribute("href")),
        );
        expect(marked).toEqual([`#${id}`, `#${id}`]);
      }
      expect(reached).toBeGreaterThanOrEqual(MIN_HEADINGS_REACHED);
    } finally {
      await page.close();
    }
  });

  it.each([DESKTOP, ...BAR_VIEWPORTS])(
    "makes the section chosen at $width current, and the last one at the canvas's end (W6a-A3)",
    async (viewport) => {
      const page = await open(BUTTON_PATH, { viewport });
      try {
        const readMarked = () =>
          page.evaluate(() =>
            [
              ...document.querySelectorAll(
                '.ds.sectioned-view a[aria-current="location"]',
              ),
            ].map((link) => link.getAttribute("href")),
          );
        const readBar = () =>
          page.evaluate(
            () =>
              document.querySelector(
                "[data-region=contents-bar] summary .current",
              )?.textContent ?? null,
          );
        const title = await page.locator("#relations").textContent();
        if (viewport.width === DESKTOP.width) {
          await page
            .locator(
              '.ds.sectioned-view > .aside .contents a[href="#relations"]',
            )
            .click();
        } else {
          await page.locator(`${BAR} summary`).click();
          await page.locator(`${BAR} .panel a[href="#relations"]`).click();
        }
        await expect.poll(readMarked).toEqual(["#relations", "#relations"]);
        await expect.poll(readBar).toBe(title);

        const last = await page.evaluate(() => {
          const canvas = document.querySelector("main.ds.canvas");
          if (!canvas) throw new Error("the page has no canvas");
          canvas.scrollTop = 0;
          return (
            [
              ...document.querySelectorAll(
                ".ds.sectioned-view > .content > .section > h2",
              ),
            ].at(-1)?.id ?? null
          );
        });
        await expect.poll(readMarked).not.toContain("#relations");
        expect(await page.evaluate(scrollToEnd)).toBeGreaterThan(0);
        await expect.poll(readMarked).toEqual([`#${last}`, `#${last}`]);
      } finally {
        await page.close();
      }
    },
  );
});

/** The example's stage ends above this line at 1440 (M15). */
const STAGE_MAX_BOTTOM_PX = 400;

/** Button's sections the graph holds, in the lens's order. */
const BUTTON_SECTION_IDS = [
  "variants",
  "usage",
  "guidelines",
  "anatomy",
  "properties",
  "tokens",
  "relations",
  "changes",
] as const;

/** The modifier families Button's example honours, by the graph's name. */
const BUTTON_FAMILIES = ["importance", "anticipation"] as const;

/** What Button's page shows on its first screen at 1440. */
type FoldMeasure = {
  readonly stageBottom: number;
  readonly variantsTop: number;
  readonly cells: number;
  readonly captioned: number;
  readonly drawn: number;
  readonly contents: readonly string[];
  readonly asideHeight: number;
};

/**
 * Measure the example's stage, the Variants heading, the variant cells
 * and the aside's contents on Button's page. Runs in the page.
 *
 * @throws When the page has no example stage or no Variants heading.
 */
const measureFold = (): FoldMeasure => {
  const stage = document.querySelector(".ds.component-example > .stage");
  const variants = document.getElementById("variants");
  if (!stage || !variants) throw new Error("no stage or no Variants heading");
  const cells = [...document.querySelectorAll("[data-family][data-modifier]")];
  return {
    stageBottom: stage.getBoundingClientRect().bottom,
    variantsTop: variants.getBoundingClientRect().top,
    cells: cells.length,
    captioned: cells.filter(
      (cell) => cell.querySelector("figcaption")?.textContent,
    ).length,
    drawn: cells.filter((cell) => cell.querySelector(".stage > .ds.button"))
      .length,
    contents: [
      ...document.querySelectorAll(".ds.sectioned-view > .aside .contents a"),
    ].map((link) => link.getAttribute("href") ?? ""),
    asideHeight:
      document
        .querySelector(".ds.sectioned-view > .aside")
        ?.getBoundingClientRect().height ?? 0,
  };
};

/**
 * How many modifiers the graph records for Button in the families its
 * example honours: the fewest variant cells its page may draw.
 *
 * @note Impure: queries the running graph server.
 */
const countButtonModifiers = async (): Promise<number> => {
  const response = await fetch(new URL("/graphql", server.graphBase), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: `{ component(uri: "ds:global.component.button") {
        modifierFamilies(first: 24) { edges { node { uri
          modifiers(first: 100) { edges { node { uri } } } } } } } }`,
    }),
  });
  const { data } = (await response.json()) as {
    data: {
      component: {
        modifierFamilies: {
          edges: {
            node: { uri: string; modifiers: { edges: unknown[] } };
          }[];
        };
      };
    };
  };
  return data.component.modifierFamilies.edges
    .filter(({ node }) =>
      (BUTTON_FAMILIES as readonly string[]).includes(
        node.uri.slice(node.uri.lastIndexOf(".") + 1),
      ),
    )
    .reduce((count, { node }) => count + node.modifiers.edges.length, 0);
};

describe("Button's component page at 1440px (W6a-A6)", () => {
  it("ends the example's stage above 400, opens the Variants heading above the fold, draws every variant captioned, and lists every section", async ({
    annotate,
  }) => {
    const page = await open(BUTTON_PATH);
    try {
      const fold = await page.evaluate(measureFold);
      await annotate(
        `stage bottom ${fold.stageBottom}px; Variants heading top ${fold.variantsTop}px; aside ${fold.asideHeight}px tall`,
      );
      expect(fold.stageBottom).toBeLessThan(STAGE_MAX_BOTTOM_PX);
      expect(fold.variantsTop).toBeLessThan(DESKTOP.height);
      const modifiers = await countButtonModifiers();
      expect(modifiers).toBeGreaterThan(0);
      expect(fold.cells).toBeGreaterThanOrEqual(modifiers);
      expect(fold.captioned).toBe(fold.cells);
      expect(fold.drawn).toBe(fold.cells);
      expect(fold.contents).toEqual(BUTTON_SECTION_IDS.map((id) => `#${id}`));
    } finally {
      await page.close();
    }
  });
});

/** What a token's name in the Tokens table measures, character by character. */
type SymbolAdvanceMeasure = {
  readonly name: string;
  readonly digits: number;
  readonly digitsWidth: number;
  readonly letterWidth: number;
  readonly fontFamily: string;
  readonly fontVariantNumeric: string;
  readonly letterSpacing: string;
};

/**
 * Measure the first token name in the Tokens table that ends in digits:
 * the width its trailing digits take against the width of its `d`, each
 * read off the cell's own text, and the cell's computed face. Runs in the
 * page.
 *
 * @throws When the table holds no token name that ends in digits.
 */
const measureSymbolAdvances = (): SymbolAdvanceMeasure => {
  const cell = [
    ...document.querySelectorAll(".ds.component-tokens .symbol"),
  ].find((symbol) => /d.*\d$/.test(symbol.textContent ?? ""));
  const text = cell?.firstChild;
  if (!cell || !(text instanceof Text)) {
    throw new Error("no token name ends in digits");
  }
  const range = document.createRange();
  const widthOf = (start: number, end: number): number => {
    range.setStart(text, start);
    range.setEnd(text, end);
    return range.getBoundingClientRect().width;
  };
  const digitsStart = text.data.search(/\d+$/);
  const letter = text.data.indexOf("d");
  const style = getComputedStyle(cell);
  return {
    name: text.data,
    digits: text.data.length - digitsStart,
    digitsWidth: widthOf(digitsStart, text.data.length),
    letterWidth: widthOf(letter, letter + 1),
    fontFamily: style.fontFamily,
    fontVariantNumeric: style.fontVariantNumeric,
    letterSpacing: style.letterSpacing,
  };
};

describe("Button's Tokens table at 1440px", () => {
  it("draws every character of a token's name on one monospace advance", async ({
    annotate,
  }) => {
    const page = await open(`${BUTTON_PATH}#tokens`);
    try {
      const symbol = await page.evaluate(measureSymbolAdvances);
      await annotate(
        `${symbol.name}: ${symbol.digits} digits ${symbol.digitsWidth}px, "d" ${symbol.letterWidth}px; ${symbol.fontFamily}; ${symbol.fontVariantNumeric}, letter spacing ${symbol.letterSpacing}`,
      );
      expect(symbol.letterWidth).toBeGreaterThan(0);
      expect(
        Math.abs(symbol.digitsWidth - symbol.digits * symbol.letterWidth),
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    } finally {
      await page.close();
    }
  });
});

/** Every page this unit lays on the view or changes, by the tour's name. */
const CHANGED_PATHS = {
  standards: "/standards",
  standard: STANDARD_PATH,
  "standard-turtle": `${STANDARD_PATH}?as=turtle`,
  guides: "/guides",
  guide: "/guides/router-core",
  button: BUTTON_PATH,
  "button-turtle": `${BUTTON_PATH}?as=turtle`,
} as const;

/** What a page's sideways extent measures. */
type SidewaysMeasure = {
  readonly document: { readonly scroll: number; readonly client: number };
  readonly canvas: { readonly scroll: number; readonly client: number };
};

/**
 * Measure the document's and the canvas's scrolled width against their
 * box. Runs in the page.
 *
 * @throws When the page has no canvas.
 */
const measureSideways = (): SidewaysMeasure => {
  const canvas = document.querySelector("main.ds.canvas");
  if (!canvas) throw new Error("the page has no canvas");
  const root = document.documentElement;
  return {
    document: { scroll: root.scrollWidth, client: root.clientWidth },
    canvas: { scroll: canvas.scrollWidth, client: canvas.clientWidth },
  };
};

/** Where a table in a section sits against its section, its scroller and the screen. */
type TableMeasure = {
  readonly section: string;
  readonly scrolls: boolean;
  readonly scrollerLeft: number;
  readonly scrollerRight: number;
  readonly sectionLeft: number;
  readonly sectionRight: number;
  readonly screenRight: number;
  readonly hidden: number;
  readonly scrollable: number;
  readonly tableWidth: number;
};

/**
 * Measure every table in the view's sections: the nearest box that
 * scrolls it sideways (the table itself or an ancestor whose overflow is
 * `auto` or `scroll`), that box's edges against the section's body and
 * the screen's, how much of the table lies past the box's visible end,
 * and how far the box scrolls. Runs in the page.
 */
const measureTables = (): readonly TableMeasure[] =>
  [
    ...document.querySelectorAll(
      ".ds.sectioned-view > .content > .section table",
    ),
  ].map((table) => {
    const body = table.closest(".section-body");
    let scroller: Element | null = table;
    while (
      scroller &&
      scroller !== body &&
      !["auto", "scroll"].includes(getComputedStyle(scroller).overflowX)
    ) {
      scroller = scroller.parentElement;
    }
    const box = (scroller ?? table).getBoundingClientRect();
    const bodyBox = (body ?? table).getBoundingClientRect();
    const tableBox = table.getBoundingClientRect();
    const clientWidth = scroller?.clientWidth ?? box.width;
    return {
      section: table.closest(".section")?.querySelector("h2")?.id ?? "",
      scrolls: scroller !== null && scroller !== body,
      scrollerLeft: box.left,
      scrollerRight: box.right,
      sectionLeft: bodyBox.left,
      sectionRight: bodyBox.right,
      screenRight: document.documentElement.clientWidth,
      hidden: tableBox.right - (box.left + clientWidth),
      scrollable: (scroller?.scrollWidth ?? 0) - clientWidth,
      tableWidth: tableBox.width,
    };
  });

describe("every changed page at 390px (W6a-A7)", () => {
  it.each(Object.entries(CHANGED_PATHS))(
    "scrolls %s neither the document nor the canvas sideways",
    async (_name, path) => {
      const page = await open(path, { viewport: PHONE });
      try {
        const sideways = await page.evaluate(measureSideways);
        expect(sideways.document.scroll).toBeLessThanOrEqual(
          sideways.document.client,
        );
        expect(sideways.canvas.scroll).toBeLessThanOrEqual(
          sideways.canvas.client,
        );
      } finally {
        await page.close();
      }
    },
  );

  it("scrolls each of Button's tables inside its own box within its section and the screen, every column reachable", async ({
    annotate,
  }) => {
    const page = await open(BUTTON_PATH, { viewport: PHONE });
    try {
      const tables = await page.evaluate(measureTables);
      await annotate(
        tables
          .map(
            (table) =>
              `${table.section}: table ${Math.round(table.tableWidth)}px in a ${Math.round(table.scrollerRight - table.scrollerLeft)}px box`,
          )
          .join("; "),
      );
      expect(tables.map((table) => table.section)).toEqual(
        expect.arrayContaining(["properties", "tokens"]),
      );
      for (const table of tables) {
        expect(table.scrolls, table.section).toBe(true);
        expect(table.scrollerLeft, table.section).toBeGreaterThanOrEqual(
          table.sectionLeft - TOLERANCE_PX,
        );
        expect(table.scrollerRight, table.section).toBeLessThanOrEqual(
          table.sectionRight + TOLERANCE_PX,
        );
        // The box ends on the screen, so no column is cut at its edge
        // (the canvas's own inset at 390 is not asserted here), and the
        // part of the table past the box's end is the part it scrolls.
        expect(table.scrollerRight, table.section).toBeLessThanOrEqual(
          table.screenRight + TOLERANCE_PX,
        );
        expect(table.scrollable, table.section).toBeGreaterThanOrEqual(
          table.hidden - TOLERANCE_PX,
        );
      }
    } finally {
      await page.close();
    }
  });
});
