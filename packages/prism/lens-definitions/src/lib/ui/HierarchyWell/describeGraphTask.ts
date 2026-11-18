import type { ClassGraphLayout } from "../../classGraph/types.js";
import { GRAPH_TASKS } from "./constants.js";
import type { GraphTaskHooks } from "./types.js";

/**
 * Describe the task a Definitions canvas serves: on a term page, the
 * neighbourhood of the class in focus; on an opened view, the shape of the
 * opened namespace's relations; on the overview, the shape of every drawn
 * namespace's, in packing order.
 *
 * @param layout - The class graph's layout.
 * @param term - The selected term (compact), on a term page.
 * @returns The canvas's `data-task`, with its `data-focus` or `data-set`.
 */
export default function describeGraphTask(
  layout: ClassGraphLayout,
  term: string | undefined,
): GraphTaskHooks {
  if (term !== undefined) {
    return { "data-task": GRAPH_TASKS.focus, "data-focus": term };
  }
  return {
    "data-task": GRAPH_TASKS.set,
    "data-set":
      layout.drilled ?? layout.regions.map((region) => region.prefix).join(" "),
  };
}
