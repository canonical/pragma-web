/**
 * The one column heading each row: found, made unhideable, or refused where
 * two claim it or where the one that does could not name every row.
 */
import { describe, expect, it } from "vitest";
import { instances } from "../../../../../../testing/instances.js";
import { machines } from "../../../../../../testing/machines.js";
import { readFieldScopes } from "../../../../utils/index.js";
import type { DataTableColumn } from "../../types.js";
import readRowHeader from "./readRowHeader.js";

/** The row header over columns, their scopes read as the table reads them. */
const readHeader = (
  columns: readonly DataTableColumn[],
  collection: typeof machines | typeof instances,
): DataTableColumn | null =>
  readRowHeader(
    columns,
    readFieldScopes({ collection, fields: columns, renderer: "DataTable" }),
    collection.types,
  );

describe("readRowHeader", () => {
  it("answers null where no column is the row header", () => {
    expect(
      readHeader(
        [
          { id: "name", header: "Name" },
          { id: "status", header: "Status" },
        ],
        machines,
      ),
    ).toBeNull();
  });

  it("answers the row header, reading as never hideable", () => {
    const header = readHeader(
      [
        { id: "name", header: "Name", rowHeader: true, hideable: true },
        { id: "status", header: "Status" },
      ],
      machines,
    );
    expect(header).toMatchObject({ id: "name", rowHeader: true });
    expect(header?.hideable).toBe(false);
  });

  it("refuses two columns each declared the row header, naming both", () => {
    expect(() =>
      readHeader(
        [
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status", rowHeader: true },
        ],
        machines,
      ),
    ).toThrow(
      'DataTable columns "name" and "status" are each the row header; a row has one',
    );
  });

  it("refuses a row header that would name only some rows", () => {
    // Over a field only containers carry: a machine's row would be named by
    // a dash that is read as nothing.
    expect(() =>
      readHeader(
        [{ id: "image", header: "Image", rowHeader: true }],
        instances,
      ),
    ).toThrow(
      'DataTable column "image" is the row header, but its field "image" does not apply to every record type',
    );
    // Narrowed itself, over a field every type carries.
    expect(() =>
      readHeader(
        [
          {
            id: "name",
            header: "Name",
            rowHeader: true,
            appliesTo: ["container"],
          },
        ],
        instances,
      ),
    ).toThrow(
      'DataTable column "name" is the row header, but its field "name"',
    );
  });

  it("takes a row header scoped to every declared type", () => {
    expect(
      readHeader(
        [
          {
            id: "name",
            header: "Name",
            rowHeader: true,
            appliesTo: ["container", "virtual-machine"],
          },
        ],
        instances,
      ),
    ).toMatchObject({ id: "name" });
  });
});
