import type { THEMES, VIEWPORTS } from "./constants.js";

/** A viewport a layout is measured at. */
export type Viewport = (typeof VIEWPORTS)[number];

/** A theme a layout is measured in. */
export type Theme = (typeof THEMES)[number];

/** What `measureLayout` reads its page with. */
export interface MeasureLayoutOptions {
  /** The chrome whose gaps, paddings and margins the histogram counts. */
  readonly chromeSelector: string;
  /** The layout's regions, which never excuse an overflow. */
  readonly regionSelector: string;
  /**
   * The layout's frame, its strips: nothing in it may scroll sideways, so a
   * control cut by a scroller of its own counts as an overflow.
   */
  readonly frameSelector: string;
  /**
   * The elements that must fill the rows of the canvas's page from its
   * inline start to its end, such as a catalog's cards; left out, nothing
   * is measured.
   */
  readonly fillSelector?: string;
  /** The grid every spacing sits on, in pixels. */
  readonly step: number;
  /** How far past the viewport an edge may round, in pixels. */
  readonly tolerance: number;
  /** The overflow values that make an element clip or scroll its content. */
  readonly clippingOverflows: readonly string[];
}

/** What one page's layout measures to. */
export interface LayoutMeasure {
  /** Every `.grid.intrinsic`: its classes, container name and columns. */
  readonly grids: readonly {
    readonly className: string;
    readonly containerName: string;
    readonly columns: number;
  }[];
  /** The document's scroll box and the viewport. */
  readonly page: {
    readonly scrollHeight: number;
    readonly scrollWidth: number;
    readonly innerHeight: number;
    readonly innerWidth: number;
  };
  /**
   * What reaches past the viewport's inline end or past its own region,
   * each as `element right=…`: the shell's content (which the shell clips,
   * so the document never shows it), a region whose content is wider than
   * the region, every element whose box ends past the viewport and that
   * no element of its own scrolls or clips, and every element of the frame
   * that scrolls its content sideways.
   */
  readonly overflow: readonly string[];
  /** The elements that scroll: a scrolling overflow and content past it. */
  readonly scrollers: readonly string[];
  /** The canvas's overflow and its scroll box. */
  readonly canvas: {
    readonly overflow: string;
    readonly scrollHeight: number;
    readonly clientHeight: number;
  };
  /**
   * The canvas's page, in pixels: its inline size, its column gap, the
   * inline size of its first element, which spans the page's columns, and
   * how far from the page's inline start the leftmost element of
   * `fillSelector` starts and how far short of its inline end the
   * rightmost stops. A size is -1 when its element is absent; the
   * shortfall is null when no element matches or none was asked for.
   */
  readonly canvasPage: {
    readonly width: number;
    readonly columnGap: number;
    readonly firstChildWidth: number;
    readonly fillShortfall: {
      readonly start: number;
      readonly end: number;
    } | null;
  };
  /** The block overflow of the layout's rail and inspector regions. */
  readonly regionOverflow: Readonly<Record<string, string | null>>;
  /** Whether the inspector's drawer trigger shows. */
  readonly triggerShown: boolean;
  /** The chrome's spacings, as `px value → count`. */
  readonly histogram: Readonly<Record<string, number>>;
  /** The chrome's spacings off the 4px grid, as `element property: value`. */
  readonly offGrid: readonly string[];
}

/** One theme's measure of a page. */
export interface ThemedMeasure {
  /** The theme the page was measured in. */
  readonly theme: Theme;
  /** What the page's layout measured to in it. */
  readonly measure: LayoutMeasure;
}

/** What `measurePage` opens a page with. */
export interface MeasurePageOptions {
  /** The page's absolute URL. */
  readonly url: string;
  /** The viewport to lay it out at. */
  readonly viewport: Viewport;
  /**
   * The origins the page may reach, its own and its graph's; every other
   * request is answered empty, so a third-party asset the sandbox cannot
   * reach never holds the page open.
   */
  readonly origins: readonly string[];
  /** How long the page may take to settle, in milliseconds. */
  readonly timeoutMs: number;
  /** The elements that must fill the page's rows, as `measureLayout` reads them. */
  readonly fillSelector?: string;
}
