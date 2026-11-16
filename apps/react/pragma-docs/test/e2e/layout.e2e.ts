// @vitest-environment node

/**
 * The page grid and the scroll model, measured in a real browser: the dev
 * cell (its graph server alongside) serves the workspace pages and several
 * document pages, and Chromium lays each out once at a desktop and a phone
 * width, measuring it in the light and the dark theme. What is asserted is
 * what the layout promises: one intrinsic grid, the shell, which is the one
 * query container; no page scroll, and nothing reaching past the viewport
 * or past its region, a strip's crumb included, a strip's trail on one
 * line with its last crumb's text clipped by the crumb, and nothing in
 * the strip scrolling sideways, at 390px too, on a term's page and a standard's page
 * addressed by absolute IRIs; twelve columns at 1440px and four at
 * 390px; a workspace canvas
 * that never scrolls; a document whose only scrolling regions are its
 * canvas and its rail, and whose page's first element spans the whole main
 * column; a catalog whose cards fill their rows and stay inside the
 * canvas, a UI block's example with them, at 390, 600 and 1440px, each
 * card across the canvas's whole row at 390px; a canvas that starts one
 * gutter under the strip, or at the viewport's top with no strip, its
 * page then starting one gutter down; bands,
 * the strip's and the colophon's, that run from the rail's border to the
 * viewport's edge, painted over that whole width, with their content from
 * the canvas's first column line
 * to its last;
 * every gap, padding and margin of the chrome a multiple of 4px; and the
 * workspace drawn in the face it ships, the dev cell delivering its font.
 * The standards index's entries keep their address, the row's first
 * fact, on the title's one line, and a title is cut, at 390px too, only
 * once the address has given up all of its width. At 390, 820, 912 and
 * 1440px no fact of a row shows in part: each lies wholly inside the
 * facts' box and the row, or on the box's hidden line; below two groups
 * (912px) no row shows its address, so the list keeps one form, and on
 * the desktop every row does; facts show where the row has room for them,
 * and a title that fits its row is never cut. A row given
 * more facts in the page and narrowed step by step loses them whole, the
 * last first, before its title is cut. Every row of the catalog, which
 * opts into two lines, is 56px, and every row of the standards index 32px,
 * at 1440 and 390px. The home page's chips of the site's own namespace
 * write no `ds:`.
 */
import {
  launchBrowser,
  measurePage,
  measureRowHeights,
  ROW_PX,
  type ThemedMeasure,
  TWO_LINE_ROW_PX,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  ADDED_FACTS,
  CATALOG_CARD_SELECTOR,
  CATALOG_CARD_WIDTHS,
  CATALOG_PATH,
  CATALOG_ROW_SELECTOR,
  CATALOG_ROW_TITLE_COUNT,
  CATALOG_ROW_TITLE_WIDTH,
  CATALOG_ROWS_PATH,
  CATALOG_WHOLE_ROW_WIDTHS,
  DEV_READY_MS,
  DOCUMENT_PATHS,
  JOURNEYS_PATHS,
  MIN_CATALOG_CARD_WIDTH_PX,
  NARROWING_STEP_PX,
  PAGE_SETTLE_MS,
  ROW_TITLE_FLOOR_CHARACTERS,
  STANDARDS_FACT_WIDTHS,
  STANDARDS_INDEX_PATH,
  STANDARDS_INDEX_ROW_SELECTOR,
  WIDTH_TOLERANCE_PX,
  WORKSPACE_PATH,
  WORKSPACE_PATHS,
} from "./constants.js";
import { type RunningServer, startServer } from "./serverHarness.js";

const CWD = process.cwd();

/**
 * Count the standards index's entries, those whose title is cut while some
 * of its address still shows, and those whose address, the row's first
 * fact, has left the title's line. A title is cut when its own text is
 * wider than its box: the identity that holds it never overflows, since
 * the title shrinks inside it. It runs in the page.
 *
 * @returns The counts.
 * @throws When an entry has no title or no address.
 */
