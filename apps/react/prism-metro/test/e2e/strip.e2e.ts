// @vitest-environment node

/**
 * The strip in the browser, at each side of the two-group threshold: one
 * band of the same height on every page, its view and filtering groups on
 * the same column lines across pages at two groups and wider, no group
 * painted over another, its count shortened only once the trail has given
 * way, no crumb reading as an address, the Definitions count whole in its
 * short form, the shown figure and its noun, at 390 and in its full one at
 * 1440, the stations index's count whole beside the filter button at 448,
 * the count ending on the band's last
 * line, the facet bar
 * one band of the strip's height only where a lens has facets, kept in
 * place as the canvas scrolls, its controls inside the band and starting
 * under Search, a chip applied in the sheet showing on the bar's button
 * or, below 1376px, the bar holding "More filters" alone, the filtered
 * stations' count reading the rows shown, the sheet listing the facets
 * with their counts at 390, a panel's count in the strip only below two
 * groups, the folded
 * renderer menu's options as links that change only `as`, each a full
 * target, the folded sheet covering a phone's viewport, and no link to the
 * retired `view=` anywhere.
 */

import {
  launchBrowser,
  measureStrip,
  STRIP_VIEWPORTS,
  type StripMeasure,
} from "@canonical/prism-core/testing/browser";
import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CIRCLE_LINE_CURIE,
  NORTHGATE_CURIE,
  SERIES_90_CURIE,
} from "../../testing/fixtures.js";
import {
  DEV_READY_MS,
  GRAPH_READY_MS,
  PAGE_SETTLE_MS,
  WORKSPACE_PATH,
} from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** The strip's height: the density line and one padding above and below. */
const STRIP_HEIGHT_PX = 53;

/** How far a measured edge may round, in pixels. */
const EDGE_TOLERANCE_PX = 1;

/** How far a band's height may round, in pixels: the bands are strict. */
const BAND_TOLERANCE_PX = 0.5;

/** The smallest target a menu option may be, in pixels. */
const MIN_TARGET_PX = 24;

/** A crumb that reads as an address, a prefixed name or an absolute IRI. */
const ADDRESS_PATTERN = /^[a-z][\w-]*:/;

/** A station's page. */
const STATION_PATH = `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`;

/** The pages whose strip is measured. */
const STRIP_PATHS = [
  "/stations",
  "/stations?q=cen",
  "/stations?as=cards",
  STATION_PATH,
  "/lines",
  "/fleet",
  `/fleet/${encodeURIComponent(SERIES_90_CURIE)}`,
  "/network",
  `/network/stations/${encodeURIComponent(NORTHGATE_CURIE)}`,
  `/network/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`,
  WORKSPACE_PATH,
  "/not-found",
] as const;

/** The stations index with "Line is Circle Line" applied. */
const CIRCLE_PATH = `/stations?servesLine=${encodeURIComponent(CIRCLE_LINE_CURIE)}`;

/** How many of the 26 stations the Circle Line serves. */
const CIRCLE_STATIONS = 6;

/** The indexes whose count closes the strip's filtering group. */
const COUNTED_PATHS = ["/stations", "/stations?q=cen"] as const;

/** An index that offers more than one renderer. */
const SWITCHED_PATH = "/stations?q=cen";

let graph: RunningServer;
/**
 * Read the strip's count: the full sentence that names it, and the text it
 * shows. It runs in the page.
 *
 * @returns The count's name, `null` when it has one form, and its shown text.
 */
function readStripCount(): {
  readonly name: string | null;
  readonly shown: string;
} {
  const count = document.querySelector<HTMLElement>(
    '.ds.mode-strip [data-slot="count"] [aria-live]',
  );
  return {
    name: count?.getAttribute("aria-label") ?? null,
    shown: count?.innerText.trim() ?? "",
  };
}

/** A count's short form: the shown figure and its noun, nothing more. */
const SHORT_FORM_PATTERN = /^(\d+) (\p{L}+)$/u;

