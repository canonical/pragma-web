import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import silenceRenderErrors from "../../../../../../../../../testing/silenceRenderErrors.js";
import Context from "./Context.js";
import Panel from "./Panel.js";

describe("Panel", () => {
  it("holds the menu in a popover named by the trigger when no element names it", () => {
    const { container } = render(
      <Context
        value={{
          items: [{ key: "copy", label: "Copy" }],
          onSelect: () => {},
          labelledBy: undefined,
        }}
      >
        <Panel ref={null} id="panel" triggerId="trigger" />
      </Context>,
    );
    const panel = container.querySelector("#panel");
    expect(panel).toHaveAttribute("popover", "auto");
    expect(panel).toHaveTextContent("Copy");
  });

  it("refuses to render outside a menu button", () => {
    silenceRenderErrors();
    expect(() =>
      render(<Panel ref={null} id="panel" triggerId="trigger" />),
    ).toThrow("a menu button's panel renders inside the button");
  });
});
