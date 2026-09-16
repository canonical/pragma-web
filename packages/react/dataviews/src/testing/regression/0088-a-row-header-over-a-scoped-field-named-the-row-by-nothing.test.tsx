/**
 * A column over a field only some record types carry could be the row
 * header. In a row of another type its cell was the not-applicable dash,
 * whose dash is hidden from readers and whose word was then a clipped span
 * the row's `aria-labelledby` does not reach — so the row, and its checkbox
 * through the blank-name fallback, were named by nothing.
 *
 * A row header must apply to every record type, and one that does not fails
 * where the table mounts.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../testing/instances.js";
import silenceRenderErrors from "../../../testing/silenceRenderErrors.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

describe("a row header over a field not every type carries", () => {
  it("fails where the table mounts", () => {
    silenceRenderErrors();
    const { provider } = createInstanceProvider({ rows: MIXED_FLEET });
    expect(() =>
      render(
        <DataTable
          provider={provider}
          columns={[
            { id: "name", header: "Name" },
            { id: "image", header: "Image", rowHeader: true },
          ]}
          label="Instances"
        />,
      ),
    ).toThrow(
      'DataTable column "image" is the row header, but its field "image" does not apply to every record type',
    );
  });
});