function countCutEntries(): {
  readonly entries: number;
  readonly titlesCutFirst: number;
  readonly addressesApart: number;
} {
  const rows = [
    ...document.querySelectorAll(".ds.standards-index .ds.entity-row"),
  ];
  const measured = rows.map((row) => {
    const identity = row.querySelector(".identity");
    const title = identity?.querySelector(".title");
    const facts = row.querySelector(".facts");
    if (
      !identity ||
      !title ||
      !facts?.querySelector('.fact[data-property="curie"]')
    ) {
      throw new Error("an entry has no title or no address");
    }
    return {
      // The title yields last: it may be cut only once the address has
      // given up all of its width.
      titleCutFirst:
        title.scrollWidth > title.clientWidth && facts.clientWidth > 0,
      // On a line of its own, the address would start below the title's.
      addressApart:
        facts.getBoundingClientRect().top >=
        identity.getBoundingClientRect().bottom,
    };
  });
  return {
    entries: measured.length,
    titlesCutFirst: measured.filter(({ titleCutFirst }) => titleCutFirst)
      .length,
    addressesApart: measured.filter(({ addressApart }) => addressApart).length,
  };
}

/**
 * Count the standards index's rows, their facts that show, and those that
 * show in part, and list the titles cut though they fit. A fact is shown
 * when some of it lies inside both its facts' box and its row, and in part
 * when some of it lies outside either, so a fact that has left for the
 * box's hidden line, or that is not displayed, is neither. A title fits
 * when its identity, were the title whole, is no wider than the row less
 * its status: such a title must not be cut, whether or not the row's facts
 * have left. A row's first fact fits when its identity, with the title
 * whole, and the fact, with its margin, are no wider than the row less
 * its status: such a fact must show. It runs in the page.
 *
 * @returns The counts, the text of each fact shown in part, each title
 * cut though it fits, and each row whose first fact is hidden though it
 * fits.
 */
function countPartFacts(): {
  readonly rows: number;
  readonly shown: number;
  readonly partial: readonly string[];
  readonly titlesFitting: number;
  readonly cutThoughFitting: readonly string[];
  readonly hiddenThoughFitting: readonly string[];
} {
  const rows = [
    ...document.querySelectorAll(".ds.standards-index .ds.entity-row"),
  ];
  const facts = rows.flatMap((row) => {
    const own = row.querySelector(".facts")?.getBoundingClientRect();
    if (!own) return [];
    const edge = row.getBoundingClientRect();
    const box = {
      left: Math.max(own.left, edge.left),
      right: Math.min(own.right, edge.right),
      top: Math.max(own.top, edge.top),
      bottom: Math.min(own.bottom, edge.bottom),
    };
    return [...row.querySelectorAll(".facts > .fact")].map((fact) => {
      const rect = fact.getBoundingClientRect();
      const inside =
        Math.min(rect.right, box.right) - Math.max(rect.left, box.left) > 0 &&
        Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top) > 0;
      const whole =
        rect.left >= box.left - 0.5 &&
        rect.right <= box.right + 0.5 &&
        rect.top >= box.top - 0.5 &&
        rect.bottom <= box.bottom + 0.5;
      return { text: fact.textContent ?? "", inside, whole };
    });
  });
  const titles = rows.flatMap((row) => {
    const identity = row.querySelector(".identity");
    const title = identity?.querySelector(".title");
    if (!identity || !title) return [];
    const status = row.querySelector(".status");
    const end =
      status?.getBoundingClientRect().left ??
      row.getBoundingClientRect().right -
        Number.parseFloat(getComputedStyle(row).paddingInlineEnd);
    const whole =
      identity.getBoundingClientRect().width -
      title.clientWidth +
      title.scrollWidth;
    const statusMargin =
      status === null
        ? 0
        : Number.parseFloat(getComputedStyle(status).marginInlineStart);
    const fact = row.querySelector(".facts > .fact");
    const factBox = fact?.getBoundingClientRect();
    const factFits =
      fact !== null &&
      factBox !== undefined &&
      factBox.width > 0 &&
      identity.getBoundingClientRect().left +
        whole +
        Number.parseFloat(getComputedStyle(fact).marginInlineStart) +
        factBox.width <=
        end - statusMargin + 0.5;
    const edge = row.getBoundingClientRect();
    const factShown =
      factBox !== undefined &&
      factBox.bottom > edge.top &&
      factBox.top < edge.bottom &&
      factBox.right > edge.left &&
      factBox.left < edge.right;
    return [
      {
        text: title.textContent ?? "",
        fits: identity.getBoundingClientRect().left + whole <= end + 0.5,
        cut: title.scrollWidth > title.clientWidth,
        factHidden: factFits && !factShown,
      },
    ];
  });
  return {
    rows: rows.length,
    shown: facts.filter(({ inside }) => inside).length,
    partial: facts
      .filter(({ inside, whole }) => inside && !whole)
      .map(({ text }) => text),
    titlesFitting: titles.filter(({ fits }) => fits).length,
    cutThoughFitting: titles
      .filter(({ fits, cut }) => fits && cut)
      .map(({ text }) => text),
    hiddenThoughFitting: titles
      .filter(({ factHidden }) => factHidden)
      .map(({ text }) => text),
  };
}

