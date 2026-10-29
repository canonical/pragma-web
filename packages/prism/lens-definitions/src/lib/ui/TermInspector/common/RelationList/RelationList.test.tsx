import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import RelationList from "./RelationList.js";
import type { RelationEntry } from "./types.js";

const NAMESPACES = [{ prefix: "ds", namespace: "https://ds.canonical.com/" }];

const RELATIONS: readonly RelationEntry[] = [
  {
    predicate: { uri: "https://ds.canonical.com/category", label: "category" },
    other: {
      uri: "https://ds.canonical.com/TagCategory",
      label: "Tag Category",
    },
  },
  {
    predicate: { uri: "https://ds.canonical.com/viaTag", label: null },
    other: null,
  },
];

describe("RelationList", () => {
  it("lists each relation outward, its property and its range as links", () => {
    render(
      createRouterHarness(
        <RelationList
          className="custom-class"
          data-testid="relations"
          direction="outgoing"
          namespaces={NAMESPACES}
          relations={RELATIONS}
        />,
      ),
    );
    const list = screen.getByTestId("relations");
    expect(list.className).toBe("ds relation-list custom-class");
    const [first, second] = within(list).getAllByRole("listitem");
    expect(first?.textContent).toBe("category→Tag Category");
    expect(
      within(first as HTMLElement).getByRole("link", { name: "Tag Category" }),
    ).toHaveAttribute("href", "/definitions/ds%3ATagCategory");
    expect(second?.textContent).toBe("ds:viaTag→unstated");
  });

  it("points the arrow back for incoming relations", () => {
    render(
      createRouterHarness(
        <RelationList
          direction="incoming"
          namespaces={NAMESPACES}
          relations={RELATIONS}
        />,
      ),
    );
    expect(screen.getAllByRole("listitem").at(0)?.textContent).toBe(
      "category←Tag Category",
    );
  });
});
