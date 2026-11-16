import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";

/** Shows whether a menu reaches the panel. */
const ReadMenu = () => (
  <output>{String(useContext(Context)?.items.length ?? "none")}</output>
);

describe("Panel Context", () => {
  it("holds no menu outside a menu button", () => {
    render(<ReadMenu />);
    expect(screen.getByRole("status")).toHaveTextContent("none");
  });

  it("hands the panel the button's menu", () => {
    render(
      <Context value={{ items: [], onSelect: () => {}, labelledBy: undefined }}>
        <ReadMenu />
      </Context>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("0");
  });
});
