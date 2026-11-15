// @vitest-environment node

/**
 * The sectioned view's "On this page" bar with scripts off, laid out by a
 * real browser: the view, server-rendered as the page of a document inside
 * a stand-in for a site's shell, with the layer order, the spacing shim,
 * the grid presets, the design tokens, the density channel a docs site
 * reads and the core stylesheets, is loaded
 * with scripts disabled below three groups. The bar is a native disclosure
 * whose entries are fragment links, so what is asserted needs no script:
 * the summary reads the label, a click on it opens the list, and choosing
 * an entry scrolls the canvas until that section's heading rests on the
 * bar's lower edge. On a phone, a view with more sections than the screen
 * holds opens a panel that ends on the screen and scrolls on its own, so
 * its last entry is within reach, and a Markdown table wider than the
 * screen in a section's prose scrolls inside its own box, within the
 * section, while the page does not.
 */

import type { Browser, Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  DocumentLayout,
  ModeStrip,
  SectionedView,
} from "../../src/lib/ui/index.js";
import { launchBrowser } from "../../testing/browser/index.js";
import {
  BAR_EDGE_TOLERANCE_PX,
  CONTENTS_BAR_VIEWPORTS,
  DOCUMENT_CONTEXT_CLASS_NAME,
  LONG_INDEX_SECTIONS,
  PAGE_URL,
  PHONE_VIEWPORT,
  SECTION_PARAGRAPHS,
  SECTION_TITLES,
  SECTIONED_VIEW_MODIFIERS,
  SECTIONED_VIEW_STYLESHEETS,
  WIDE_TABLE_COLUMNS,
} from "./constants.js";
import { readStylesheets, renderPage } from "./serverPage.js";

/** The bar's hook (Annex D). */
const BAR = "[data-region=contents-bar]";

