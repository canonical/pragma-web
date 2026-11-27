import { afterEach, describe, expect, it } from "vitest";
import findActiveElement from "./findActiveElement.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("findActiveElement", () => {
  it("reads the document's focused element", () => {
    const button = document.createElement("button");
    document.body.append(button);
    button.focus();
    expect(findActiveElement(button)).toBe(button);
  });

  it("finds none for a node in no document", () => {
    expect(findActiveElement(document.createElement("div"))).toBeNull();
  });

  it("reads the focused element inside a shadow root", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = host.attachShadow({ mode: "open" });
    const inner = document.createElement("button");
    root.append(inner);
    inner.focus();
    expect(findActiveElement(inner)).toBe(inner);
    expect(findActiveElement(host)).toBe(host);
  });
});