/**
 * Give the standards index's first row more facts after its address, then
 * narrow it step by step and read, at each width, which of its facts show
 * whole (1), in part (P) or not at all (0), measured against both the
 * facts' box and the row's own edge, and whether its title is cut, and
 * would fit. Each added fact is a clone of the address, marked as a later
 * fact by the class the row's stylesheet keys on. It runs in the page.
 *
 * @param input - The facts to add and the step to narrow by.
 * @returns One reading per width, the widest first.
 * @throws When the index has no row with an address.
 * @note Impure: adds facts to the page's first row and narrows it.
 */
function narrowRowWithFacts(input: {
  readonly added: readonly {
    readonly property: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly step: number;
}): readonly {
  readonly width: number;
  readonly facts: string;
  readonly titleCut: boolean;
  readonly titleFits: boolean;
}[] {
  const row = document.querySelector<HTMLElement>(
    ".ds.standards-index .ds.entity-row",
  );
  const address = row?.querySelector(".facts > .fact");
  const identity = row?.querySelector(".identity");
  const title = identity?.querySelector(".title");
  if (!row || !address || !identity || !title) {
    throw new Error("the index has no row with an address");
  }
  // The class a later fact carries is read from the row's own stylesheet,
  // from the rule that keys on it, so a rename there renames it here.
  const findLaterClass = (rules: CSSRuleList): string | undefined => {
    for (const rule of rules) {
      const found =
        rule instanceof CSSStyleRule
          ? /\.entity-row \.fact\.([\w-]+)/.exec(rule.selectorText)?.[1]
          : rule instanceof CSSGroupingRule
            ? findLaterClass(rule.cssRules)
            : undefined;
      if (found !== undefined) return found;
    }
    return undefined;
  };
  const later = [...document.styleSheets]
    .map((sheet) => findLaterClass(sheet.cssRules))
    .find((found) => found !== undefined);
  if (later === undefined) {
    throw new Error("no rule of the row's stylesheet keys on a later fact");
  }
  for (const { property, label, value } of input.added) {
    const fact = address.cloneNode(true) as HTMLElement;
    fact.classList.add(later);
    fact.dataset.property = property;
    const term = fact.querySelector(".term");
    const detail = fact.querySelector(".detail");
    if (!term || !detail) throw new Error("the address has no term or detail");
    term.textContent = label;
    detail.textContent = value;
    address.parentElement?.append(fact);
  }
  const readings = [];
  for (
    let width = Math.ceil(row.getBoundingClientRect().width);
    width > 0;
    width -= input.step
  ) {
    row.style.width = `${width}px`;
    const edge = row.getBoundingClientRect();
    const facts = row.querySelector(".facts")?.getBoundingClientRect();
    if (!facts) throw new Error("the row has no facts");
    const box = {
      left: Math.max(facts.left, edge.left),
      right: Math.min(facts.right, edge.right),
      top: Math.max(facts.top, edge.top),
      bottom: Math.min(facts.bottom, edge.bottom),
    };
    const shown = [...row.querySelectorAll(".facts > .fact")].map((fact) => {
      const rect = fact.getBoundingClientRect();
      const inside =
        Math.min(rect.right, box.right) - Math.max(rect.left, box.left) > 0 &&
        Math.min(rect.bottom, box.bottom) - Math.max(rect.top, box.top) > 0;
      const whole =
        rect.left >= box.left - 0.5 &&
        rect.right <= box.right + 0.5 &&
        rect.top >= box.top - 0.5 &&
        rect.bottom <= box.bottom + 0.5;
      return !inside ? "0" : whole ? "1" : "P";
    });
    const whole =
      identity.getBoundingClientRect().width -
      title.clientWidth +
      title.scrollWidth;
    readings.push({
      width,
      facts: shown.join(""),
      titleCut: title.scrollWidth > title.clientWidth,
      titleFits:
        identity.getBoundingClientRect().left + whole <= edge.right + 0.5,
    });
  }
  return readings;
}

/**
 * Read the home page's chips that mention a design-system node, those that
 * link into the components lens, each by its whole text. It runs in the
 * page.
 *
 * @returns Each such chip's text.
 */
function readComponentChips(): readonly string[] {
  return [...document.querySelectorAll("main.ds.canvas .ds.entity-chip")]
    .filter(
      (chip) => chip.querySelector('a[href^="/components/ds%3A"]') !== null,
    )
    .map((chip) => chip.textContent ?? "");
}

/**
 * Measure the catalog's cards against the canvas: each card's left and
 * right edges, its width, and, for a card with a specimen, the specimen's
 * and the body's widths. It runs in the page.
 *
 * @param selector - The catalog's cards.
 * @returns The canvas's edges and each card's measures.
 * @throws When the page has no canvas.
 */
function measureCatalogCards(selector: string): {
  readonly canvas: { readonly left: number; readonly right: number };
  readonly cards: readonly {
    readonly left: number;
    readonly right: number;
    readonly width: number;
    readonly sections: readonly number[];
  }[];
} {
  const canvas = document.querySelector("main.ds.canvas");
  if (!canvas) throw new Error("the page has no canvas");
  const { left, right } = canvas.getBoundingClientRect();
  return {
    canvas: { left, right },
    cards: [...document.querySelectorAll(selector)].map((card) => {
      const box = card.getBoundingClientRect();
      const sections =
        card.querySelector(":scope > .specimen") === null
          ? []
          : [...card.querySelectorAll(":scope > .specimen, :scope > .body")];
      return {
        left: box.left,
        right: box.right,
        width: box.width,
        sections: sections.map(
          (section) => section.getBoundingClientRect().width,
        ),
      };
    }),
  };
}

/**
 * Read what the journeys canvas holds: whether the explorer, its rail and
 * one reading (the table or the graph) are mounted, the rail's own block
 * overflow, and the alert the page shows when the graph's query failed. It
 * runs in the page.
 *
 * @returns The explorer's parts, the rail's overflow and the alert's text.
 */
function readJourneysCanvas(): {
  readonly explorer: boolean;
  readonly rail: boolean;
  readonly reading: boolean;
  readonly railOverflow: string | null;
  readonly alert: string | null;
} {
  const explorer = document.querySelector(".ds.journeys-explorer");
  const rail = explorer?.querySelector(".ds.journey-rail") ?? null;
  return {
    explorer: explorer !== null,
    rail: rail !== null,
    reading:
      explorer?.querySelector(".ds.journey-table, .ds.journey-well") != null,
    railOverflow: rail === null ? null : getComputedStyle(rail).overflowY,
    alert:
      document.querySelector('main.ds.canvas [role="alert"]')?.textContent ??
      null,
  };
}

let server: RunningServer;
let browser: Browser;

/**
 * Open `path` at a viewport, every request off the dev cell's own origins
 * answered empty, once its network is idle.
 *
 * @param path - The page's path.
 * @param viewport - The viewport's width and height, in pixels.
 * @returns The open page.
 * @note Impure: opens a browser tab, which the caller closes.
 */
async function openPage(
  path: string,
  viewport: { readonly width: number; readonly height: number },
): Promise<Page> {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const origins = [
    new URL(server.base).origin,
    new URL(server.graphBase).origin,
  ];
  await page.route("**/*", (route) =>
    origins.includes(new URL(route.request().url()).origin)
      ? route.continue()
      : route.fulfill({ status: 204, body: "" }),
  );
  await page.goto(new URL(path, server.base).href, {
    waitUntil: "networkidle",
    timeout: PAGE_SETTLE_MS,
  });
  return page;
}

beforeAll(async () => {
  server = await startServer("dev:bun", CWD, { timeoutMs: DEV_READY_MS });
  browser = await launchBrowser();
}, DEV_READY_MS + PAGE_SETTLE_MS);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
});

