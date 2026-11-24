/**
 * Regression: two columns over one field, neither given an id, shared the
 * field's name as their id, and so a key, a track and a scope. The second
 * is refused, and named, until it is given an id of its own.
 */

import { describe, expect, it } from "vitest";
import { machines } from "../../../testing/index.js";
import { createColumns } from "../../lib/index.js";

describe("regression 0133 — two columns over one field shared a name", () => {
  it("refuses the second, and takes it once it has an id of its own", () => {
    expect(() =>
      createColumns({
        collection: machines,
        columns: [
          { field: "cores", header: "Cores" },
          { field: "cores", header: "Threads" },
        ],
      }),
    ).toThrow('createColumns names two columns "cores"');
    expect(
      createColumns({
        collection: machines,
        columns: [
          { field: "cores", header: "Cores" },
          { field: "cores", id: "threads", header: "Threads" },
        ],
      }).map(({ id }) => id),
    ).toEqual(["cores", "threads"]);
  });
});
