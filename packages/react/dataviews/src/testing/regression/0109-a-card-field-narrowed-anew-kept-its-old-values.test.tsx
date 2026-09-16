/**
 * Cards held their fields while ids, headings and content stayed the same,
 * and passed every card handlers of one identity. A field narrowed to other
 * record types, its id and heading kept, left every card drawing the old
 * values and dashes: nothing any card was handed had moved.
 *
 * The cards hold their fields by the types each applies to as well.
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";

describe("a card field narrowed to other types with its id kept", () => {
  it("is drawn narrowed", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    const cards = (appliesTo?: readonly string[]) => (
      <Cards
        provider={provider}
        fields={[
          { id: "name", header: "Name" },
          {
            id: "status",
            header: "Status",
            ...(appliesTo === undefined ? {} : { appliesTo }),
          },
        ]}
        title="name"
        label="Instances"
      />
    );
    const view = render(cards());
    const status = () =>
      within(screen.getByRole("listitem", { name: "web-01" }))
        .getAllByRole("definition")
        .at(0);
    expect(status()).toHaveTextContent(/^running$/);
    view.rerender(cards(["virtual-machine"]));
    expect(status()).toHaveTextContent(/^—Not applicable$/);
  });
});
