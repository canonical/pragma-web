import { useContext } from "react";
import Context from "../Context.js";
import type { UseGraphZoomBucketResult } from "./types.js";

/**
 * Read the zoom bucket of the `GraphCanvas` a drawing renders in, so the
 * drawing shows only the text that renders at 12px or more on screen:
 * nothing at `overview`, its 16px text at `hubs`, everything at `full`.
 * It is `full` on the server and outside any canvas.
 *
 * @note Impure: reads the canvas's context.
 * @returns The zoom bucket.
 */
export default function useGraphZoomBucket(): UseGraphZoomBucketResult {
  return useContext(Context);
}
