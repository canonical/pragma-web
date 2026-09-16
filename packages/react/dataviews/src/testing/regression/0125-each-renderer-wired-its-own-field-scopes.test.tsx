/**
 * The table and the cards each held their fields' scopes by the same steps
 * spelled twice — hold the fields by what a scope reads, read the scopes
 * naming the renderer by a phrase of its own, and hold one applicability
 * callback — so a fix to one renderer's wiring had to be found and made in
 * the other.
 *
 * One hook holds the steps, and a renderer names itself: the refusal names
 * a table's column and a card's field from the renderer alone.
 */

import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const narrowed = [
  { id: "name", header: "Name" },
  { id: "image", header: "Image", appliesTo: ["appliance"] },
];

describe("a field narrowed to a type the collection does not declare", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is refused by each renderer in the renderer's own words", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    expect(() =>
      render(
        <DataTable provider={provider} columns={narrowed} label="Instances" />,
      ),
    ).toThrow(
      'DataTable column "image" applies to "appliance", which is not a type of "type"',
    );
    expect(() =>
      render(
        <Cards
          provider={provider}
          fields={narrowed}
          title="name"
          label="Instances"
        />,
      ),
    ).toThrow(
      'Cards field "image" applies to "appliance", which is not a type of "type"',
    );
  });
});
