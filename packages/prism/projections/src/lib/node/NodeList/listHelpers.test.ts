import { describe, expect, it } from "vitest";
import findListedType from "./findListedType.js";
import orderByValue from "./orderByValue.js";
import readListSort from "./readListSort.js";
import writeNextSort from "./writeNextSort.js";

const STATION = "https://metro.example/onto#Station";
const INTERCHANGE = "https://metro.example/onto#Interchange";
const LINE = "https://metro.example/onto#Line";

/** A node of `uri`'s type, under `superclasses`. */
const typed = (uri: string, superclasses: readonly string[] = []) => ({
  _meta: { type: { uri, superclasses: superclasses.map((s) => ({ uri: s })) } },
});

/** A node showing `text` for the zone field. */
const zoned = (name: string, text: string | null) => ({
  name,
  values: [{ field: "inZone", label: "Zone", text }],
});

describe("findListedType", () => {
  it("lists stations and interchanges as stations", () => {
    expect(
      findListedType([typed(INTERCHANGE, [STATION]), typed(STATION)]),
    ).toBe(STATION);
  });

  it("finds no listed type in a mixed list or an empty one", () => {
    expect(findListedType([typed(STATION), typed(LINE)])).toBeNull();
    expect(findListedType([])).toBeNull();
  });

  it("reads a type without superclasses as its own lineage", () => {
    expect(
      findListedType([{ _meta: { type: { uri: LINE, superclasses: null } } }]),
    ).toBe(LINE);
  });
});

describe("readListSort", () => {
  it("reads a field ascending, and descending behind a minus", () => {
    expect(readListSort("inZone")).toEqual({
      field: "inZone",
      descending: false,
    });
    expect(readListSort("-inZone")).toEqual({
      field: "inZone",
      descending: true,
    });
  });

  it("reads no order from no value or a bare minus", () => {
    expect(readListSort(undefined)).toBeNull();
    expect(readListSort("-")).toBeNull();
  });
});

describe("writeNextSort", () => {
  it("sorts a field ascending first, then descending", () => {
    expect(writeNextSort("inZone", null)).toBe("inZone");
    expect(
      writeNextSort("inZone", { field: "inZone", descending: false }),
    ).toBe("-inZone");
    expect(writeNextSort("inZone", { field: "inZone", descending: true })).toBe(
      "inZone",
    );
    expect(writeNextSort("inZone", { field: "name", descending: false })).toBe(
      "inZone",
    );
  });
});

describe("orderByValue", () => {
  const nodes = [zoned("a", "Zone 2"), zoned("b", null), zoned("c", "Zone 1")];

  it("keeps the order without a sort", () => {
    expect(orderByValue(nodes, null)).toBe(nodes);
  });

  it("orders by the field's text, the nodes without one last", () => {
    expect(
      orderByValue(nodes, { field: "inZone", descending: false }).map(
        ({ name }) => name,
      ),
    ).toEqual(["c", "a", "b"]);
    expect(
      orderByValue(nodes, { field: "inZone", descending: true }).map(
        ({ name }) => name,
      ),
    ).toEqual(["a", "c", "b"]);
  });

  it("keeps tied nodes in their order", () => {
    const tied = [
      zoned("a", "Zone 1"),
      zoned("b", "Zone 1"),
      zoned("c", null),
      zoned("d", null),
    ];
    expect(
      orderByValue(tied, { field: "inZone", descending: true }).map(
        ({ name }) => name,
      ),
    ).toEqual(["a", "b", "c", "d"]);
  });

  it("reads a node without values as showing nothing", () => {
    expect(
      orderByValue([{ values: null }, zoned("a", "Zone 1")], {
        field: "inZone",
        descending: false,
      }).length,
    ).toBe(2);
  });
});
