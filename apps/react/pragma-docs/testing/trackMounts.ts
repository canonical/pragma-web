import { type ComponentType, createElement, useEffect } from "react";
import type { MountCount } from "./types.js";

/**
 * Wrap a component so every mount and unmount of it is counted, while it
 * renders exactly as before.
 *
 * A remount anywhere above the wrapper (a changed `key`, a moved provider)
 * unmounts it and mounts it afresh, so the count tells a test whether the
 * real component kept its place in the tree, which React's `Profiler`
 * cannot: it reports a `mount` only when the Profiler itself mounts.
 *
 * @note Impure: the returned component mutates `count` from its effect.
 *
 * @param Component - The component to track.
 * @param count - The tally the wrapper adds its mounts and unmounts to.
 * @returns A component taking `Component`'s props and rendering it.
 */
export default function trackMounts<TProps extends object>(
  Component: ComponentType<TProps>,
  count: MountCount,
): ComponentType<TProps> {
  const Tracked = (props: TProps) => {
    useEffect(() => {
      count.mounts += 1;
      return () => {
        count.unmounts += 1;
      };
    }, []);
    return createElement(Component, props);
  };
  Tracked.displayName = `Tracked(${Component.displayName ?? Component.name})`;
  return Tracked;
}
