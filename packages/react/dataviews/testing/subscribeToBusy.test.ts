import { describe, expect, it, vi } from "vitest";
import subscribeToBusy from "./subscribeToBusy.js";

/** Resolves once `root`'s next mutations are delivered to every observer. */
const readNextMutations = (root: Node): Promise<void> => {
  const delivered = Promise.withResolvers<void>();
  const sentinel = new MutationObserver(() => {
    sentinel.disconnect();
    delivered.resolve();
  });
  sentinel.observe(root, { subtree: true, attributes: true, childList: true });
  return delivered.promise;
};

describe("subscribeToBusy", () => {
  it("hears a change to aria-busy", async () => {
    const root = document.createElement("div");
    const listener = vi.fn();
    const unsubscribe = subscribeToBusy(root)(listener);
    const delivered = readNextMutations(root);
    root.setAttribute("aria-busy", "true");
    await delivered;
    unsubscribe();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("hears an added node", async () => {
    const root = document.createElement("div");
    const listener = vi.fn();
    const unsubscribe = subscribeToBusy(root)(listener);
    const delivered = readNextMutations(root);
    root.append(document.createElement("p"));
    await delivered;
    unsubscribe();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("hears neither other attributes nor anything once unsubscribed", async () => {
    const root = document.createElement("div");
    const listener = vi.fn();
    const unsubscribe = subscribeToBusy(root)(listener);
    const delivered = readNextMutations(root);
    root.setAttribute("title", "Rows");
    await delivered;
    unsubscribe();
    const later = readNextMutations(root);
    root.setAttribute("aria-busy", "true");
    await later;
    expect(listener).not.toHaveBeenCalled();
  });
});
