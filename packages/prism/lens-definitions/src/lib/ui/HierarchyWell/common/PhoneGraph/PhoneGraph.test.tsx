import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../../../testing/createClassGraphSetup.js";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import { requireEntry } from "../../../../classGraph/require.js";
import PhoneGraph from "./PhoneGraph.js";
import type { PhoneGraphProps } from "./types.js";

const { layout, terms, uris } = createClassGraphSetup();

/** Mount the phone view under the lens's router. */
function renderPhone(props: Partial<PhoneGraphProps> = {}): HTMLElement {
  render(
    createRouterHarness(
      <PhoneGraph
        dimmed={new Set()}
        hidden={new Set()}
        layout={layout}
        terms={terms}
        {...props}
      />,
    ),
  );
  return screen.getByRole("group", { name: "Class graph, in rail order" });
}

describe("PhoneGraph", () => {
  it("draws a row per class in rail order, each a link to its term", () => {
    const phone = renderPhone();
    const rows = [...phone.querySelectorAll(".row")].map((row) =>
      row.getAttribute("data-id"),
    );
    expect(rows).toEqual(layout.rail.map((uri) => requireEntry(terms, uri)));
    expect(
      phone.querySelector('.row[data-id="ds:Component"] a'),
    ).toHaveAttribute("href", "/definitions/ds%3AComponent");
  });

  it("heads each namespace with its count, and draws its guides and arcs", () => {
    const phone = renderPhone();
    const headers = [...phone.querySelectorAll(".header")].map(
      (header) => header.textContent,
    );
    expect(headers).toEqual(
      layout.phone.headers.map(
        (header) => `${header.prefix.toUpperCase()}${header.count} classes`,
      ),
    );
    expect(phone.querySelectorAll(".guide")).toHaveLength(
      layout.phone.guides.length,
    );
    expect(phone.querySelectorAll(".edge")).toHaveLength(
      layout.phone.edges.length,
    );
    expect(phone.getAttribute("viewBox")).toBe(
      `0 0 ${layout.phone.width} ${layout.phone.height}`,
    );
  });

  it("hides and dims as the filter does", () => {
    const phone = renderPhone({
      hidden: new Set([requireEntry(uris, "ds:Tag")]),
      dimmed: new Set([requireEntry(uris, "ds:Component")]),
    });
    expect(phone.querySelector('[data-id="ds:Tag"]')).toHaveClass(
      "row is-hidden",
    );
    expect(phone.querySelector('[data-id="ds:Component"]')).toHaveClass(
      "row is-dimmed",
    );
  });

  it("hides the arcs that end at a hidden class, and a guide with its parent or all its children", () => {
    const tag = requireEntry(uris, "ds:Tag");
    const uiBlock = requireEntry(uris, "ds:UIBlock");
    const phone = renderPhone({ hidden: new Set([tag, uiBlock]) });
    const arcs = layout.phone.edges.filter(
      (edge) => edge.from === tag || edge.to.includes(tag),
    );
    expect(arcs.length).toBeGreaterThan(0);
    for (const edge of layout.phone.edges) {
      const ends = [edge.from, ...edge.to];
      expect(phone.querySelector(`.edge[data-edge="${edge.id}"]`)).toHaveClass(
        ends.includes(tag) || ends.includes(uiBlock)
          ? "edge is-hidden"
          : "edge",
        { exact: true },
      );
    }
    expect(phone.querySelector('.guide[data-from="ds:UIBlock"]')).toHaveClass(
      "guide is-hidden",
      { exact: true },
    );
    expect(phone.querySelector('.guide[data-from="ds:Entity"]')).toHaveClass(
      "guide",
      { exact: true },
    );
    cleanup();
    const children = [...requireEntry(layout.model.children, uiBlock)];
    const orphaned = renderPhone({ hidden: new Set(children) });
    expect(
      orphaned.querySelector('.guide[data-from="ds:UIBlock"]'),
    ).toHaveClass("guide is-hidden", { exact: true });
  });

  it("merges a class name and passes native props to its root", () => {
    const phone = renderPhone({ className: "phone", id: "rows" });
    expect(phone.getAttribute("class")).toBe("ds phone-graph phone");
    expect(phone.id).toBe("rows");
  });
});
