/**
 * A field may narrow its schema field's scope to fewer record types, and a
 * table drew a record of any other type as not applicable. Columns declared
 * once are handed to the cards too, but the cards asked only the schema
 * field's scope: the same declaration drew a value on a card where the table
 * drew a dash, and a narrowing naming no declared type failed in the table
 * alone.
 *
 * A field's narrowing lives on the field every renderer shows, and the cards
 * read it as the table does.
 */
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import silenceRenderErrors from "../../../testing/silenceRenderErrors.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

describe("a card field narrowed to fewer types", () => {
  it("draws a record of another type as not applicable", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <Cards
        provider={provider}
        fields={[
          { id: "name", header: "Name" },
          {
            id: "vm-status",
            field: "status",
            header: "VM status",
            appliesTo: ["virtual-machine"],
          },
        ]}
        title="name"
        label="Instances"
      />,
    );
    const field = (name: string) =>
      within(screen.getByRole("listitem", { name }))
        .getAllByRole("definition")
        .at(0);
    expect(field("web-01")).toHaveTextContent(/^—Not applicable$/);
    expect(field("db-01")).toHaveTextContent(/^stopped$/);
  });

  it("fails where the cards mount for a type the collection does not declare", () => {
    silenceRenderErrors();
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    expect(() =>
      render(
        <Cards
          provider={provider}
          fields={[
            { id: "name", header: "Name" },
            { id: "status", header: "Status", appliesTo: ["sandbox"] },
          ]}
          title="name"
          label="Instances"
        />,
      ),
    ).toThrow(
      'column "status" applies to "sandbox", which is not a type of "type"',
    );
  });
});
