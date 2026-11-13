import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import Item from "./Item.js";

const inList = (ui: React.ReactElement) => render(<ol>{ui}</ol>);

describe("Breadcrumbs Item", () => {
  // React reports a component that reads `key` from its props only once per
  // module, so this test lives in its own file, where nothing has rendered a
  // keyed Item before it.
  it("does not read key from its props", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    inList(<Item key="home" label="Home" />);
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes("`key` is not a prop"),
    );
    consoleError.mockRestore();
    expect(keyWarnings).toHaveLength(0);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
