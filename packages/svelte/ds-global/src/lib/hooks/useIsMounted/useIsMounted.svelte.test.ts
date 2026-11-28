import { flushSync } from "svelte";
import { describe, expect, it } from "vitest";
import { useIsMounted } from "./index.js";

describe("useIsMounted", () => {
  it("is false until the mount effect runs, then true", () => {
    let mounted!: ReturnType<typeof useIsMounted>;
    const destroy = $effect.root(() => {
      mounted = useIsMounted();
    });
    expect(mounted.current).toBe(false);
    flushSync();
    expect(mounted.current).toBe(true);
    destroy();
  });
});
