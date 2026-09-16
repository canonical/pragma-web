/**
 * A column narrowing its field's scope named the types it applies to, and
 * each name was checked against the collection's; a name given twice passed
 * twice, and the heading read "Applies to container and container".
 *
 * A type named twice is refused where the table mounts, as a name no type
 * carries is.
 */
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import { createInstanceProvider } from "../../../testing/instances.js";
import readColumnScopes from "../../lib/_work_in_progress/DataTable/common/ScopedDataTable/readColumnScopes.js";

describe("a column naming a record type twice", () => {
  it("is refused", () => {
    const { provider } = createInstanceProvider();
    const host = readProviderHost(provider);
    expect(() =>
      readColumnScopes({
        collection: provider.collection,
        applicability: (field, record) => host.applicability(field, record),
        typeOf: (record) => host.typeOf(record),
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
