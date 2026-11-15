import type { CoverageGuardResult } from "./types.js";

/**
 * The case `expectSwitchCoverage` renders now: its number, whether its
 * tree passed its maps through `guardTypedArms`, and whether a form was
 * read from the maps `guardTypedArms` returned; `undefined` while no case
 * is rendering.
 */
let current:
  | { readonly id: number; guarded: boolean; read: boolean }
  | undefined;

/** The number of the last case opened, so maps guarded in one case are told from another's. */
let lastId = 0;

/**
 * Open the guard round one case's render: from now until it closes,
 * `guardTypedArms` guards the maps it is handed.
 *
 * @note Impure: sets the module's guard state.
 */
export function openCoverageGuard(): void {
  lastId += 1;
  current = { id: lastId, guarded: false, read: false };
}

/**
 * Close the guard opened round a case's render.
 *
 * @returns Whether the case's tree passed its maps through `guardTypedArms`
 *   and whether the switch read a form from the maps it returned.
 * @note Impure: clears the module's guard state.
 */
export function closeCoverageGuard(): CoverageGuardResult {
  const result = {
    guarded: current?.guarded === true,
    read: current?.read === true,
  };
  current = undefined;
  return result;
}

/**
 * Record that a tree passed its maps through `guardTypedArms`.
 *
 * @returns The number of the case rendering, so the maps are to be
 *   guarded, or `undefined` when no case is rendering.
 * @note Impure: sets the module's guard state.
 */
export function markGuarded(): number | undefined {
  if (current === undefined) return undefined;
  current.guarded = true;
  return current.id;
}

/**
 * Record that a form was read from the maps `guardTypedArms` returned in
 * the case numbered `id`: the provider received them.
 *
 * @note Impure: sets the module's guard state.
 */
export function markRead(id: number): void {
  if (current?.id === id) current.read = true;
}
