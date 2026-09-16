/**
 * A row header must name every row, so one over a field scoped to fewer
 * types than the collection declares is refused. Any scope at all was
 * refused, one naming every declared type included, with an error saying the
 * field did not apply to every record type — which was false.
 *
 * A scope leaving no declared type out is taken.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("a row header narrowed to every declared type", () => {
  it("heads each row", () => {
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    render(
      <DataTable
        provider={provider}
        columns={[
          {
            id: "name",
            header: "Name",
            rowHeader: true,
            appliesTo: ["container", "virtual-machine"],
          },
        ]}
        label="Instances"
      />,
    );
    expect(screen.getAllByRole("rowheader")).toHaveLength(4);
  });
});
