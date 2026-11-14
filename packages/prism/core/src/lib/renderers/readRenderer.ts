import type { Renderer } from "./types.js";

/**
 * The renderer an address selects: the offered one its `as` value names,
 * else the first offered, so a stale or mistyped address still renders.
 *
 * @param value - The `as` parameter's value, or `null` when absent.
 * @param offered - The renderers the view offers, the default first.
 * @returns The active renderer.
 * @throws When the view offers no renderer: a view always has one.
 */
export default function readRenderer<TProps>(
  value: unknown,
  offered: readonly Renderer<TProps>[],
): Renderer<TProps> {
  const first = offered.at(0);
  if (first === undefined) {
    throw new Error("readRenderer: the view offers no renderer");
  }
  return offered.find(({ name }) => name === value) ?? first;
}
