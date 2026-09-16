import { describe, expect, it } from "vitest";
import type { DataTableColumn } from "../../types.js";
import areBodyColumnsEqual from "./areBodyColumnsEqual.js";

const name: DataTableColumn = { id: "name", header: "Name" };
const cell = () => null;

describe("areBodyColumnsEqual", () => {
  it("reads what a row reads, and never the heading", () => {
    expect(areBodyColumnsEqual([name], [{ ...name, header: "Host" }])).toBe(
      true,
    );
    expect(areBodyColumnsEqual([name], [{ ...name, field: "host" }])).toBe(
      false,
    );
    expect(
      areBodyColumnsEqual([name], [{ ...name, appliesTo: ["container"] }]),
    ).toBe(false);
    expect(areBodyColumnsEqual([{ ...name, cell }], [{ ...name, cell }])).toBe(
      true,
    );
    expect(
      areBodyColumnsEqual([{ ...name, cell }], [{ ...name, cell: () => null }]),
    ).toBe(false);
    expect(areBodyColumnsEqual([name], [{ ...name, rowHeader: true }])).toBe(
      false,
    );
  });
});
