import type { RefObject } from "react";
import type {
  GraphBox,
  GraphCameraMemory,
  GraphFrameRequest,
  GraphLegibleWindow,
  GraphOpening,
  GraphZoomBucket,
} from "../types.js";

/** What `useGraphCamera` reads: the canvas's elements and its targets. */
export interface UseGraphCameraProps {
  /** The viewport `<svg>` the camera listens on. */
  readonly viewport: RefObject<SVGSVGElement | null>;
  /** The camera `<g>` whose transform the camera writes. */
  readonly camera: RefObject<SVGGElement | null>;
  /** The viewport's viewBox: the graph's bounds plus its margin. */
  readonly viewBox: GraphBox;
  /** The whole graph's box, which bounds the pan. */
  readonly bounds: GraphBox;
  /** The box Fit fits, and the camera fits when it changes. */
  readonly fit: GraphBox | undefined;
  /** The box the camera fits once each time the request changes. */
  readonly frame: GraphFrameRequest | undefined;
  /** The window a legible refit shows of a box too large for it. */
  readonly legibleWindow: GraphLegibleWindow | undefined;
  /** The box the camera pans into view when it changes. */
  readonly reveal: GraphBox | undefined;
  /** Where the camera opens once the viewport is measured. */
  readonly opening: GraphOpening | undefined;
  /** Where the camera keeps its place and resumes it from. */
  readonly memory: RefObject<GraphCameraMemory | undefined> | undefined;
}

/** What `useGraphCamera` returns: the zoom's reading and its controls. */
export interface UseGraphCameraResult {
  /** Which text the drawing can show at the current zoom. */
  readonly bucket: GraphZoomBucket;
  /**
   * The world's on-screen scale as a whole percentage, or `undefined` until
   * the client has measured the viewport.
   */
  readonly percent: number | undefined;
  /** Fit the fit box, or the graph's whole bounds. */
  readonly fitView: () => void;
  /** Zoom in one step, about the viewport's centre. */
  readonly zoomIn: () => void;
  /** Zoom out one step, about the viewport's centre. */
  readonly zoomOut: () => void;
}

/** What `useGraphZoomBucket` returns: the nearest canvas's zoom bucket. */
export type UseGraphZoomBucketResult = GraphZoomBucket;
