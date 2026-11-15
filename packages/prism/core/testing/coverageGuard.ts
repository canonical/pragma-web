/**
 * Whether the case `expectSwitchCoverage` renders now passed its maps
 * through `guardTypedArms`; `undefined` while no case is rendering.
 */
let guarded: boolean | undefined;

/**
 * Open the guard round one case's render: from now until it closes,
 * `guardTypedArms` guards the maps it is handed.
 *
 * @note Impure: sets the module's guard state.
 */
export function openCoverageGuard(): void {
  guarded = false;
}

/**
 * Close the guard opened round a case's render.
 *
 * @returns Whether the case's tree passed its maps through `guardTypedArms`.
 * @note Impure: clears the module's guard state.
 */
export function closeCoverageGuard(): boolean {
  const passed = guarded === true;
  guarded = undefined;
  return passed;
}

/**
 * Record that a tree passed its maps through `guardTypedArms`.
 *
 * @returns Whether a case is rendering, so the maps are to be guarded.
 * @note Impure: sets the module's guard state.
 */
export function markGuarded(): boolean {
  if (guarded === undefined) return false;
  guarded = true;
  return true;
}
