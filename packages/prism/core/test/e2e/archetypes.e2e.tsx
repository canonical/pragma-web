// @vitest-environment node

/**
 * The archetypes' reflow, laid out by a real browser: a workspace with an
 * inspector and a document with an aside, server-rendered into a page that
 * carries the layer order, the spacing shim, the grid presets, the design
 * tokens and the core stylesheets, inside a stand-in for a site's shell.
 * Chromium lays each out at 1440px, 1000px and 390px. What is asserted is
 * what the container queries promise: which region shows, whether the
 * drawer's trigger shows, which columns the canvas spans, where the aside
 * sits, that it scrolls with the page and that every entry of an aside
 * taller than the viewport can be scrolled into view, the gutter between
 * the rows, and that nothing reaches past the viewport.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Browser, Page } from "playwright";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  DocumentLayout,
  ModeStrip,
  WorkspaceLayout,
} from "../../src/lib/ui/index.js";
import {
  FRAME_SELECTOR,
  launchBrowser,
  type MeasureLayoutOptions,
  measureLayout,
} from "../../testing/browser/index.js";
import {
  ARCHETYPE_VIEWPORTS,
  COMPONENT_STYLESHEETS,
  SCROLL_PX,
  SHELL_RULES,
} from "./constants.js";

/** The package's own components, two levels up from this file. */
const UI_DIRECTORY = fileURLToPath(
  new URL("../../src/lib/ui", import.meta.url),
);

/** Paragraphs enough to scroll a document's canvas. */
const PARAGRAPHS = Array.from(
  { length: 60 },
  (_, index) => `Paragraph ${index + 1}.`,
);

/** Entries enough to make the aside taller than every viewport. */
const ASIDE_ENTRIES = Array.from(
  { length: 60 },
  (_, index) => `Section ${index + 1}`,
);

/** What `measureLayout` is asked to read on these pages. */
const MEASURE_OPTIONS: MeasureLayoutOptions = {
  chromeSelector: ".ds.shell",
  regionSelector: [
    ".ds.workspace-layout > *",
    ".ds.document-layout > *",
    "main.ds.canvas",
  ].join(", "),
  frameSelector: FRAME_SELECTOR,
  step: 4,
  tolerance: 0.5,
  clippingOverflows: ["auto", "scroll", "hidden", "clip"],
};

/**
 * Read the stylesheets a site loads before the archetypes': the layer
 * order, the primitive tokens the shim resolves to, the spacing shim and
 * the grid presets, then the core components' own.
 *
 * @note Impure: reads the stylesheets from the file system.
 */
function readStylesheets(): string {
  const require = createRequire(import.meta.url);
  const styles = dirname(require.resolve("@canonical/styles/package.json"));
  const tokens = createRequire(join(styles, "package.json")).resolve(
    "@canonical/design-tokens/dist/sets.primitive.css",
  );
  return [
    join(styles, "src", "layers.css"),
    tokens,
    join(styles, "src", "spacing.css"),
    join(styles, "src", "grid.css"),
    ...COMPONENT_STYLESHEETS.map((name) =>
      join(UI_DIRECTORY, name, "styles.css"),
    ),
  ]
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}

/** Server-render a layout inside a stand-in for a site's shell. */
function renderPage(layout: ReactElement, css: string): string {
  return `<!doctype html><html><head><style>${css}${SHELL_RULES}</style></head><body><div class="ds shell grid intrinsic">${renderToString(layout)}</div></body></html>`;
}

/** A workspace with every region claimed. */
const workspaceLayout = (
  <WorkspaceLayout
    inspector={<p>Inspector</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip context="Workspace" />}
  >
    <p>Canvas</p>
  </WorkspaceLayout>
);

/** A document long enough to scroll, with an aside taller than the viewport. */
const documentLayout = (
  <DocumentLayout
    aside={
      <ul>
        {ASIDE_ENTRIES.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    }
    colophon={<p>Colophon</p>}
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip context="Document" />}
  >
    <div>
      {PARAGRAPHS.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  </DocumentLayout>
);

/**
 * Read the computed placement and display of the elements a reflow moves,
 * and the layout's row gap.
 *
 * @note Impure: reads the page's computed styles and boxes.
 */
function readPlacement(page: Page) {
  return page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector(selector);
      if (element === null) return null;
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        display: style.display,
        position: style.position,
        column: [style.gridColumnStart, style.gridColumnEnd],
        row: style.gridRowStart,
        top: box.top,
        left: box.left,
        right: box.right,
      };
    };
    const layout = document.querySelector(
      ".ds.workspace-layout, .ds.document-layout",
    );
    return {
      rowGap: layout === null ? "" : getComputedStyle(layout).rowGap,
      columns: getComputedStyle(
        document.querySelector(".ds.shell") ?? document.body,
      ).gridTemplateColumns.split(" ").length,
      rail: read(":is(.ds.workspace-layout, .ds.document-layout) > .rail"),
      canvas: read("main.ds.canvas"),
      page: read("main.ds.canvas > .page"),
      inspector: read(".ds.workspace-layout > .inspector"),
      trigger: read(".inspector-trigger"),
      aside: read("main.ds.canvas > .aside"),
    };
  });
}

