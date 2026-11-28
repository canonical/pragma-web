/**
 * Reports whether the component has mounted on the client.
 *
 * `current` is `false` during server rendering and the initial client render,
 * then `true` after the mount effect runs. Gate client-only output (portals in
 * particular) on it, so the server-rendered HTML and the first client render
 * are identical and hydration does not mismatch.
 * @returns An object whose `current` is `false` until mounted, then `true`.
 * @note Impure: creates state and an effect; call during component
 * initialisation.
 */
export default function useIsMounted(): { readonly current: boolean } {
  let isMounted = $state(false);

  // Flips the flag once the component is in the document. Tracks nothing, so
  // it runs once, after the first render, and never on the server.
  $effect(() => {
    isMounted = true;
  });

  return {
    get current() {
      return isMounted;
    },
  };
}
