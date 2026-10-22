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
   * the region, and every element whose box ends past the viewport and that
   * no element of its own scrolls or clips.
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
}
