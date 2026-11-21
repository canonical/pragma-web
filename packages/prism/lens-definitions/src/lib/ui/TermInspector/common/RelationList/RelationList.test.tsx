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

  it("ends a counted relation with its statements, a link to the property where there are any", () => {
    render(
      createRouterHarness(
        <RelationList
          direction="outgoing"
          namespaces={NAMESPACES}
          relations={[
            {
              predicate: {
                uri: "https://ds.canonical.com/category",
                label: "category",
              },
              other: {
                uri: "https://ds.canonical.com/TagCategory",
                label: "Tag Category",
              },
              count: 726,
            },
            {
              predicate: {
                uri: "https://ds.canonical.com/viaTag",
                label: null,
              },
              other: null,
              count: 0,
            },
          ]}
        />,
      ),
    );
    const [first, second] = screen.getAllByRole("listitem");
    expect(first?.textContent).toBe("category→Tag Category726");
    expect(
      within(first as HTMLElement).getByRole("link", {
        name: "726 statements of category: open the property",
      }),
    ).toHaveAttribute("href", "/definitions/ds%3Acategory");
    expect(second?.querySelector(".count")?.textContent).toBe("0");
    expect(second?.querySelector(".count a")).toBeNull();
  });

  it("names an unlabelled property's count link by its short term", () => {
    render(
      createRouterHarness(
        <RelationList
          direction="outgoing"
          namespaces={NAMESPACES}
          relations={[
            {
              predicate: {
                uri: "https://ds.canonical.com/viaTag",
                label: null,
              },
              other: null,
              count: 3,
            },
          ]}
        />,
      ),
    );
    expect(
      screen.getByRole("link", {
        name: "3 statements of ds:viaTag: open the property",
      }),
    ).toHaveAttribute("href", "/definitions/ds%3AviaTag");
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
