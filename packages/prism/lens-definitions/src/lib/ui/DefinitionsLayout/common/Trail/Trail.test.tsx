import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
import { Trail } from "./index.js";

describe("Trail", () => {
  it("ends the trail at the lens, linked back to it, on a term", () => {
    render(
      createStripHarness(
        "/definitions/ds%3AUIBlock",
        undefined,
        createFetchSpy(),
        <Trail />,
      ),
    );
    expect(screen.getByRole("link", { name: "Definitions" })).toHaveAttribute(
      "href",
      "/definitions",
    );
    expect(screen.queryByText("ds:UIBlock")).not.toBeInTheDocument();
  });

  it("names only the lens on the explorer", () => {
    render(
      createStripHarness(
        "/definitions",
        undefined,
        createFetchSpy(),
        <Trail />,
      ),
    );
    expect(screen.getByText("Definitions")).toBeInTheDocument();
    expect(screen.queryByText("ds:UIBlock")).not.toBeInTheDocument();
  });
});