describe.each(VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` once at this viewport and measure it in every theme, with
   * the elements that must fill the page's rows, if any.
   *
   * @note Impure: opens a browser tab, which it closes.
   */
  const measure = (
    path: string,
    fillSelector?: string,
  ): Promise<readonly ThemedMeasure[]> =>
    measurePage(browser, {
      url: new URL(path, server.base).href,
      viewport,
      origins: [new URL(server.base).origin, new URL(server.graphBase).origin],
      timeoutMs: PAGE_SETTLE_MS,
      fillSelector,
    });

  /** Assert what every page promises, in each theme it was measured in. */
  const expectGrid = (measures: readonly ThemedMeasure[]): void => {
    for (const { theme, measure: layout } of measures) {
      expect(layout.grids, theme).toEqual([
        {
          className: "ds shell grid intrinsic",
          containerName: "shell",
          columns: viewport.columns,
        },
      ]);
      expect(layout.page.scrollHeight, theme).toBeLessThanOrEqual(
        layout.page.innerHeight,
      );
      expect(layout.overflow, theme).toEqual([]);
      expect(layout.regionOverflow.rail, theme).toBe("auto");
      const { edges } = layout;
      // The canvas starts one gutter under the row above it: the drawer
      // trigger's own row while it shows, else the strip's; so the trigger
      // covers nothing the canvas holds.
      const above = edges.triggerBottom ?? edges.stripBottom;
      expect(edges.canvasTop, theme).toBeCloseTo(
        above === null ? 0 : above + edges.rowGap,
        1,
      );
      // With no row above, the page itself starts one gutter under the
      // viewport's top, as a page under a strip starts under its rule.
      if (above === null) {
        expect(layout.canvasPage.firstChildTop, theme).toBeCloseTo(
          edges.rowGap,
          1,
        );
      }
      for (const band of layout.bands) {
        expect(band.start, `${theme} ${band.element}`).toBeCloseTo(
          edges.railEnd,
          1,
        );
        expect(band.end, `${theme} ${band.element}`).toBeCloseTo(
          layout.page.innerWidth,
          1,
        );
        // Painted over that whole width: nothing clips the bleed.
        expect(band.paintedStart, `${theme} ${band.element}`).toBeCloseTo(
          edges.railEnd,
          1,
        );
        expect(band.paintedEnd, `${theme} ${band.element}`).toBeCloseTo(
          layout.page.innerWidth,
          1,
        );
        expect(band.contentStart, `${theme} ${band.element}`).toBeCloseTo(
          edges.canvasStart,
          1,
        );
        expect(band.contentEnd, `${theme} ${band.element}`).toBeCloseTo(
          layout.page.innerWidth,
          1,
        );
      }
      // A lens's trail keeps to one line, its last crumb's text painted
      // no further than the trail's end, clipped by the crumb itself.
      for (const trail of layout.trails) {
        expect(trail.rows, `${theme} ${trail.element}`).toBe(1);
        expect(trail.textEnd, `${theme} ${trail.element}`).toBeLessThanOrEqual(
          trail.end + WIDTH_TOLERANCE_PX,
        );
      }
      expect(
        layout.offGrid,
        `${theme} spacing histogram: ${JSON.stringify(layout.histogram)}`,
      ).toEqual([]);
    }
  };

  it("draws the workspace in the face it ships, Ubuntu Sans, delivered whole", async () => {
    const page = await browser.newPage({ viewport });
    try {
      const origins = [
        new URL(server.base).origin,
        new URL(server.graphBase).origin,
      ];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.goto(new URL(WORKSPACE_PATH, server.base).href, {
        waitUntil: "load",
        timeout: PAGE_SETTLE_MS,
      });
      // The graph's widths are measured from this face: a page that falls
      // back to another draws its labels past their boxes.
      const face = await page.evaluate(async () => {
        const font = '600 14px "Ubuntu Sans"';
        const faces = await document.fonts.load(font).catch(() => []);
        return {
          loaded: faces.filter((each) => each.status === "loaded").length,
          checked: document.fonts.check(font),
        };
      });
      expect(face.loaded).toBeGreaterThan(0);
      expect(face.checked).toBe(true);
    } finally {
      await page.close();
    }
  });

  it.each(WORKSPACE_PATHS)(
    "lays the workspace at %s on the one grid with a canvas that never scrolls",
    async (path) => {
      const measures = await measure(path);
      expectGrid(measures);
      for (const { theme, measure: layout } of measures) {
        expect(layout.canvas.overflow, theme).toBe("hidden");
        expect(layout.canvas.scrollHeight, theme).toBe(
          layout.canvas.clientHeight,
        );
        expect(layout.scrollers, theme).not.toContain("main.ds.canvas");
        // The Definitions lens gives its workspace an inspector: a region
        // that scrolls on its own from three groups of columns, a drawer
        // behind its trigger below them.
        expect(layout.regionOverflow.inspector, theme).toBe("auto");
        expect(layout.triggerShown, theme).toBe(viewport.width < 1376);
        // The page never scrolls, a phone's included: below one group of
        // columns the class graph's rows scroll inside the explorer's well,
        // under the strip and the rail's search, as every region of the
        // workspace scrolls on its own; above it the well pans instead.
        expect(
          layout.scrollers.includes("div.ds.hierarchy-well.explorer-well"),
          theme,
        ).toBe(viewport.width < 448);
      }
    },
  );

  it.each(JOURNEYS_PATHS)(
    "lays the journeys at %s on the workspace, the table scrolling in its own region",
    async (path) => {
      // The layout is measured over the explorer, never over the page's
      // failure state: a graph that serves no demand model fails here,
      // loudly, before anything is measured.
      const page = await browser.newPage({ viewport });
      try {
        const origins = [
          new URL(server.base).origin,
          new URL(server.graphBase).origin,
        ];
        await page.route("**/*", (route) =>
          origins.includes(new URL(route.request().url()).origin)
            ? route.continue()
            : route.fulfill({ status: 204, body: "" }),
        );
        await page.goto(new URL(path, server.base).href, {
          waitUntil: "networkidle",
          timeout: PAGE_SETTLE_MS,
        });
        const canvas = await page.evaluate(readJourneysCanvas);
        if (canvas.alert !== null) {
          throw new Error(
            `${path} shows "${canvas.alert}" in place of the explorer: the graph serves no demand model, so the journeys cannot be measured. The demand model's shims are linked by bun install; check the provider's boot log.`,
          );
        }
        expect(canvas.explorer).toBe(true);
        expect(canvas.rail).toBe(true);
        expect(canvas.reading).toBe(true);
        // The explorer's rail scrolls on its own, as every side region of
        // the workspace does.
        expect(canvas.railOverflow).toBe("auto");
      } finally {
        await page.close();
      }
      const measures = await measure(path);
      expectGrid(measures);
      for (const { theme, measure: layout } of measures) {
        expect(layout.canvas.overflow, theme).toBe("hidden");
        expect(layout.canvas.scrollHeight, theme).toBe(
          layout.canvas.clientHeight,
        );
        expect(layout.scrollers, theme).not.toContain("main.ds.canvas");
        // The table opens without an inspector, so no drawer trigger shows
        // at any width.
        expect(layout.triggerShown, theme).toBe(false);
      }
    },
  );

  it.each(DOCUMENT_PATHS)(
    "lays the document at %s on the one grid, scrolling only its canvas and its rail",
    async (path) => {
      const measures = await measure(path);
      expectGrid(measures);
      for (const { theme, measure: layout } of measures) {
        expect(layout.canvas.overflow, theme).toBe("auto");
        for (const scroller of layout.scrollers) {
          expect(["main.ds.canvas", "div.rail"], theme).toContain(scroller);
        }
        // The page's first element spans the whole main column, never
        // one track of it.
        expect(layout.canvasPage.width, theme).toBeGreaterThan(0);
        expect(
          Math.abs(layout.canvasPage.firstChildWidth - layout.canvasPage.width),
          theme,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      }
    },
  );

  // Past one group the canvas holds an even number of columns, which the
  // catalog's two-column cards fill; at four columns the canvas holds
  // three, and each card takes the whole row. Either way the cards reach
  // the canvas's end.
  it("fills the catalog's rows with cards to the canvas's end", async () => {
    const measures = await measure(CATALOG_PATH, CATALOG_CARD_SELECTOR);
    for (const { theme, measure: layout } of measures) {
      const shortfall = layout.canvasPage.fillShortfall;
      expect(shortfall, theme).not.toBeNull();
      expect(shortfall?.start, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(shortfall?.end, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });

  it("spans the standards index's links and lists over the main column", async () => {
    const measures = await measure(
      STANDARDS_INDEX_PATH,
      STANDARDS_INDEX_ROW_SELECTOR,
    );
    for (const { theme, measure: layout } of measures) {
      const shortfall = layout.canvasPage.fillShortfall;
      expect(shortfall, theme).not.toBeNull();
      expect(shortfall?.start, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(shortfall?.end, theme).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });

  it("cuts no standards index title before its address, on the row's one line", async () => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    try {
      const origins = [
        new URL(server.base).origin,
        new URL(server.graphBase).origin,
      ];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.goto(new URL(STANDARDS_INDEX_PATH, server.base).href, {
        waitUntil: "networkidle",
        timeout: PAGE_SETTLE_MS,
      });
      const counts = await page.evaluate(countCutEntries);
      expect(counts.entries).toBeGreaterThan(0);
      // The title yields last: the address gives way first, on the row's
      // one line.
      expect(counts.titlesCutFirst).toBe(0);
      expect(counts.addressesApart).toBe(0);
    } finally {
      await page.close();
    }
  });

  // A row's height comes from `lines` alone: the catalog opts its rows
  // into two lines, the standards index keeps one.
  it("draws every row of the catalog two lines high", async () => {
    const page = await openPage(CATALOG_ROWS_PATH, viewport);
    try {
      const rows = await page.evaluate(measureRowHeights, CATALOG_ROW_SELECTOR);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.filter(({ height }) => height !== TWO_LINE_ROW_PX)).toEqual(
        [],
      );
    } finally {
      await page.close();
    }
  });

  it("draws every row of the standards index one line high", async () => {
    const page = await openPage(STANDARDS_INDEX_PATH, viewport);
    try {
      const rows = await page.evaluate(
        measureRowHeights,
        ".ds.standards-index .ds.entity-row",
      );
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.filter(({ height }) => height !== ROW_PX)).toEqual([]);
    } finally {
      await page.close();
    }
  });
});

// A fact is shown whole or not at all: where a row has no room for its
// facts they leave whole, the last first, so none is ever cut to a stub,
// and only then: in each row with room for its first fact, it shows. Once none is left
// the title has the row's whole width. Below two groups the index shows
// no row's facts, so the list keeps one form.
describe.each(STANDARDS_FACT_WIDTHS)(
  "the standards index at $width px",
  ({ width, shown }) => {
    it("shows each fact of a row whole or not at all", async () => {
      const page = await openPage(STANDARDS_INDEX_PATH, { width, height: 844 });
      try {
        const counts = await page.evaluate(countPartFacts);
        expect(counts.rows).toBeGreaterThan(0);
        // Below two groups no row shows its address; on the desktop every
        // row does; at the threshold each row that has room for it.
        const message = `${counts.shown} facts shown in ${counts.rows} rows`;
        if (shown === "fitting") {
          expect(counts.shown, message).toBeGreaterThan(0);
        } else {
          expect(counts.shown, message).toBe(
            shown === "none" ? 0 : counts.rows,
          );
        }
        expect(counts.partial).toEqual([]);
        expect(counts.titlesFitting).toBeGreaterThan(0);
        expect(counts.cutThoughFitting).toEqual([]);
        expect(counts.hiddenThoughFitting).toEqual([]);
      } finally {
        await page.close();
      }
    });
  },
);

// The site's home namespace is `ds`, declared once by its Shell: the home
// page's chips of design-system nodes write no `ds:`.
describe("the home page", () => {
  it("writes no ds: on a chip of the site's own namespace", async () => {
    const page = await openPage("/", VIEWPORTS[0]);
    try {
      const chips = await page.evaluate(readComponentChips);
      expect(chips.length).toBeGreaterThan(0);
      expect(chips.filter((text) => text.includes("ds:"))).toEqual([]);
    } finally {
      await page.close();
    }
  });
});

// The standards index's rows carry one fact, so one of them is given more
// in the browser, from its own address, and narrowed: the real stylesheet
// on the real page, at a width where the later facts are drawn.
describe("a standards index row with several facts", () => {
  it("lets its facts leave whole, the last first, before its title is cut", async () => {
    const page = await openPage(STANDARDS_INDEX_PATH, VIEWPORTS[0]);
    try {
      const readings = await page.evaluate(narrowRowWithFacts, {
        added: ADDED_FACTS,
        step: NARROWING_STEP_PX,
      });
      const count = ADDED_FACTS.length + 1;
      const steps = readings.map((reading) => ({
        ...reading,
        kept: reading.facts.includes("0")
          ? reading.facts.indexOf("0")
          : reading.facts.length,
      }));
      const kept = steps.map((step) => step.kept);
      // At each width the facts that show are the first ones, each whole.
      expect(
        steps.filter(
          (step) =>
            step.facts !==
            "1".repeat(step.kept) + "0".repeat(count - step.kept),
        ),
      ).toEqual([]);
      // Narrowing never brings a fact back, and every count from all to
      // none is seen: each fact leaves in turn, the last first.
      expect(kept).toEqual(kept.toSorted((a, b) => b - a));
      expect([...new Set(kept)]).toEqual(
        Array.from({ length: count + 1 }, (_, index) => count - index),
      );
      // The title is cut only once no fact is left, and then only when
      // it does not fit the row.
      expect(
        steps.filter(
          (step) => step.titleCut && (step.kept > 0 || step.titleFits),
        ),
      ).toEqual([]);
    } finally {
      await page.close();
    }
  });
});

/**
 * Read the first rows' titles: each title's shown width, its text's whole
 * width, the width of `floor` characters in its face (the `ch` of the
 * floor), and how far its status, if it has one, ends past its row. It
 * runs in the page.
 *
 * @param args - The rows' selector, how many rows, and the floor.
 * @returns One measure per row.
 * @throws When a row has no title.
 */
function readRowTitles({
  selector,
  count,
  floor,
}: {
  readonly selector: string;
  readonly count: number;
  readonly floor: number;
}): readonly {
  readonly text: string;
  readonly shown: number;
  readonly whole: number;
  readonly floor: number;
  readonly statusOverflow: number;
}[] {
  const context = document.createElement("canvas").getContext("2d");
  return [...document.querySelectorAll(selector)].slice(0, count).map((row) => {
    const title = row.querySelector(".title");
    const status = row.querySelector(".status");
    if (!title || !context) {
      throw new Error("a row has no title");
    }
    context.font = getComputedStyle(title).font;
    return {
      text: title.textContent ?? "",
      shown: title.clientWidth,
      whole: title.scrollWidth,
      floor: context.measureText("0".repeat(floor)).width,
      statusOverflow: status
        ? status.getBoundingClientRect().right -
          row.getBoundingClientRect().right
        : 0,
    };
  });
}

/**
 * Open the catalog at a viewport width and measure its cards against the
 * canvas, every request off the dev cell's own origins answered empty.
 *
 * @param width - The viewport's width, in pixels.
 * @returns The canvas's edges and each card's measures.
 */
async function measureCatalogAt(
  width: number,
): Promise<ReturnType<typeof measureCatalogCards>> {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  try {
    const origins = [
      new URL(server.base).origin,
      new URL(server.graphBase).origin,
    ];
    await page.route("**/*", (route) =>
      origins.includes(new URL(route.request().url()).origin)
        ? route.continue()
        : route.fulfill({ status: 204, body: "" }),
    );
    await page.goto(new URL(CATALOG_PATH, server.base).href, {
      waitUntil: "networkidle",
      timeout: PAGE_SETTLE_MS,
    });
    return await page.evaluate(measureCatalogCards, CATALOG_CARD_SELECTOR);
  } finally {
    await page.close();
  }
}

// A UI block's card draws its example as its specimen, above its body. At
// every width each card stays inside the canvas, wide enough to read, and
// so do its specimen and its body.
describe.each(CATALOG_CARD_WIDTHS)("the catalog at %i px", (width) => {
  it("keeps every card, and a UI block's example, inside the canvas", async () => {
    const { canvas, cards } = await measureCatalogAt(width);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some(({ sections }) => sections.length === 2)).toBe(true);
    for (const card of cards) {
      expect(card.left).toBeGreaterThanOrEqual(
        canvas.left - WIDTH_TOLERANCE_PX,
      );
      expect(card.right).toBeLessThanOrEqual(canvas.right + WIDTH_TOLERANCE_PX);
      expect(card.width).toBeGreaterThanOrEqual(MIN_CATALOG_CARD_WIDTH_PX);
      for (const section of card.sections) {
        expect(section).toBeGreaterThanOrEqual(MIN_CATALOG_CARD_WIDTH_PX);
      }
    }
  });
});

// Below two groups a row's status shortens before its title falls under
// twelve characters: at one group, where the rail still takes a column, a
// catalog row's title is whole or keeps the floor, and its status stays
// inside the row.
describe("the catalog's rows at one group", () => {
  it("keeps each title whole or at twelve characters beside its status", async () => {
    const page = await openPage(CATALOG_ROWS_PATH, {
      width: CATALOG_ROW_TITLE_WIDTH,
      height: 844,
    });
    try {
      const titles = await page.evaluate(readRowTitles, {
        selector: CATALOG_ROW_SELECTOR,
        count: CATALOG_ROW_TITLE_COUNT,
        floor: ROW_TITLE_FLOOR_CHARACTERS,
      });
      expect(titles).toHaveLength(CATALOG_ROW_TITLE_COUNT);
      for (const { text, shown, whole, floor, statusOverflow } of titles) {
        if (whole > shown) {
          expect(shown, text).toBeGreaterThanOrEqual(
            floor - WIDTH_TOLERANCE_PX,
          );
        }
        expect(statusOverflow, text).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      }
    } finally {
      await page.close();
    }
  });
});

// Below one group the canvas holds three columns: a card at the Cards
// group's two would leave the third empty on every row, so every card, with
// an example or without, is as wide as the canvas.
describe.each(CATALOG_WHOLE_ROW_WIDTHS)("the catalog at %i px", (width) => {
  it("lays every card across the canvas's whole row", async () => {
    const { canvas, cards } = await measureCatalogAt(width);
    expect(cards.some(({ sections }) => sections.length === 0)).toBe(true);
    for (const card of cards) {
      expect(Math.abs(card.left - canvas.left)).toBeLessThanOrEqual(
        WIDTH_TOLERANCE_PX,
      );
      expect(Math.abs(card.right - canvas.right)).toBeLessThanOrEqual(
        WIDTH_TOLERANCE_PX,
      );
    }
  });
});
