import { select } from "d3-selection";
import "d3-transition";
import { type ZoomBehavior, zoom, zoomIdentity } from "d3-zoom";
import { useCallback, useEffect, useRef, useState } from "react";
import classifyZoomBucket from "../classifyZoomBucket.js";
import computeFitTransform from "../computeFitTransform.js";
import computeRevealTransform from "../computeRevealTransform.js";
import {
  CAMERA_MOVE_MS,
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
 * unmeasured viewport (zero-sized, as before layout) shows the viewBox at
 * scale 1.
 *
 * @note Impure: reads the viewport's layout box.
 */
function measureViewport(
  svg: SVGSVGElement,
  viewBox: GraphBox,
): { readonly scale: number; readonly visible: GraphBox } {
  const { width, height } = svg.getBoundingClientRect();
  if (width === 0 || height === 0) return { scale: 1, visible: viewBox };
  const scale = Math.min(width / viewBox.width, height / viewBox.height);
  return {
    scale,
    visible: {
      x: viewBox.x,
      y: viewBox.y,
      width: width / scale,
      height: height / scale,
    },
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
 * of twice the graph's size. The camera writes its transform straight to
 * the camera group, so React never renders one and the server's markup,
 * at the identity, hydrates unchanged.
 *
 * It reads the zoom bucket and the percentage from the world's on-screen
 * scale, measured on the client, and re-measures when the viewport
 * resizes. When `fit` changes it fits that box; when `reveal` changes it
 * pans that box into view, without zooming, only if it is not already in
 * view. Every move a control or a prop asks for takes 200ms, and is instant
 * under reduced motion.
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
  reveal,
}: UseGraphCameraProps): UseGraphCameraResult {
  const [bucket, setBucket] = useState<GraphZoomBucket>("full");
  const [percent, setPercent] = useState<number | undefined>(undefined);
  const behaviour = useRef<ViewportZoom | undefined>(undefined);
  const current = useRef<GraphTransform>(zoomIdentity);
  // The latest targets, read by the listeners and the controls; the effects
  // that act on a change compare the boxes' values, never their identity.
  const latest = useRef({ viewBox, fit, reveal });
  latest.current = { viewBox, fit, reveal };

  const viewBoxKey = formatBox(viewBox);
  const fitKey = fit === undefined ? undefined : formatBox(fit);
  const revealKey = reveal === undefined ? undefined : formatBox(reveal);

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

  // Fit a box, or the whole viewBox, into the visible area.
  const fitBox = useCallback(
    (box: GraphBox | undefined): void => {
      const svg = viewport.current;
      /* v8 ignore next -- only a mounted canvas fits, and its viewport ref is attached */
      if (svg === null) return;
      const { viewBox: bounds } = latest.current;
      moveTo(
        computeFitTransform(
          measureViewport(svg, bounds).visible,
          box ?? bounds,
        ),
      );
    },
    [moveTo, viewport],
  );

  // Zoom by a factor about the visible area's centre.
  const zoomBy = useCallback(
    (factor: number): void => {
      const svg = viewport.current;
      /* v8 ignore next -- only a mounted canvas zooms, and its viewport ref is attached */
      if (svg === null) return;
      const { visible } = measureViewport(svg, latest.current.viewBox);
      const [minZoom, maxZoom] = ZOOM_EXTENT;
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
    // Read the zoom's scale against the viewport's size into the bucket and
    // the percentage; each changes state only when its value changes.
    const readScale = (): void => {
      const screen =
        measureViewport(svg, latest.current.viewBox).scale * current.current.k;
      setBucket(classifyZoomBucket(screen));
      setPercent(Math.round(screen * 100));
    };
    const active: ViewportZoom = zoom<SVGSVGElement, unknown>()
      .scaleExtent([...ZOOM_EXTENT])
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
    selection.call(active);
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
    fitBox(latest.current.fit);
  }, [fitKey]);

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
    fitView: useCallback(() => fitBox(latest.current.fit), [fitBox]),
    zoomIn: useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]),
    zoomOut: useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]),
  };
}
