/**
 * The topology task each Definitions canvas serves (heuristic 5.1), as its
 * `data-task` states it: the overview and an opened view draw the shape of
 * a set of namespaces' relations, a term page a class's neighbourhood.
 */
export const GRAPH_TASKS = {
  set: "shape",
  focus: "neighbourhood",
} as const;
