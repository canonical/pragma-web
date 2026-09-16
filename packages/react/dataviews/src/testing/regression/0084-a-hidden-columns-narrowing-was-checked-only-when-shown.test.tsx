/**
 * A column's narrowing of its field's scope is checked where the table
 * mounts, so a name no type carries fails there rather than drawing every
 * cell not applicable. The check ran over the columns the arrangement
 * showed: a column hidden by the stored arrangement was not checked until
 * the reader chose to show it, and the table failed then, from a render the
 * settings menu began.
 *
 * Every declared column is checked, shown or not.
 */
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import silenceRenderErrors from "../../../testing/silenceRenderErrors.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("a hidden column's narrowing", () => {
  it("fails where the table mounts, not where the column is shown", () => {
    silenceRenderErrors();
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    provider.presentation.arrange({ "table.hidden": ["image"] });
    expect(() =>
      render(
        <DataTable
          provider={provider}
          columns={[
            { id: "name", header: "Name" },
            { id: "image", header: "Image", appliesTo: ["virtual-machine"] },
          ]}
          label="Instances"
        />,
      ),
    ).toThrow(
      'column "image" applies to "virtual-machine", which its field "image" does not',
    );
  });
});
