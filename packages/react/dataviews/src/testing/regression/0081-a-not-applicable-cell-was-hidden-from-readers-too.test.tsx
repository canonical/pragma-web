/**
 * The word beside a not-applicable cell's dash, and the record types a
 * scoped column's heading names, were rendered as `hidden` elements. A hidden
 * element leaves the accessibility tree, so a reader met the same silence at
 * a not-applicable cell as at an empty one — the very distinction the unit
 * draws — and never heard which records a column applies to. The tests read
 * the DOM's text, which hidden nodes still have, and passed.
 *
 * The word is clipped rather than hidden, so the cell is named by it; the
 * heading's scope is clipped and referenced as the heading's description,
 * which is what a reader on the heading, or on its sort control, reaches.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const columns = [
  { id: "name", header: "Name" },
  { id: "image", header: "Image", sortable: true },
];

describe("a not-applicable cell, read", () => {
  it("names the cell by the word, and describes the heading by the types", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <DataTable provider={provider} columns={columns} label="Instances" />,
    );
    const machine = screen.getByRole("row", { name: /db-01/ });
    const image = within(machine).getAllByRole("cell").at(1);
    expect(image).toHaveAccessibleName("Not applicable");
    expect(image?.querySelector(".not-applicable")).not.toHaveAttribute(
      "hidden",
    );
    const heading = screen.getByRole("columnheader", { name: "Image" });
    expect(heading).toHaveAccessibleDescription("Applies to container");
    // The sort control carries the same description, so a reader on it
    // hears the scope too.
    expect(within(heading).getByRole("button", { name: "Image" })) //
      .toHaveAccessibleDescription("Applies to container");
  });

  it("keeps the word in the tree on a card", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <Cards
        provider={provider}
        fields={columns}
        title="name"
        label="Instances"
      />,
    );
    const card = screen.getByRole("listitem", { name: "db-01" });
    expect(within(card).getByText("Not applicable")).not.toHaveAttribute(
      "hidden",
    );
  });
});
