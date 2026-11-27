import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusWords from "./StatusWords.js";

describe("StatusWords", () => {
  it("starts on All, and makes a chosen status current", () => {
    render(<StatusWords />);
    const all = screen.getByRole("button", { name: "All" });
    expect(all).toHaveAttribute("aria-current", "true");
    const ready = screen.getByRole("button", { name: /^ready\s?,\s?4$/ });
    fireEvent.click(ready);
    expect(ready).toHaveAttribute("aria-current", "true");
    fireEvent.click(all);
    expect(all).toHaveAttribute("aria-current", "true");
  });

  it("starts on the given status", () => {
    render(<StatusWords initial="deployed" />);
    expect(
      screen.getByRole("button", { name: /^deployed\s?,\s?12$/ }),
    ).toHaveAttribute("aria-current", "true");
  });
});
