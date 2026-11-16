import { createMemoryLocation } from "@canonical/dataviews-core";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import QueryInTheLocation from "./QueryInTheLocation.js";

describe("QueryInTheLocation", () => {
  it("shows the query the location carries, and follows it", () => {
    const location = createMemoryLocation({ href: "/machines?q=alpha" });
    render(<QueryInTheLocation location={location} />);
    const output = screen.getByRole("status", { name: "Location" });
    expect(output).toHaveTextContent("/machines?q=alpha");
    act(() => {
      location.write(new URLSearchParams("q=beta"));
    });
    expect(output).toHaveTextContent("/machines?q=beta");
  });
});
