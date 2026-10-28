import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import useStoredTheme from "./useStoredTheme.js";

/** Prints the stored theme in scope. */
const StoredTheme = (): ReactElement => <p>{useStoredTheme() ?? "none"}</p>;

describe("useStoredTheme", () => {
  it("reads no stored theme with no provider mounted", () => {
    render(<StoredTheme />);
    expect(screen.getByText("none")).toBeInTheDocument();
  });
});
