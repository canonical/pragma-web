// Markup parity with @canonical/react-ds-app SideNavigation. The React
// markup is captured by scripts/captureReactGolden.tsx; the rewrites below
// are the documented differences from React (SPEC.md, "Differences from
// React"), applied to the React markup before the comparison. Both packages
// follow the anatomy, so the only rewrites left are the two Svelte gaps: no
// Tooltip and no script-positioned menu.

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import { goldenCases } from "../../../testing/fixtures.goldenCases.js";
import { reactGolden } from "../../../testing/fixtures.reactGolden.js";
import toSvelteProps from "../../../testing/toSvelteProps.js";
import Component from "./SideNavigation.svelte";

const ID_ATTRIBUTES = [
  "id",
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
];

/** Serialises a tree with sorted attributes and generated ids replaced in order of appearance. */
function normalise(root: Element): string {
  const tokens = new Map<string, string>();
  const token = (value: string) => {
    if (!tokens.has(value)) tokens.set(value, `id${tokens.size}`);
    return tokens.get(value) as string;
  };
  const serialise = (node: Node): string => {
    if (node.nodeType === 3) {
      const text = node.textContent ?? "";
      return text.trim() === "" ? "" : text;
    }
    if (node.nodeType !== 1) return "";
    const element = node as Element;
    const attributes = [...element.attributes]
      .map(({ name, value }) => {
        if (ID_ATTRIBUTES.includes(name) && value !== "nav") {
          return [
            name,
            token(value.replace(/-trigger$/, "")) +
              (value.endsWith("-trigger") ? "-trigger" : ""),
          ];
        }
        if (name === "style") {
          return [
            name,
            value.replace(/--sidenav-expandable-\w+/, (anchor) =>
              token(anchor),
            ),
          ];
        }
        return [name, value];
      })
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([name, value]) => ` ${name}="${value}"`)
      .join("");
    const tag = element.tagName.toLowerCase();
    return `<${tag}${attributes}>${[...element.childNodes].map(serialise).join("")}</${tag}>`;
  };
  return serialise(root);
}

/** The documented differences from React, applied to React's markup. */
function applyDifferences(root: Element, props: Record<string, unknown>) {
  const document = root.ownerDocument;
  // The menu surface has no script positioning: only its max-width is set.
  for (const surface of root.querySelectorAll(".contextual-menu__surface")) {
    const style = surface.getAttribute("style") ?? "";
    surface.setAttribute(
      "style",
      style.replace(/;top:0;left:0;margin-top:0px$/, ""),
    );
  }
  // No Tooltip: a hidden element carries the tooltip's text as the
  // collapse toggle's description.
  const target = root.querySelector(".tooltip-area > .target");
  if (target) {
    const description = document.createElement("span");
    description.id = target.getAttribute("aria-describedby") ?? "";
    description.hidden = true;
    const expanded = root.getAttribute("data-expanded") === "true";
    description.textContent = expanded ? "Collapse" : "Expand";
    target.after(description);
  }
  void props;
}

describe("SideNavigation markup parity with React", () => {
  for (const [name, { props }] of Object.entries(goldenCases)) {
    it(`matches React's markup: ${name}`, () => {
      const page = render(Component, { props: toSvelteProps(props) });
      const svelteRoot = page.container.firstElementChild as Element;

      const template = page.document.createElement("template");
      template.innerHTML = reactGolden[name];
      const reactRoot = template.content.firstElementChild as Element;
      applyDifferences(reactRoot, props);

      expect(normalise(svelteRoot)).toBe(normalise(reactRoot));
    });
  }
});
