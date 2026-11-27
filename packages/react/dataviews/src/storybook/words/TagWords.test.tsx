import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TagWords from "./TagWords.js";

describe("TagWords", () => {
  it("toggles each tag, starting on ex-gpu", () => {
    render(<TagWords />);
    const gpu = screen.getByRole("button", { name: "ex-gpu" });
    const ssd = screen.getByRole("button", { name: "ex-ssd" });
    expect(gpu).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(ssd);
    expect(ssd).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(gpu);
    expect(gpu).toHaveAttribute("aria-pressed", "false");
  });
});
