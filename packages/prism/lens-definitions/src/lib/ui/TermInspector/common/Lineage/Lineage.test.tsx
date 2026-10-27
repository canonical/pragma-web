import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import Lineage from "./Lineage.js";

describe("Lineage", () => {
  it("reads from the class up, each ancestor a link after the subset glyph", () => {
    render(
      createRouterHarness(
        <Lineage
          ancestors={[
            { uri: "https://ds.canonical.com/UIElement", label: "UI Element" },
            { uri: "https://ds.canonical.com/Entity", label: null },
          ]}
          className="custom-class"
          data-testid="lineage"
          namespaces={[
            { prefix: "ds", namespace: "https://ds.canonical.com/" },
          ]}
          self="UI Block"
        />,
      ),
    );
    const lineage = screen.getByTestId("lineage");
    expect(lineage.className).toBe("ds lineage custom-class");
    expect(lineage.textContent).toBe("UI Block ⊂ UI Element ⊂ ds:Entity");
    expect(
      within(lineage)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["UI Element", "ds:Entity"]);
  });
});
