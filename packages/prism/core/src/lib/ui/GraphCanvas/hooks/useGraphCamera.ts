import { select } from "d3-selection";
import "d3-transition";
import { type ZoomBehavior, zoom, zoomIdentity } from "d3-zoom";
import { useCallback, useEffect, useRef, useState } from "react";
import classifyZoomBucket from "../classifyZoomBucket.js";
import computeFitTransform from "../computeFitTransform.js";
import computeOpeningTransform from "../computeOpeningTransform.js";
import computeRevealTransform from "../computeRevealTransform.js";
import computeWheelZoomFactor from "../computeWheelZoomFactor.js";
import computeZoomExtent from "../computeZoomExtent.js";
import {
  CAMERA_MOVE_MS,
  CLICK_DISTANCE,
  HUBS_SCALE,
  LEGIBLE_NUDGE,
  OVERVIEW_SCALE,
  PAN_MARGIN,
  REDUCED_MOTION_QUERY,
  ZOOM_EXTENT,
  ZOOM_STEP,
} from "../constants.js";
import type { GraphBox, GraphTransform, GraphZoomBucket } from "../types.js";
import type { UseGraphCameraProps, UseGraphCameraResult } from "./types.js";

/** The zoom behaviour as it is bound to the viewport. */
type ViewportZoom = ZoomBehavior<SVGSVGElement, unknown>;

