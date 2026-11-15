import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "../../../../__fixtures__/componentEntityRecordsButton.js";
import {
  BUTTON_URI,
  ENTITY_TEST_TIMEOUT_MS,
  entityPageAt,
} from "../../../../__fixtures__/entityPageHarness.js";

/** The tokens table's row groups, each as its part and its rows' cells. */
const readGroups = () => {
  const table = within(
    screen.getByRole("region", { name: "Tokens" }),
  ).getByRole("table");
  return [...table.querySelectorAll("tbody")].map((group) => ({
    part: group.querySelector("th[scope=rowgroup]")?.textContent,
    span: group.querySelector("th[scope=rowgroup]")?.getAttribute("rowspan"),
    rows: [...group.querySelectorAll("tr")].map((row) => [
      row.querySelector(".symbol")?.textContent,
      row.querySelector(".order")?.textContent,
    ]),
  }));
};

describe("ComponentTokens", () => {
  it(
    "heads the table's columns Part, Token and Order",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      const section = screen.getByRole("region", { name: "Tokens" });
      expect(
        within(section)
          .getAllByRole("columnheader")
          .map(({ textContent }) => textContent),
      ).toEqual(["Part", "Token", "Order"]);
    },
    ENTITY_TEST_TIMEOUT_MS,
  );

  it(
    "groups Button's bindings by part, each part in fallback order",
    () => {
      render(
        entityPageAt(
          BUTTON_URI,
          componentEntityRecordsButton,
          createFetchSpy(),
        ),
      );
      const groups = readGroups();
      expect(groups.map(({ part }) => part)).toEqual(["$root/icon", "$root"]);
      expect(groups.at(0)).toEqual({
        part: "$root/icon",
        span: "3",
        rows: [
          ["color.icon.disabled", "1"],
          ["modifier.color.icon", "1"],
          ["modifier.color.text", "2"],
        ],
      });
      const ranks = groups.at(1)?.rows.map(([, rank]) => Number(rank)) ?? [];
      expect(ranks).toEqual(ranks.toSorted((a, b) => a - b));
      expect(groups.at(1)?.span).toBe(String(ranks.length));
    },
    ENTITY_TEST_TIMEOUT_MS,
  );
});
