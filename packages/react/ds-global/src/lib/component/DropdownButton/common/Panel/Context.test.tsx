import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";

const ReadPanelId = () => (
  <output>{useContext(Context)?.panelId ?? "none"}</output>
);

describe("Context", () => {
  it("is undefined outside a provider", () => {
    render(<ReadPanelId />);
    expect(screen.getByRole("status")).toHaveTextContent("none");
  });

  it("carries the value provided", () => {
    render(
      <Context.Provider
        value={{ panelId: "panel", isOpen: false, setOpen: () => {} }}
      >
        <ReadPanelId />
      </Context.Provider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("panel");
  });
});
