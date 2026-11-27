import { describe, expect, it } from "vitest";
import createControlProps from "./createControlProps.js";

describe("createControlProps", () => {
  it("wires a valid required control without a description", () => {
    expect(createControlProps("x-name", false, true)).toEqual({
      id: "x-name",
      "aria-labelledby": "x-name-label",
      "aria-describedby": undefined,
      "aria-errormessage": undefined,
      "aria-invalid": false,
      "aria-required": true,
      required: true,
    });
  });

  it("references the description only when one renders", () => {
    expect(createControlProps("x-name", false, true, true)).toMatchObject({
      "aria-describedby": "x-name-description",
    });
  });

  it("references the error of an invalid optional control", () => {
    expect(createControlProps("x-name", true, false)).toMatchObject({
      "aria-describedby": "x-name-error",
      "aria-errormessage": "x-name-error",
      "aria-invalid": true,
      "aria-required": undefined,
      required: false,
    });
    expect(createControlProps("x-name", true, false, true)).toMatchObject({
      "aria-describedby": "x-name-description x-name-error",
    });
  });
});
