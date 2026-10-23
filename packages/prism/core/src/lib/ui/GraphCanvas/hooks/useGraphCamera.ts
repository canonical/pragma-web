import { select } from "d3-selection";
import "d3-transition";
import { type ZoomBehavior, zoom, zoomIdentity } from "d3-zoom";
import { useCallback, useEffect, useRef, useState } from "react";
import classifyZoomBucket from "../classifyZoomBucket.js";
import computeFitTransform from "../computeFitTransform.js";
import computeRevealTransform from "../computeRevealTransform.js";
import {
  CAMERA_MOVE_MS,
  CLICK_DISTANCE,
  HUBS_SCALE,
  LEGIBLE_NUDGE,
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
 * pinch to zoom toward the pointer, within the zoom extent and a pan margin
 * of twice the graph's size. A press that moves less than the click
 * distance is a click, so a link under it still follows, and a double
 * click never zooms. The camera writes its transform straight to
 * the camera group, so React never renders one and the server's markup,
 * at the identity, hydrates unchanged.
 *
 * It reads the zoom bucket and the percentage from the world's on-screen
 * scale, measured on the client, and re-measures when the viewport
 * resizes. The first time it measures the viewport it moves, at once, to
 * the camera `opening` chooses, if any. When `fit` changes it fits that
 * box; when `frame`'s serial changes it fits the frame's box, once; neither
 * refit zooms a legible view (every 14px text at 12px or more) out to an
 * illegible one: a box too large for the legible zoom is shown from its
 * top-left corner at it. Fit and `0` fit the fit box whole, however small
 * that makes the zoom, and the zoom extent's floor follows them down. When
 * `reveal` changes it pans that box into view, without zooming, only if it
 * is not already in view. Every move a control or a prop asks for takes
 * 200ms, and is instant under reduced motion.
 *
 * @note Impure: attaches d3-zoom's listeners and a resize observer to the
 *   viewport in an effect, removed on unmount, measures the viewport, and
 *   writes the camera group's `transform` attribute.
 */
export default function useGraphCamera({
  viewport,
  camera,
  viewBox,
  fit,
  frame,
  reveal,
  opening,
}: UseGraphCameraProps): UseGraphCameraResult {
  const [bucket, setBucket] = useState<GraphZoomBucket>("full");
  const [percent, setPercent] = useState<number | undefined>(undefined);
  const behaviour = useRef<ViewportZoom | undefined>(undefined);
  const current = useRef<GraphTransform>(zoomIdentity);
  // The latest targets, read by the listeners and the controls; the effects
  // that act on a change compare the boxes' values, never their identity.
  const latest = useRef({ viewBox, fit, frame, reveal, opening });
  latest.current = { viewBox, fit, frame, reveal, opening };

  const viewBoxKey = formatBox(viewBox);
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
      // A fit below the extent's floor lowers the floor to it, so the
      // wheel and the buttons zoom on from where the fit left the camera.
      const [floor, ceiling] = active.scaleExtent();
      if (target.k < floor) active.scaleExtent([target.k, ceiling]);
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

  // Fit a box, or the whole viewBox, into the visible area; a refit that
  // keeps the view legible zooms no lower than the legible zoom when the
  // camera is legible now.
  const fitBox = useCallback(
    (box: GraphBox | undefined, keepLegible: boolean): void => {
      const svg = viewport.current;
      /* v8 ignore next -- only a mounted canvas fits, and its viewport ref is attached */
      if (svg === null) return;
      const { viewBox: bounds } = latest.current;
      const { scale, visible } = measureViewport(svg, bounds);
      const legible = scale * current.current.k >= HUBS_SCALE;
      moveTo(
        computeFitTransform(
          visible,
          box ?? bounds,
          keepLegible && legible ? (HUBS_SCALE * LEGIBLE_NUDGE) / scale : 0,
        ),
      );
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: the camera rebinds when the viewBox's values change, not its identity
  useEffect(() => {
    const svg = viewport.current;
    const group = camera.current;
    /* v8 ignore next -- React attaches both refs before it runs an effect */
    if (svg === null || group === null) return;
    const { viewBox: bounds } = latest.current;
    // A new viewBox opens anew, once the viewport has been measured.
    let opened = false;
    // Read the zoom's scale against the viewport's size into the bucket and
    // the percentage; each changes state only when its value changes. The
    // first measured reading opens the camera where `opening` asks.
    const readScale = (): void => {
      const { scale, visible, measured } = measureViewport(
        svg,
        latest.current.viewBox,
      );
      if (measured && !opened) {
        opened = true;
        const target = latest.current.opening?.(visible, scale);
        if (target !== undefined) {
          const [floor, ceiling] = active.scaleExtent();
          active.scaleExtent([Math.min(floor, target.k), ceiling]);
          active.transform(
            select(svg),
            zoomIdentity.translate(target.x, target.y).scale(target.k),
          );
          return;
        }
      }
      const screen = scale * current.current.k;
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
          bounds.x - PAN_MARGIN * bounds.width,
          bounds.y - PAN_MARGIN * bounds.height,
        ],
        [
          bounds.x + (PAN_MARGIN + 1) * bounds.width,
          bounds.y + (PAN_MARGIN + 1) * bounds.height,
        ],
      ])
      .on("zoom", (event: { readonly transform: GraphTransform }) => {
        current.current = event.transform;
        group.setAttribute("transform", event.transform.toString());
        readScale();
      });
    const selection = select(svg);
    // A double click selects what it lands on; it never zooms the camera.
    selection.call(active).on("dblclick.zoom", null);
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
  }, [viewBoxKey]);

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
