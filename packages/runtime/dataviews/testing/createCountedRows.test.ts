import { describe, expect, it } from "vitest";
import createCountedRows from "./createCountedRows.js";

describe("createCountedRows", () => {
  it("builds machines whose statuses alternate", () => {
    const { rows } = createCountedRows(2, "status");
    expect(rows).toEqual([
      { id: "m0", cpu: 0, name: "web-0", status: "failed" },
      { id: "m1", cpu: 1, name: "web-1", status: "ready" },
    ]);
  });

  it("counts each read of the counted field and no other", () => {
    const { rows, readCount } = createCountedRows(1, "name");
    const [row] = rows;
    expect(readCount()).toBe(0);
    expect(row?.["name"]).toBe("web-0");
    expect(row?.["status"]).toBe("failed");
    expect(readCount()).toBe(1);
  });
});
