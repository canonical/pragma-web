/**
 * The one column heading each row: found, made unhideable, or refused where
 * two claim it.
 */
import { describe, expect, it } from "vitest";
import readRowHeader from "./readRowHeader.js";

describe("readRowHeader", () => {
  it("answers null where no column is the row header", () => {
    expect(
      readRowHeader([
        { id: "name", header: "Name" },
        { id: "status", header: "Status" },
      ]),
    ).toBeNull();
  });

  it("answers the row header, reading as never hideable", () => {
    const header = readRowHeader([
      { id: "name", header: "Name", rowHeader: true, hideable: true },
      { id: "status", header: "Status" },
    ]);
    expect(header).toMatchObject({ id: "name", rowHeader: true });
    expect(header?.hideable).toBe(false);
  });

  it("refuses two columns each declared the row header, naming both", () => {
    expect(() =>
      readRowHeader([
        { id: "name", header: "Name", rowHeader: true },
        { id: "status", header: "Status", rowHeader: true },
      ]),
    ).toThrow(
      'columns "name" and "status" are each the row header; a row has one',
    );
  });
});
