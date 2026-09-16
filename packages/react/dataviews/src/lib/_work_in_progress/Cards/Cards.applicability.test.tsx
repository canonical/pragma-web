/**
 * Cards over a collection whose records come in several types draw a field
 * that does not apply to a record's type as the table does: a dash hidden
 * from readers beside the word for the state, which a reader reaches.
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../../testing/instances.js";
import Cards from "./Cards.js";

const fields = [
  { id: "name", header: "Name" },
  { id: "type", header: "Type" },
  { id: "image", header: "Image" },
];

describe("cards over records of several types", () => {
  it("draws a field the record's type does not carry as not applicable", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <Cards
        provider={provider}
        fields={fields}
        title="name"
        label="Instances"
      />,
    );
    const vm = screen.getByRole("listitem", { name: "db-01" });
    const image = within(vm).getAllByRole("definition").at(1);
    expect(image).toHaveTextContent(/^—Not applicable$/);
    // A definition takes no name from its content; what a reader reaches is
    // the word itself, so it is clipped and never hidden.
    expect(
      image?.querySelector(".data-views-not-applicable"),
    ).not.toHaveAttribute("hidden");
    expect(image?.querySelector("[aria-hidden='true']")).toHaveTextContent("—");
    // The dash alone is hidden from readers: the word has no hidden ancestor.
    expect(image?.querySelectorAll("[aria-hidden]")).toHaveLength(1);
    expect(
      within(vm).getByText("Not applicable").closest("[aria-hidden], [hidden]"),
    ).toBeNull();
    expect(
      within(screen.getByRole("listitem", { name: "web-01" }))
        .getAllByRole("definition")
        .at(1),
    ).toHaveTextContent(/^ubuntu:24\.04$/);
  });
});