/** Write a box as the string two boxes compare equal by. */
function formatBox(box: GraphBox): string {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

/**
 * Measure the viewport: the viewBox's on-screen scale under
 * `xMinYMin meet`, and the area of its user space the viewport shows, which
 * is wider or taller than the viewBox when the aspect ratios differ. An
 * unmeasured viewport (zero-sized, as before layout or while hidden) shows
 * the viewBox at scale 1, and says it is unmeasured.
 *
 * @note Impure: reads the viewport's layout box.
 */
function measureViewport(
  svg: SVGSVGElement,
  viewBox: GraphBox,
): {
  readonly scale: number;
  readonly visible: GraphBox;
  readonly measured: boolean;
} {
  const { width, height } = svg.getBoundingClientRect();
  if (width === 0 || height === 0) {
    return { scale: 1, visible: viewBox, measured: false };
  }
  const scale = Math.min(width / viewBox.width, height / viewBox.height);
  return {
    scale,
    visible: {
      x: viewBox.x,
      y: viewBox.y,
      width: width / scale,
      height: height / scale,
    },
    measured: true,
  };
}

/**
 * Locate a point of the screen in the viewport's user space, from the
 * viewport's layout box and the viewBox's on-screen scale under
 * `xMinYMin meet`: the measurement every other camera move reads. The
 * point never depends on the root `<svg>`'s screen matrix, which d3-zoom's
 * own pointer reads and which an environment may lack, d3-zoom then
 * reading the pointer in layout pixels as user units, so a viewport drawn
 * below its viewBox's size would zoom toward a point nearer its top-left
 * corner than the pointer.
 *
 * @note Impure: reads the viewport's layout box.
 */
function locateClientPoint(
  svg: SVGSVGElement,
  viewBox: GraphBox,
  clientX: number,
  clientY: number,
): [number, number] {
  const { left, top } = svg.getBoundingClientRect();
  const { scale, visible } = measureViewport(svg, viewBox);
  return [
    visible.x + (clientX - left) / scale,
    visible.y + (clientY - top) / scale,
  ];
}

/** Whether a camera stands at the identity, the server's paint. */
function isIdentity({ k, x, y }: GraphTransform): boolean {
  return k === 1 && x === 0 && y === 0;
}

/**
 * Read whether the reader asked for reduced motion.
 *
 * @note Impure: reads the environment's media queries.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}

/**
 * Bind a d3-zoom camera to a graph canvas's viewport: drag to pan, wheel or
 * pinch to zoom about the point under the pointer, located from the
 * viewport's own layout box, within the zoom extent and a pan margin
 * of twice the size of the graph's whole bounds, so a viewBox that opens on
 * a window of a large graph still lets the reader reach all of it. A press that moves less than the click
 * distance is a click, so a link under it still follows, and a double
 * click never zooms. The camera writes its transform straight to
 * the camera group, so React never renders one and the server's markup,
 * at the identity, hydrates unchanged.
 *
 * It reads the zoom bucket and the percentage from the world's on-screen
 * scale, measured on the client, and re-measures when the viewport
 * resizes. The first time it measures the viewport it moves, at once, to
 * the camera `memory` keeps, with `reveal` panned into view, or else to
 * the camera `opening` chooses, if any; without an `opening`, a viewBox
 * that would show below the legible zoom, as on a phone, opens on a
 * legible window of the graph's first region, the one `legibleWindow`
 * chooses or the viewBox's top-left corner, the rest a pan away. It opens
 * again for the new size when a resize shrinks the on-screen scale below
 * the legible zoom before anything has moved the camera since, and,
 * without an `opening`, when a resize leaves an unmoved camera on a window
 * where the viewBox now shows legibly, which returns it to the identity,
 * or at the identity where it shows below the legible zoom. The zoom
 * extent widens to hold any camera an opening or a fit sets, so the wheel
 * and the buttons zoom on, in and out, from there. It keeps every camera it
 * measures in `memory`, in screen terms. When `fit` changes it fits that
 * box; when `frame`'s serial changes it fits the frame's box, once; neither
 * refit zooms a legible view (every 14px text at 12px or more) out to an
 * illegible one: a box too large for the legible zoom shows the window of
 * it `legibleWindow` chooses, or its top-left corner at that zoom. Fit and
 * `0` fit the fit box whole down to the overview's floor (12/16, where the
 * 16px hub and region labels still render at 12px) and no further: a box
 * too large for it shows from its top-left corner at that floor, the rest
 * a pan away, and the zoom extent's floor follows them down. No fit lands
 * in the overview. When
 * `reveal` changes it pans that box into view, without zooming, only if it
 * is not already in view. Every move a control or a prop asks for takes
 * 200ms, and is instant under reduced motion.
 *
 * @note Impure: attaches d3-zoom's listeners and a resize observer to the
 *   viewport in an effect, removed on unmount, measures the viewport,
 *   writes the camera group's `transform` attribute and the memory's camera.
 */
export default function useGraphCamera({
  viewport,
  camera,
  viewBox,
  bounds,
  fit,
  frame,
  legibleWindow,
  reveal,
  opening,
  memory,
}: UseGraphCameraProps): UseGraphCameraResult {
  const [bucket, setBucket] = useState<GraphZoomBucket>("full");
  const [percent, setPercent] = useState<number | undefined>(undefined);
  const behaviour = useRef<ViewportZoom | undefined>(undefined);
  const current = useRef<GraphTransform>(zoomIdentity);
  // The latest targets, read by the listeners and the controls; the effects
  // that act on a change compare the boxes' values, never their identity.
  const latest = useRef({
    viewBox,
    bounds,
    fit,
    frame,
    legibleWindow,
    reveal,
    opening,
    memory,
  });
  latest.current = {
    viewBox,
    bounds,
    fit,
    frame,
    legibleWindow,
    reveal,
    opening,
    memory,
  };

  const viewBoxKey = formatBox(viewBox);
  const boundsKey = formatBox(bounds);
  const fitKey = fit === undefined ? undefined : formatBox(fit);
  const revealKey = reveal === undefined ? undefined : formatBox(reveal);
  const frameKey = frame?.serial;

  // Move the camera to a transform: at once under reduced motion, else in a
  // short transition.
  const moveTo = useCallback(
    (target: GraphTransform): void => {
      const svg = viewport.current;
      const active = behaviour.current;
      /* v8 ignore next -- the controls and the target effects run only in a mounted canvas, whose refs are attached and whose camera is bound */
      if (svg === null || active === undefined) return;
      const transform = zoomIdentity
        .translate(target.x, target.y)
        .scale(target.k);
      // A fit outside the extent widens it, so the wheel and the buttons
      // zoom on from where the fit left the camera.
      active.scaleExtent(computeZoomExtent(active.scaleExtent(), target.k));
      if (prefersReducedMotion()) {
        active.transform(select(svg), transform);
        return;
      }
      select(svg)
        .transition()
        .duration(CAMERA_MOVE_MS)
        .call(active.transform, transform);
    },
    [viewport],
  );

  // Fit a box, or the graph's whole bounds, into the visible area, never
  // into the overview: a box too large for the overview's floor shows from
  // its top-left corner at that floor, the rest a pan away, so the hub and
  // region labels stay. A refit that keeps the view legible zooms no lower
  // than the legible zoom when the camera is legible now, and shows the
  // legible window of a box too large for that zoom.
  const fitBox = useCallback(
    (box: GraphBox | undefined, keepLegible: boolean): void => {
      const svg = viewport.current;
      /* v8 ignore next -- only a mounted canvas fits, and its viewport ref is attached */
      if (svg === null) return;
      const { scale, visible } = measureViewport(svg, latest.current.viewBox);
      const target = box ?? latest.current.bounds;
      const legible = keepLegible && scale * current.current.k >= HUBS_SCALE;
      const least =
        ((legible ? HUBS_SCALE : OVERVIEW_SCALE) * LEGIBLE_NUDGE) / scale;
      const fitsLegibly =
        Math.min(
          visible.width / target.width,
          visible.height / target.height,
        ) >= least;
      const shown =
        fitsLegibly || !legible || latest.current.legibleWindow === undefined
          ? target
          : latest.current.legibleWindow(target, visible, scale);
      moveTo(computeFitTransform(visible, shown, least));
    },
    [moveTo, viewport],
  );

  // Zoom by a factor about the visible area's centre.
  const zoomBy = useCallback(
    (factor: number): void => {
      const svg = viewport.current;
      const active = behaviour.current;
      /* v8 ignore next -- only a mounted canvas zooms, and its viewport ref is attached and its camera bound */
      if (svg === null || active === undefined) return;
      const { visible } = measureViewport(svg, latest.current.viewBox);
      const [minZoom, maxZoom] = active.scaleExtent();
      const { k, x, y } = current.current;
      const next = Math.min(maxZoom, Math.max(minZoom, k * factor));
      const centreX = visible.x + visible.width / 2;
      const centreY = visible.y + visible.height / 2;
      moveTo({
        k: next,
        x: centreX - ((centreX - x) * next) / k,
        y: centreY - ((centreY - y) * next) / k,
      });
    },
    [moveTo, viewport],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: the camera rebinds when the viewBox's or the bounds' values change, not their identity
  useEffect(() => {
    const svg = viewport.current;
    const group = camera.current;
    /* v8 ignore next -- React attaches both refs before it runs an effect */
    if (svg === null || group === null) return;
    const { bounds: extent } = latest.current;
    // A new viewBox opens anew, once the viewport has been measured.
    let opened = false;
    // Whether the camera still stands where it opened: no gesture, control
    // or target has moved it since.
    let unmoved = false;
    // Whether the camera is moving to its opening or resuming, which moves
    // nothing the reader chose.
    let isOpening = false;
    // The on-screen scale of the last reading, against which a resize is
    // judged to have shrunk the view.
    let lastScreen: number | undefined;
    // Move the camera, at once, to a target nothing the reader chose,
    // with the zoom extent set anew to hold it, so the wheel and the
    // buttons zoom on from there, and an earlier opening's widening goes.
    const place = (target: GraphTransform): void => {
      active.scaleExtent(computeZoomExtent(ZOOM_EXTENT, target.k));
      isOpening = true;
      active.transform(
        select(svg),
        zoomIdentity.translate(target.x, target.y).scale(target.k),
      );
      isOpening = false;
    };
    // Resume the camera the memory keeps, for the visible area and scale,
    // with the revealed box panned into view; say whether there was one.
    const resume = (visible: GraphBox, scale: number): boolean => {
      const kept = latest.current.memory?.current;
      if (kept === undefined) return false;
      const restored: GraphTransform = {
        k: kept.camera.k / scale,
        x: kept.camera.x / scale + visible.x,
        y: kept.camera.y / scale + visible.y,
      };
      const box = latest.current.reveal;
      const revealed =
        box === undefined
          ? undefined
          : computeRevealTransform(visible, restored, box);
      unmoved = !kept.moved && revealed === undefined;
      place(revealed ?? restored);
      return true;
    };
    // Move the camera to where `opening` asks for the visible area and
    // scale, nowhere when it asks for nothing; or, without one, to a
    // legible window of the graph when the viewBox would show below the
    // legible zoom, else to the identity, the server's paint, when the
    // camera stands elsewhere. Either way the camera then stands unmoved;
    // say whether it moved.
    const open = (visible: GraphBox, scale: number): boolean => {
      const { opening, viewBox, legibleWindow } = latest.current;
      const target =
        opening === undefined
          ? (computeOpeningTransform(viewBox, visible, scale, legibleWindow) ??
            (isIdentity(current.current) ? undefined : zoomIdentity))
          : opening(visible, scale);
      unmoved = true;
      if (target !== undefined) place(target);
      return target !== undefined;
    };
    // Whether a canvas without an `opening` would open, at this scale, on
    // the identity or off it, the other way from where its camera stands:
    // its viewBox has come to show at the legible zoom with the camera on
    // a window, or below it with the camera at the identity.
    const isOffOpening = (visible: GraphBox, scale: number): boolean => {
      const { opening, viewBox, legibleWindow } = latest.current;
      if (opening !== undefined) return false;
      const opensOnIdentity =
        computeOpeningTransform(viewBox, visible, scale, legibleWindow) ===
        undefined;
      return opensOnIdentity !== isIdentity(current.current);
    };
    // Keep the camera in the memory, in screen terms.
    const remember = (visible: GraphBox, scale: number): void => {
      const memory = latest.current.memory;
      if (memory === undefined) return;
      const { k, x, y } = current.current;
      memory.current = {
        camera: {
          k: k * scale,
          x: (x - visible.x) * scale,
          y: (y - visible.y) * scale,
        },
        moved: !unmoved,
      };
    };
    // Read the zoom's scale against the viewport's size into the bucket and
    // the percentage; each changes state only when its value changes. The
    // first measured reading resumes the camera the memory keeps or opens
    // it where `opening` asks. A resize opens an unmoved camera again when
    // it shrinks the view below the legible zoom, or, without an
    // `opening`, when the camera stands on the identity or off it the
    // other way from where the canvas would now open, as when a viewport
    // that opened on a phone's window grows to show the viewBox legibly.
    // Every measured reading keeps the camera in the memory.
    const readScale = (): void => {
      const { scale, visible, measured } = measureViewport(
        svg,
        latest.current.viewBox,
      );
      const screen = scale * current.current.k;
      const resized =
        unmoved &&
        lastScreen !== undefined &&
        ((screen < lastScreen && screen < HUBS_SCALE) ||
          isOffOpening(visible, scale));
      if (measured && !isOpening && (!opened || resized)) {
        const resumed = !opened && resume(visible, scale);
        opened = true;
        if (resumed || open(visible, scale)) return;
      }
      lastScreen = screen;
      if (measured) remember(visible, scale);
      setBucket(classifyZoomBucket(screen));
      setPercent(Math.round(screen * 100));
    };
    const active: ViewportZoom = zoom<SVGSVGElement, unknown>()
      .scaleExtent([...ZOOM_EXTENT])
      .clickDistance(CLICK_DISTANCE)
      .extent((): [[number, number], [number, number]] => {
        const { visible } = measureViewport(svg, latest.current.viewBox);
        return [
          [visible.x, visible.y],
          [visible.x + visible.width, visible.y + visible.height],
        ];
      })
      .translateExtent([
        [
          extent.x - PAN_MARGIN * extent.width,
          extent.y - PAN_MARGIN * extent.height,
        ],
        [
          extent.x + (PAN_MARGIN + 1) * extent.width,
          extent.y + (PAN_MARGIN + 1) * extent.height,
        ],
      ])
      .on("zoom", (event: { readonly transform: GraphTransform }) => {
        if (!isOpening) unmoved = false;
        current.current = event.transform;
        group.setAttribute("transform", event.transform.toString());
        readScale();
      });
    const selection = select(svg);
    // The wheel zooms about the point under the pointer, located as the
    // controls locate the centre; d3-zoom's own wheel is replaced.
    const zoomByWheel = (event: WheelEvent): void => {
      event.preventDefault();
      active.scaleBy(
        selection,
        computeWheelZoomFactor(event),
        locateClientPoint(
          svg,
          latest.current.viewBox,
          event.clientX,
          event.clientY,
        ),
      );
    };
    // A double click selects what it lands on; it never zooms the camera.
    selection
      .call(active)
      .on("dblclick.zoom", null)
      .on("wheel.zoom", zoomByWheel, { passive: false });
    behaviour.current = active;
    readScale();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(readScale);
    observer?.observe(svg);
    return () => {
      observer?.disconnect();
      selection.on(".zoom", null);
      behaviour.current = undefined;
    };
  }, [viewBoxKey, boundsKey]);

  const lastFit = useRef(fitKey);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the camera refits when the fit box's values change, not its identity
  useEffect(() => {
    if (lastFit.current === fitKey) return;
    lastFit.current = fitKey;
    fitBox(latest.current.fit, true);
  }, [fitKey]);

  const lastFrame = useRef(frameKey);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the camera fits a frame once per request, when its serial changes
  useEffect(() => {
    if (lastFrame.current === frameKey) return;
    lastFrame.current = frameKey;
    const request = latest.current.frame;
    if (request !== undefined) fitBox(request.box, true);
  }, [frameKey]);

  const lastReveal = useRef(revealKey);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the camera pans when the reveal box's values change, not its identity
  useEffect(() => {
    if (lastReveal.current === revealKey) return;
    lastReveal.current = revealKey;
    const svg = viewport.current;
    const box = latest.current.reveal;
    if (svg === null || box === undefined) return;
    const target = computeRevealTransform(
      measureViewport(svg, latest.current.viewBox).visible,
      current.current,
      box,
    );
    if (target !== undefined) moveTo(target);
  }, [revealKey]);

  return {
    bucket,
    percent,
    fitView: useCallback(() => fitBox(latest.current.fit, false), [fitBox]),
    zoomIn: useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]),
    zoomOut: useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]),
  };
}
