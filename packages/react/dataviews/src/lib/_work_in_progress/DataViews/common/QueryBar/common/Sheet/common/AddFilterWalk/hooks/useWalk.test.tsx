import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useWalk from "./useWalk.js";

const mount = () => renderHook(() => useWalk());

describe("useWalk", () => {
  it("starts closed, and walks field, operator and value", () => {
    const { result } = mount();
    expect(result.current.walk.step).toBe("closed");
    act(() => result.current.dispatch({ type: "open" }));
    expect(result.current.walk.step).toBe("field");
    act(() =>
      result.current.dispatch({ type: "chooseField", field: "status" }),
    );
    expect(result.current.walk).toMatchObject({
      step: "operator",
      field: "status",
    });
    act(() =>
      result.current.dispatch({ type: "chooseOperator", operator: "isAny" }),
    );
    expect(result.current.walk).toMatchObject({
      step: "value",
      operator: "isAny",
      operands: [],
    });
  });

  it("toggles values, and clears what was invalid", () => {
    const { result } = mount();
    act(() => {
      result.current.dispatch({ type: "open" });
      result.current.dispatch({ type: "chooseField", field: "status" });
      result.current.dispatch({ type: "chooseOperator", operator: "isAny" });
      result.current.dispatch({ type: "invalid", reason: "Pick a value" });
    });
    expect(result.current.walk.invalid).toBe("Pick a value");
    act(() => {
      result.current.dispatch({ type: "toggleValue", operand: "ready" });
      result.current.dispatch({ type: "toggleValue", operand: "broken" });
    });
    expect(result.current.walk.operands).toEqual(["ready", "broken"]);
    expect(result.current.walk.invalid).toBeNull();
    act(() =>
      result.current.dispatch({ type: "toggleValue", operand: "ready" }),
    );
    expect(result.current.walk.operands).toEqual(["broken"]);
  });

  it("keeps a typed value's text, cleared of its fault as it changes", () => {
    const { result } = mount();
    act(() => {
      result.current.dispatch({ type: "invalid", reason: "Not a number" });
      result.current.dispatch({ type: "type", text: "8 GiB" });
    });
    expect(result.current.walk).toMatchObject({
      typed: "8 GiB",
      invalid: null,
    });
  });

  it("goes back a step, keeping what was chosen, and leaves from the first", () => {
    const { result } = mount();
    act(() => {
      result.current.dispatch({ type: "open" });
      result.current.dispatch({ type: "chooseField", field: "status" });
      result.current.dispatch({ type: "chooseOperator", operator: "isAny" });
      result.current.dispatch({ type: "toggleValue", operand: "ready" });
      result.current.dispatch({ type: "invalid", reason: "Refused" });
      result.current.dispatch({ type: "back" });
    });
    expect(result.current.walk).toMatchObject({
      step: "operator",
      operator: "isAny",
      invalid: null,
    });
    // The same operator again keeps its values.
    act(() =>
      result.current.dispatch({ type: "chooseOperator", operator: "isAny" }),
    );
    expect(result.current.walk.operands).toEqual(["ready"]);
    // Another drops them.
    act(() => {
      result.current.dispatch({ type: "back" });
      result.current.dispatch({ type: "chooseOperator", operator: "isNone" });
    });
    expect(result.current.walk.operands).toEqual([]);
    act(() => {
      result.current.dispatch({ type: "back" });
      result.current.dispatch({ type: "back" });
    });
    expect(result.current.walk).toMatchObject({
      step: "field",
      field: "status",
    });
    // The same field again keeps its operator; another drops it.
    act(() =>
      result.current.dispatch({ type: "chooseField", field: "status" }),
    );
    expect(result.current.walk.operator).toBe("isNone");
    act(() => {
      result.current.dispatch({ type: "back" });
      result.current.dispatch({ type: "chooseField", field: "pool" });
    });
    expect(result.current.walk.operator).toBeNull();
    act(() => {
      result.current.dispatch({ type: "back" });
      result.current.dispatch({ type: "back" });
    });
    expect(result.current.walk.step).toBe("closed");
  });

  it("drops everything chosen as it leaves", () => {
    const { result } = mount();
    act(() => {
      result.current.dispatch({ type: "open" });
      result.current.dispatch({ type: "chooseField", field: "status" });
      result.current.dispatch({ type: "leave" });
    });
    expect(result.current.walk).toEqual({
      step: "closed",
      field: null,
      operator: null,
      operands: [],
      typed: "",
      invalid: null,
    });
  });
});
