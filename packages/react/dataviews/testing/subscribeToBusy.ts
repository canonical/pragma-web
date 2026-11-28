/**
 * The subscribe function over what `root` marks busy and the nodes added
 * or removed under it.
 *
 * @note Impure: observes `root`'s mutations until unsubscribed.
 */
export default function subscribeToBusy(
  root: Node,
): (listener: () => void) => () => void {
  return (listener) => {
    const observer = new MutationObserver(listener);
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributeFilter: ["aria-busy"],
    });
    return () => {
      observer.disconnect();
    };
  };
}
