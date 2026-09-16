/**
 * A typed column's id defaults to its field. Two columns over one field with
 * no id of their own were both named for the field, and nothing refused
 * them: they shared a React key, a layout track and a scope, and the table
 * drew one where two were declared.
 *
 * The factory refuses the second, and says which name they share.
 */
import { describe, expect, it } from "vitest";
import { instances } from "../../../testing/instances.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";

describe("two columns named alike", () => {
  it("are refused where the columns are declared", () => {
    expect(() =>
      createColumns(instances, [
        { field: "name", header: "Name" },
        { field: "name", header: "Also the name" },
      ]),
    ).toThrow('two columns are named "name"; give the second an id of its own');
    expect(() =>
      createColumns(instances, [
        { field: "name", header: "Name" },
        { id: "status", field: "name", header: "Also the name" },
        { field: "status", header: "Status" },
      ]),
    ).toThrow('two columns are named "status"');
    expect(
      createColumns(instances, [
        { field: "name", header: "Name" },
        { id: "name-again", field: "name", header: "Also the name" },
      ]).map((column) => column.id),
    ).toEqual(["name", "name-again"]);
  });
});
