import { describe, expect, it } from "vitest";
import declare from "../../../testing/declare.js";
import { DEFAULT_WINDOW } from "../query/index.js";
import listWindowRefusals from "./listWindowRefusals.js";

describe("listWindowRefusals", () => {
  it("refuses nothing in the default window", () => {
    expect(listWindowRefusals(declare({}), DEFAULT_WINDOW)).toEqual([]);
  });

  it("refuses collapsed groups and a token on an offset source", () => {
    expect(
      listWindowRefusals(declare({ pagination: { kind: "offset" } }), {
        ...DEFAULT_WINDOW,
        collapsed: [["failed"]],
        cursor: "c1",
      }).map(({ code }) => code),
    ).toEqual(["unsupported-collapse", "unreachable-page"]);
  });

  it("leaves a token alone on a source paging by token", () => {
    expect(
      listWindowRefusals(
        declare({
          pagination: { kind: "cursor", backward: false, durable: true },
        }),
        {
          ...DEFAULT_WINDOW,
          cursor: "c1",
        },
      ),
    ).toEqual([]);
  });
});