/**
 * Scroll the canvas from its top to its end, a fraction of its height at a
 * time, and return how many of the aside's entries were fully inside the
 * canvas at one position or another.
 *
 * @note Impure: scrolls the page's canvas and reads its boxes.
 */
function countReachableAsideEntries(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector("main.ds.canvas");
    if (canvas === null) return 0;
    const entries = [...canvas.querySelectorAll(":scope > .aside li")];
    const reached = new Set<Element>();
    const step = canvas.clientHeight / 4;
    for (let top = 0; top <= canvas.scrollHeight; top += step) {
      canvas.scrollTop = top;
      const frame = canvas.getBoundingClientRect();
      for (const entry of entries) {
        const box = entry.getBoundingClientRect();
        if (box.top >= frame.top && box.bottom <= frame.bottom) {
          reached.add(entry);
        }
      }
    }
    canvas.scrollTop = 0;
    return reached.size;
  });
}

let browser: Browser;
let css: string;

beforeAll(async () => {
  css = readStylesheets();
  browser = await launchBrowser();
});

afterAll(async () => {
  await browser?.close();
});

describe.each(ARCHETYPE_VIEWPORTS)("at $width px", (viewport) => {
  /** Open a server-rendered layout at this viewport. */
  const open = async (layout: ReactElement): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
    });
    await page.setContent(renderPage(layout, css));
    return page;
  };

  it("lays the workspace's inspector as a region or behind the drawer's trigger, and the canvas between", async () => {
    const page = await open(workspaceLayout);
    try {
      const placement = await readPlacement(page);
      expect(placement.columns).toBe(viewport.columns);
      expect(placement.rowGap).toBe("16px");
      expect(placement.inspector?.display !== "none").toBe(
        viewport.inspectorShown,
      );
      expect(placement.trigger?.display !== "none").toBe(
        !viewport.inspectorShown,
      );
      expect(placement.canvas?.column).toEqual(viewport.canvasColumns);
      if (viewport.inspectorShown) {
        expect(placement.canvas?.right).toBeLessThanOrEqual(
          placement.inspector?.left ?? 0,
        );
      }
      const measure = await page.evaluate(measureLayout, MEASURE_OPTIONS);
      expect(measure.overflow).toEqual([]);
      expect(measure.scrollers).not.toContain("main.ds.canvas");
    } finally {
      await page.close();
    }
  });

  it("keeps the document's aside in the canvas's one scroll, beside or under the page", async () => {
    const page = await open(documentLayout);
    try {
      const before = await readPlacement(page);
      expect(before.rowGap).toBe("16px");
      expect(before.canvas?.column).toEqual([
        viewport.width < 448 ? "2" : "3",
        "-1",
      ]);
      expect(before.aside?.position).toBe("static");
      if (viewport.asideBeside) {
        expect(before.aside?.column).toEqual(["-4", "-1"]);
        expect(before.page?.column).toEqual(["1", "-4"]);
        expect(before.aside?.top).toBe(before.canvas?.top);
      } else {
        expect(before.aside?.row).toBe("2");
        expect(before.page?.column).toEqual(["1", "-1"]);
      }

      // Beside or under the page, the aside moves with the scroll.
      await page.evaluate((distance) => {
        document.querySelector("main.ds.canvas")?.scrollBy(0, distance);
      }, SCROLL_PX);
      const after = await readPlacement(page);
      expect(after.aside?.top).toBe((before.aside?.top ?? 0) - SCROLL_PX);

      // An aside taller than the viewport has no entry out of reach.
      expect(await countReachableAsideEntries(page)).toBe(ASIDE_ENTRIES.length);

      const measure = await page.evaluate(measureLayout, MEASURE_OPTIONS);
      expect(measure.overflow).toEqual([]);
      for (const scroller of measure.scrollers) {
        expect(["main.ds.canvas", "div.rail"]).toContain(scroller);
      }
    } finally {
      await page.close();
    }
  });
});