/**
 * Expect the count to show its short form, the shown figure and its noun,
 * under a full sentence that names it with the same figure and noun.
 */
const expectShortForm = (
  name: string | null,
  shown: string,
  path: string,
): void => {
  const [, figure, noun] = SHORT_FORM_PATTERN.exec(shown) ?? [];
  expect(figure, `${path}: "${shown}"`).toBeDefined();
  expect(name?.startsWith(`${figure} `), path).toBe(true);
  expect(noun !== undefined && name?.includes(noun), path).toBe(true);
  expect(shown.length, path).toBeLessThan(name?.length ?? 0);
};

let server: RunningServer;
let browser: Browser;

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
    });
    server = await startServer("dev:bun", CWD, {
      timeoutMs: DEV_READY_MS,
      env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
    });
    browser = await launchBrowser();
  },
  GRAPH_READY_MS + DEV_READY_MS + PAGE_SETTLE_MS,
);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
  await graph?.stop();
});

describe.each(STRIP_VIEWPORTS)("at $name px", (viewport) => {
  /**
   * Open `path` at this viewport, serving only the app's and the graph's
   * origins and leaving the live-reload socket unconnected.
   *
   * @note Impure: opens a browser tab, which the caller closes.
   */
  const open = async (path: string): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const origins = [new URL(server.base).origin, new URL(graph.base).origin];
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

  /** Measure the strip of `path`. */
  const measure = async (path: string): Promise<StripMeasure> => {
    const page = await open(path);
    try {
      return await page.evaluate(measureStrip);
    } finally {
      await page.close();
    }
  };

  it("keeps the strip one 53px band on every page, no group over another", async () => {
    for (const path of STRIP_PATHS) {
      const strip = await measure(path);
      const trail = strip.groups.trail;
      const trailWidth = trail === null ? 0 : trail.right - trail.x;
      expect(
        Math.abs((strip.height ?? 0) - STRIP_HEIGHT_PX),
        path,
      ).toBeLessThanOrEqual(BAND_TOLERANCE_PX);
      expect(strip.overflow, path).toBe(false);
      expect(strip.overlaps, path).toEqual([]);
      // The count shortens only once the trail has given way entirely.
      expect(strip.countClipped && trailWidth > EDGE_TOLERANCE_PX, path).toBe(
        false,
      );
      expect(
        strip.crumbs.filter((crumb) => ADDRESS_PATTERN.test(crumb)),
        path,
      ).toEqual([]);
      expect(strip.viewHrefs, path).toEqual([]);
    }
  });

  it("draws the facet bar as one 53px band only where the lens has facets", async () => {
    expect((await measure("/lines")).bar).toBeNull();
    for (const path of ["/stations", CIRCLE_PATH, WORKSPACE_PATH]) {
      const bar = (await measure(path)).bar;
      if (viewport.width >= 912) {
        expect(
          Math.abs((bar ?? 0) - STRIP_HEIGHT_PX),
          path,
        ).toBeLessThanOrEqual(BAND_TOLERANCE_PX);
      } else {
        expect(bar, path).toBeNull();
      }
    }
  });

  // A chip is applied in the sheet (ruling 74). From 1376px up the bar's
  // own button shows it pressed; below, the bar holds "More filters" alone
  // (ruling 72). Either way the bar stays one 53px band.
  it.runIf(viewport.width >= 912)(
    "applies a chip in the sheet and keeps the facet bar one band",
    async () => {
      const page = await open(`${WORKSPACE_PATH}?sheet=filter`);
      try {
        const chip = await page
          .locator(
            '[data-region="filter-sheet"][open] button[aria-pressed="false"]',
          )
          .first()
          .elementHandle();
        expect(chip).not.toBeNull();
        const name = (await chip?.textContent()) ?? "";
        await expect
          .poll(
            async () => {
              await chip?.click();
              return chip?.getAttribute("aria-pressed");
            },
            { timeout: PAGE_SETTLE_MS },
          )
          .toBe("true");
        const strip = await page.evaluate(measureStrip);
        expect(
          Math.abs((strip.bar ?? 0) - STRIP_HEIGHT_PX),
        ).toBeLessThanOrEqual(BAND_TOLERANCE_PX);
        expect(strip.barOverflow).toBe(false);
        expect(strip.controlsRight ?? 0).toBeLessThanOrEqual(
          (strip.contentEnd ?? 0) + EDGE_TOLERANCE_PX,
        );
        const bar = await page.evaluate((text) => {
          const controls = document.querySelector(
            '[data-region="filter-bar"] > .controls',
          );
          const shown = [...(controls?.children ?? [])]
            .filter((slot) => getComputedStyle(slot).display !== "none")
            .map((slot) => slot.getAttribute("data-slot"));
          const own = [
            ...(controls?.querySelectorAll<HTMLButtonElement>(
              '[data-slot="facets"] button',
            ) ?? []),
          ].find((button) => button.textContent === text);
          return {
            x: controls?.getBoundingClientRect().x ?? null,
            shown,
            pressed: own?.getAttribute("aria-pressed") ?? null,
          };
        }, name);
        // From two groups up the controls start under Search.
        expect(bar.x).not.toBeNull();
        expect(bar.x ?? 0).toBeCloseTo(strip.groups.filtering?.x ?? -1, 0);
        if (viewport.width >= 1376) {
          expect(bar.pressed).toBe("true");
        } else {
          expect(bar.shown).toEqual(["more"]);
        }
      } finally {
        await page.close();
      }
    },
  );

  it.runIf(viewport.width >= 1366)(
    "starts the view and filtering groups on the same lines on every page",
    async () => {
      const strips = await Promise.all(
        ["/stations", STATION_PATH, "/fleet", "/lines"].map(measure),
      );
      const views = strips.map(({ groups }) => groups.view?.x);
      const filterings = strips.map(({ groups }) => groups.filtering?.x);
      for (const x of views) {
        expect(x).toBeCloseTo(views.at(0) ?? 0, 0);
      }
      for (const x of filterings) {
        expect(x).toBeCloseTo(filterings.at(0) ?? 0, 0);
      }
    },
  );

  it.runIf(viewport.width >= 912)(
    "ends the count on the band's last line",
    async () => {
      for (const path of COUNTED_PATHS) {
        const strip = await measure(path);
        expect(strip.countRight, path).not.toBeNull();
        expect(
          Math.abs((strip.countRight ?? 0) - (strip.contentEnd ?? 0)),
          path,
        ).toBeLessThanOrEqual(EDGE_TOLERANCE_PX);
        expect(strip.searchWidth, path).toBeGreaterThan(0);
      }
    },
  );

  // A count shows its short form below two groups, the shown figure and its
  // noun, whole, and its full sentence wider; the full sentence names it at
  // every width.
  it.runIf(viewport.width === 390 || viewport.width === 1440)(
    "shows the count whole, its figure and noun at 390 and its sentence at 1440",
    async () => {
      for (const path of [WORKSPACE_PATH]) {
        const page = await open(path);
        try {
          const strip = await page.evaluate(measureStrip);
          const { name, shown } = await page.evaluate(readStripCount);
          expect(strip.countClipped, path).toBe(false);
          expect(name, path).not.toBeNull();
          if (viewport.width === 390) {
            expectShortForm(name, shown, path);
          } else {
            expect(shown, path).toBe(name);
          }
        } finally {
          await page.close();
        }
      }
    },
  );

  // At 448 the stations index's strip carries the filter button beside the
  // count, which leaves the count about 76px: its short form fits whole.
  it.runIf(viewport.width === 448)(
    "shows the stations index's count whole beside the filter button",
    async () => {
      const page = await open("/stations");
      try {
        const strip = await page.evaluate(measureStrip);
        const { name, shown } = await page.evaluate(readStripCount);
        const hasFold = await page.evaluate(
          () =>
            document.querySelector('.ds.mode-strip [data-slot="fold"]') !==
            null,
        );
        expect(hasFold).toBe(true);
        expect(strip.countClipped).toBe(false);
        expect(name).not.toBeNull();
        expectShortForm(name, shown, "/stations");
      } finally {
        await page.close();
      }
    },
  );

  it("shows the lines' count in the strip only where its panel is folded", async () => {
    const page = await open("/lines");
    try {
      const strip = await page.evaluate(measureStrip);
      const folded = await page.evaluate(() => {
        const read = (selector: string) => {
          const element = document.querySelector(
            `[data-region="mode-strip"] ${selector}`,
          );
          const box = element?.getBoundingClientRect();
          return {
            text: (element?.textContent ?? "").trim(),
            x: box?.x ?? 0,
            right: box?.right ?? 0,
          };
        };
        return {
          fold: read('[data-slot="fold"]'),
          count: read('[data-slot="count"]'),
        };
      });
      if (viewport.width < 912) {
        // The folded strip reads the trail, the menu, the fold, the count.
        expect(strip.countRight).not.toBeNull();
        expect(folded.count.text).toMatch(/\d/);
        expect(folded.fold.right).toBeLessThanOrEqual(
          folded.count.x + EDGE_TOLERANCE_PX,
        );
        expect(strip.overlaps).toEqual([]);
      } else {
        // The panel beside the list holds the count.
        expect(strip.countRight).toBeNull();
      }
    } finally {
      await page.close();
    }
  });

  it.runIf(viewport.width < 912)(
    "lists the offered renderers in the menu, each a link changing only as",
    async () => {
      const page = await open(SWITCHED_PATH);
      try {
        await page.click('[data-slot="view"] summary');
        const menu = await page.evaluate(() => {
          const options = [
            ...document.querySelectorAll<HTMLAnchorElement>(
              '[data-slot="view"] details[open] a[href]',
            ),
          ];
          return options.map((option) => ({
            href: option.href,
            current: option.getAttribute("aria-current"),
            height: option.getBoundingClientRect().height,
          }));
        });
        const here = new URL(SWITCHED_PATH, server.base);
        here.searchParams.delete("as");
        expect(menu.length).toBeGreaterThanOrEqual(2);
        expect(menu.filter(({ current }) => current === "page")).toHaveLength(
          1,
        );
        for (const { href, height } of menu) {
          const target = new URL(href);
          target.searchParams.delete("as");
          expect(target.pathname).toBe(here.pathname);
          expect(target.searchParams.toString()).toBe(
            here.searchParams.toString(),
          );
          expect(height).toBeGreaterThanOrEqual(MIN_TARGET_PX);
        }
      } finally {
        await page.close();
      }
    },
  );

  it.runIf(viewport.width < 912)(
    "folds the filters into a link to the sheet, which covers the viewport",
    async () => {
      const page = await open("/lines?sheet=filter");
      try {
        const sheet = await page.evaluate(() => {
          const dialog = document.querySelector(
            '[data-region="filter-sheet"][open]',
          );
          const box = dialog?.getBoundingClientRect();
          return {
            open: dialog !== null,
            width: box?.width ?? 0,
            height: box?.height ?? 0,
            scrolls:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          };
        });
        expect(sheet.open).toBe(true);
        expect(sheet.width).toBeCloseTo(viewport.width, 0);
        expect(sheet.height).toBeCloseTo(viewport.height, 0);
        expect(sheet.scrolls).toBe(false);
      } finally {
        await page.close();
      }
    },
  );

  it.runIf(viewport.width >= 912)(
    "keeps the stations' facet bar in place as the canvas scrolls",
    async () => {
      const page = await open("/stations");
      try {
        const tops = await page.evaluate(async () => {
          const bar = document.querySelector('[data-region="filter-bar"]');
          const before = bar?.getBoundingClientRect().top ?? null;
          for (const region of document.querySelectorAll(".canvas")) {
            region.scrollTop = region.scrollHeight;
          }
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(requestAnimationFrame);
          return { before, after: bar?.getBoundingClientRect().top ?? null };
        });
        expect(tops.before).not.toBeNull();
        expect(tops.after).toBe(tops.before);
      } finally {
        await page.close();
      }
    },
  );

  // The facet bar's controls start under Search; below 1376px the bar
  // holds "More filters" alone (ruling 72) and the applied facet shows on
  // its button from 1376px up (ruling 74). The count reads the rows shown.
  it.runIf(viewport.width >= 912)(
    "starts the facet controls under Search, Line is Circle Line applied",
    async () => {
      const page = await open(CIRCLE_PATH);
      try {
        const strip = await page.evaluate(measureStrip);
        const bar = await page.evaluate(() => {
          const controls = document.querySelector(
            '[data-region="filter-bar"] > .controls',
          );
          return {
            x: controls?.getBoundingClientRect().x ?? null,
            shown: [...(controls?.children ?? [])]
              .filter((slot) => getComputedStyle(slot).display !== "none")
              .map((slot) => slot.getAttribute("data-slot")),
            applied: [
              ...(controls?.querySelectorAll("summary.button.is-applied") ??
                []),
            ].map((button) => button.textContent),
            rows: document.querySelectorAll("tr.row").length,
          };
        });
        expect(bar.x).not.toBeNull();
        expect(bar.x ?? 0).toBeCloseTo(strip.groups.filtering?.x ?? -1, 0);
        expect(strip.barOverflow).toBe(false);
        expect(
          Math.abs((strip.bar ?? 0) - STRIP_HEIGHT_PX),
        ).toBeLessThanOrEqual(BAND_TOLERANCE_PX);
        if (viewport.width >= 1376) {
          expect(bar.shown).toEqual(["facets"]);
          expect(bar.applied).toHaveLength(1);
          expect(bar.applied.at(0)).toContain("Circle Line");
        } else {
          expect(bar.shown).toEqual(["more"]);
        }
        expect(bar.rows).toBe(CIRCLE_STATIONS);
        await expect
          .poll(() =>
            page
              .getByRole("status", {
                name: `${CIRCLE_STATIONS} of 26 entries`,
              })
              .count(),
          )
          .toBe(1);
      } finally {
        await page.close();
      }
    },
  );

  it.runIf(viewport.width === 390)(
    "lists the facets with their counts in the sheet, nothing sideways",
    async () => {
      const page = await open(`${CIRCLE_PATH}&sheet=filter`);
      try {
        const sheet = await page.evaluate(() => {
          const dialog = document.querySelector(
            '[data-region="filter-sheet"][open]',
          );
          return {
            facets: [...(dialog?.querySelectorAll("section.facet") ?? [])].map(
              (facet) => ({
                heading: facet.querySelector(".heading")?.textContent ?? "",
                counts: [...facet.querySelectorAll(".count")].map((count) =>
                  Number(count.textContent),
                ),
              }),
            ),
            chips: dialog?.querySelectorAll(".chip").length ?? 0,
            scrolls:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          };
        });
        // The stations' line, zone and kind facets, each value counted.
        expect(sheet.facets).toHaveLength(3);
        for (const { heading, counts } of sheet.facets) {
          expect(heading).not.toBe("");
          expect(counts.length).toBeGreaterThan(0);
          expect(counts.every(Number.isInteger)).toBe(true);
          expect(Math.max(...counts)).toBeGreaterThan(0);
        }
        expect(sheet.chips).toBe(1);
        expect(sheet.scrolls).toBe(false);
      } finally {
        await page.close();
      }
    },
  );
});
