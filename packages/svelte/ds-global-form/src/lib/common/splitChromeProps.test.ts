import { describe, expect, it } from "vitest";
import splitChromeProps from "./splitChromeProps.js";

describe("splitChromeProps", () => {
  it("sends chrome props to the chrome, others to the control, name to both", () => {
    const condition = () => true;
    expect(
      splitChromeProps({
        name: "email",
        label: "Email",
        error: "Required",
        condition,
        placeholder: "you@example.com",
        disabled: true,
      }),
    ).toEqual({
      chrome: { name: "email", label: "Email", error: "Required", condition },
      control: { placeholder: "you@example.com", disabled: true },
    });
  });

  it("sends attachments, keyed by symbols, to the control", () => {
    const key = Symbol("attachment");
    const attach = () => {};
    const { chrome, control } = splitChromeProps({ name: "e", [key]: attach });
    expect(chrome).toEqual({ name: "e" });
    expect((control as Record<symbol, unknown>)[key]).toBe(attach);
  });
});