/** The sections, each long enough for its heading to reach the bar. */
const SECTIONS = SECTION_TITLES.map((title) => ({
  id: title.toLowerCase(),
  title,
  content: (
    <div>
      {Array.from(
        { length: SECTION_PARAGRAPHS },
        (_, index) => `${title}, paragraph ${index + 1}.`,
      ).map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  ),
}));

/** A document whose page is a sectioned view with the bar. */
const sectionedDocument = (
  <DocumentLayout
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Document" />}
  >
    <SectionedView
      header={
        <header>
          <h1>Button</h1>
        </header>
      }
      sections={SECTIONS}
    />
  </DocumentLayout>
);

/** A document whose view has more sections than a phone's screen holds. */
const longIndexDocument = (
  <DocumentLayout
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Document" />}
  >
    <SectionedView
      header={
        <header>
          <h1>Button</h1>
        </header>
      }
      sections={Array.from({ length: LONG_INDEX_SECTIONS }, (_, index) => ({
        id: `section-${index + 1}`,
        title: `Section ${index + 1}`,
        content: <p>{`Section ${index + 1}.`}</p>,
      }))}
    />
  </DocumentLayout>
);

/**
 * A document whose one section's prose holds a Markdown table, as the
 * Markdown renderer writes one (`table.ds.markdown-table`), with cells
 * that do not wrap, as a code column's would not.
 */
const proseTableDocument = (
  <DocumentLayout
    rail={<nav aria-label="Rail">Rail</nav>}
    strip={<ModeStrip trail="Document" />}
  >
    <SectionedView
      header={
        <header>
          <h1>Button</h1>
        </header>
      }
      sections={[
        {
          id: "usage",
          title: "Usage",
          content: (
            <div className="editorial">
              <p>The properties a button takes.</p>
              <table className="ds markdown-table">
                <thead>
                  <tr>
                    {WIDE_TABLE_COLUMNS.map((column) => (
                      <th key={column} style={{ whiteSpace: "nowrap" }}>
                        {`${column} of the button's property`}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          ),
        },
      ]}
    />
  </DocumentLayout>
);

let browser: Browser;
let html: string;
let longIndexHtml: string;
let proseTableHtml: string;

beforeAll(async () => {
  const css = readStylesheets(
    SECTIONED_VIEW_STYLESHEETS,
    SECTIONED_VIEW_MODIFIERS,
  );
  html = renderPage(sectionedDocument, css, DOCUMENT_CONTEXT_CLASS_NAME);
  longIndexHtml = renderPage(
    longIndexDocument,
    css,
    DOCUMENT_CONTEXT_CLASS_NAME,
  );
  proseTableHtml = renderPage(
    proseTableDocument,
    css,
    DOCUMENT_CONTEXT_CLASS_NAME,
  );
  browser = await launchBrowser();
});

afterAll(async () => {
  await browser?.close();
});

describe.each(CONTENTS_BAR_VIEWPORTS)("at $width px", (viewport) => {
  /**
   * Open the server-rendered document at this viewport with scripts off,
   * served at an address of its own so its links are fragments of it.
   *
   * @note Impure: opens a browser tab, which the caller closes.
   */
  const open = async (): Promise<Page> => {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      javaScriptEnabled: false,
    });
    await page.route(PAGE_URL, (route) =>
      route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.goto(PAGE_URL);
    return page;
  };

  it("opens the bar with scripts off and its entries bring a heading to its edge (W6a-A8)", async () => {
    const page = await open();
    try {
      const summary = page.locator(`${BAR} summary`);
      const disclosure = page.locator(`${BAR} details`);
      expect((await summary.textContent())?.trim()).toBe("On this page");
      expect(await disclosure.getAttribute("open")).toBeNull();
      await summary.click();
      expect(await disclosure.getAttribute("open")).not.toBeNull();
      expect(await page.locator(`${BAR} .panel`).isVisible()).toBe(true);

      // An entry whose heading starts below the fold, with sections enough
      // after it: the link scrolls the canvas until the heading rests on
      // the bar's edge.
      const section = SECTIONS.at(2);
      const heading = page.locator(`[id="${section?.id}"]`);
      const before = await heading.boundingBox();
      expect(before?.y).toBeGreaterThan(viewport.height);
      await page.locator(`${BAR} .panel a[href="#${section?.id}"]`).click();
      await expect
        .poll(async () => {
          const [bar, target] = await Promise.all([
            page.locator(BAR).boundingBox(),
            heading.boundingBox(),
          ]);
          return Math.abs(
            (target?.y ?? Number.POSITIVE_INFINITY) -
              ((bar?.y ?? 0) + (bar?.height ?? 0)),
          );
        })
        .toBeLessThanOrEqual(BAR_EDGE_TOLERANCE_PX);
    } finally {
      await page.close();
    }
  });
});

describe(`at ${PHONE_VIEWPORT.width} by ${PHONE_VIEWPORT.height} px`, () => {
  it("ends a long index's panel on the screen and scrolls it to its last entry", async () => {
    const page = await browser.newPage({
      viewport: PHONE_VIEWPORT,
      javaScriptEnabled: false,
    });
    try {
      await page.route(PAGE_URL, (route) =>
        route.fulfill({ contentType: "text/html", body: longIndexHtml }),
      );
      await page.goto(PAGE_URL);
      await page.locator(`${BAR} summary`).click();
      const panel = page.locator(`${BAR} .panel`);
      const links = panel.locator("a");
      expect(await links.count()).toBe(LONG_INDEX_SECTIONS);
      const opened = await panel.boundingBox();
      expect(opened).not.toBeNull();
      expect((opened?.y ?? 0) + (opened?.height ?? 0)).toBeLessThanOrEqual(
        PHONE_VIEWPORT.height,
      );
      const last = links.last();
      await last.scrollIntoViewIfNeeded();
      const [box, entry] = await Promise.all([
        panel.boundingBox(),
        last.boundingBox(),
      ]);
      expect(box).not.toBeNull();
      expect(entry).not.toBeNull();
      // The panel scrolled, not the page: it stays where it opened, and
      // the last entry lies inside it, on the screen.
      expect(box?.y).toBe(opened?.y);
      expect((entry?.y ?? 0) + (entry?.height ?? 0)).toBeLessThanOrEqual(
        (box?.y ?? 0) + (box?.height ?? 0) + BAR_EDGE_TOLERANCE_PX,
      );
      expect(entry?.y ?? -1).toBeGreaterThanOrEqual(box?.y ?? 0);
    } finally {
      await page.close();
    }
  });

  it("scrolls a prose's wide Markdown table inside its own box, within its section", async () => {
    const page = await browser.newPage({
      viewport: PHONE_VIEWPORT,
      javaScriptEnabled: false,
    });
    try {
      await page.route(PAGE_URL, (route) =>
        route.fulfill({ contentType: "text/html", body: proseTableHtml }),
      );
      await page.goto(PAGE_URL);
      const table = page.locator(
        ".section-body > .editorial > .markdown-table",
      );
      const [overflowX, display] = await Promise.all([
        table.evaluate((node) => getComputedStyle(node).overflowX),
        table.evaluate((node) => getComputedStyle(node).display),
      ]);
      expect(overflowX).toBe("auto");
      expect(display).toBe("block");
      const [extent, box, body, canvas] = await Promise.all([
        table.evaluate((node) => ({
          scroll: node.scrollWidth,
          client: node.clientWidth,
        })),
        table.boundingBox(),
        page.locator(".section-body").boundingBox(),
        page.locator("main.ds.canvas").evaluate((node) => ({
          scroll: node.scrollWidth,
          client: node.clientWidth,
        })),
      ]);
      // The table is wider than its box, which scrolls it: the box ends
      // within the section's body, and the canvas does not scroll.
      expect(extent.scroll).toBeGreaterThan(extent.client);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        (body?.x ?? 0) + (body?.width ?? 0) + BAR_EDGE_TOLERANCE_PX,
      );
      expect(canvas.scroll).toBeLessThanOrEqual(canvas.client);
    } finally {
      await page.close();
    }
  });
});
