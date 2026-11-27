import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import MenuContext from "./MenuContext.js";

const Reader = () => (
  <span>{useContext(MenuContext) === null ? "outside" : "inside"}</span>
);

describe("MenuContext", () => {
  it("is null outside an open menu", () => {
    render(<Reader />);
    expect(screen.getByText("outside")).toBeInTheDocument();
  });
});
