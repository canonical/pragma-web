/** The walk's hook types. */
import type { Dispatch } from "react";
import type { WalkAction, WalkState } from "../types.js";

/** Where the walk stands, and how it moves. */
export type UseWalkResult = {
  readonly walk: WalkState;
  readonly dispatch: Dispatch<WalkAction>;
};
