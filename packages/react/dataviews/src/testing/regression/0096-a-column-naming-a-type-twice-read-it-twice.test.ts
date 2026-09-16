/**
 * A column narrowing its field's scope named the types it applies to, and
 * each name was checked against the collection's; a name given twice passed
 * twice, and the heading read "Applies to container and container".
 *
 * A type named twice is refused where the table mounts, as a name no type
 * carries is.
 */
import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import { readColumnScopes } from "../../lib/utils/index.js";

describe("a column naming a record type twice", () => {
  it("is refused", () => {
    expect(() =>
      readColumnScopes({
        collection: instances,
        columns: [
          {
            id: "status",
            header: "Status",
            appliesTo: ["container", "container"],
          },
        ],
      }),
    ).toThrow('column "status" names a record type twice');
  });
});
