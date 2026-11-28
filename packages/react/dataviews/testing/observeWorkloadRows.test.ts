import { describe, expect, it } from "vitest";
import elementAt from "./elementAt.js";
import { WORKLOAD_RECORDS } from "./fixtures.js";
import observeWorkloadRows from "./observeWorkloadRows.js";

describe("observeWorkloadRows", () => {
  it("reads each workload's fields and whether they apply", () => {
    const { scopes, readApplicability } = observeWorkloadRows();
    expect(scopes.readRow("w-1").fields["image"]?.get()).toBe("ubuntu/24.04");
    expect(scopes.readRow("w-2").fields["cores"]?.get()).toBe(4);
    expect(readApplicability("image", elementAt(WORKLOAD_RECORDS, 1))).toBe(
      "not-applicable",
    );
  });

  it("reads the rows that replace them", () => {
    const db = elementAt(WORKLOAD_RECORDS, 1);
    const { scopes, replace } = observeWorkloadRows([db]);
    replace([{ ...db, type: "vm", cores: 8 }]);
    expect(scopes.readRow("w-2").fields["cores"]?.get()).toBe(8);
  });
});
