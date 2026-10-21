import { describe, expect, it } from "vitest";
import { detectKindInUri } from "./detectKindInUri.js";

describe("detectKindInUri", () => {
  it("reads the kind from the local name's interior segment", () => {
    expect(detectKindInUri("ds:global.component.button")).toBe("component");
    expect(detectKindInUri("ds:global.pattern.card")).toBe("pattern");
  });

  it("returns undefined when no interior segment names a kind", () => {
    expect(detectKindInUri("cs:typescript.imports")).toBeUndefined();
    expect(detectKindInUri("ds:global")).toBeUndefined();
  });

  it("ignores a kind word in the tier or the entity name", () => {
    expect(detectKindInUri("ds:component.global.button")).toBeUndefined();
    expect(detectKindInUri("ds:global.thing.component")).toBeUndefined();
  });

  it("reads a URI without a prefix as all local name", () => {
    expect(detectKindInUri("global.term.density")).toBe("term");
  });
});
