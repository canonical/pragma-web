import { describe, expect, it } from "vitest";
import { BUTTON_ANATOMY_DSL } from "../../../../../../../testing/anatomyTexts.js";
import readAnatomy from "./readAnatomy.js";

/** A field's anatomy over a switch whose cases are the given YAML lines. */
const fieldOverSwitch = (cases: string): string =>
  [
    "node:",
    "  uri: global.component.field",
    "  edges:",
    "    - switch:",
    "        on: props",
    "        cases:",
    cases,
    "      relation:",
    '        cardinality: "1"',
    "        slotName: input",
  ].join("\n");

describe("readAnatomy", () => {
  it("reads a valid anatomy text", () => {
    expect(readAnatomy(BUTTON_ANATOMY_DSL)?.root.uri).toBe(
      "global.component.button",
    );
  });

  it("reads text the parser refuses as no anatomy", () => {
    expect(readAnatomy("node: [this is not an anatomy")).toBeUndefined();
    expect(readAnatomy("just: words")).toBeUndefined();
  });

  it("reads an absent or blank text as no anatomy", () => {
    expect(readAnatomy(null)).toBeUndefined();
    expect(readAnatomy(undefined)).toBeUndefined();
    expect(readAnatomy("  ")).toBeUndefined();
  });

  it("reads a switch of well-formed cases as an anatomy", () => {
    const anatomy = readAnatomy(
      fieldOverSwitch(
        [
          "          - uri: global.component.checkbox",
          "          - node:",
          "              role: free text",
        ].join("\n"),
      ),
    );
    expect(anatomy?.root.uri).toBe("global.component.field");
    expect(anatomy?.root.edges).toHaveLength(1);
  });

  it("reads a switch with a case that has no URI and no role as no anatomy", () => {
    expect(
      readAnatomy(
        fieldOverSwitch(
          [
            "          - uri: global.component.checkbox",
            "          - node:",
            "              styles:",
            "                layout.type: block",
          ].join("\n"),
        ),
      ),
    ).toBeUndefined();
  });

  it("reads an edge without a cardinality as no anatomy", () => {
    expect(
      readAnatomy(
        [
          "node:",
          "  uri: global.component.field",
          "  edges:",
          "    - node:",
          "        role: label",
          "      relation:",
          "        slotName: label",
        ].join("\n"),
      ),
    ).toBeUndefined();
  });
});
