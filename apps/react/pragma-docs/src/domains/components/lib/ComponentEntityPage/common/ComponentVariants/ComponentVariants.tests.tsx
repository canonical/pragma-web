import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  ENTITY_TEST_TIMEOUT_MS,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

/** The variants section's cells, each as its hooks and its caption. */
const readCells = () => {
  const section = screen.getByRole("region", { name: "Variants" });
  return [...section.querySelectorAll(".ds.component-variants > .cell")].map(
    (cell) => ({
      family: cell.getAttribute("data-family"),
      modifier: cell.getAttribute("data-modifier"),
      caption: cell.querySelector("figcaption")?.textContent,
      button: cell.querySelector(".stage > button.ds.button"),
    }),
  );
};

describe("ComponentVariants", () => {
  it(
    "draws a captioned cell for each modifier of the families Button honours, in the graph's order",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      const cells = readCells();
      expect(cells.map(({ caption }) => caption)).toEqual([
        "Anticipation: Caution",
        "Anticipation: Constructive",
        "Anticipation: Destructive",
        "Importance: Primary",
        "Importance: Secondary",
        "Importance: Tertiary",
      ]);
      expect(cells.at(0)).toMatchObject({
        family: "anticipation",
        modifier: "caution",
      });
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "renders the published Button in each cell with that cell's modifier",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      for (const { modifier, button } of readCells()) {
        expect(button).not.toBeNull();
        expect(button).toHaveClass(modifier ?? "");
        expect(button).toHaveAttribute("type", "button");
      }
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "lays the cells as a list with a figure each",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      const list = screen
        .getByRole("region", { name: "Variants" })
        .querySelector(".ds.component-variants");
      expect(list?.tagName).toBe("UL");
      expect(list?.querySelectorAll(":scope > li > figure")).toHaveLength(6);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );
});
