import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultComponents } from "../elements/index.js";
import type { MarkdownComponents } from "../types.js";
import { useMDXComponents } from "./hooks/index.js";
import MdxProvider from "./Provider.js";

const providedComponents: MarkdownComponents = { h1: "h3" };

/** Shows whether the hook returned the default or the provided map. */
function ComponentsProbe() {
  const components = useMDXComponents();
  const source =
    components === defaultComponents
      ? "default"
      : components === providedComponents
        ? "provided"
        : "other";

  return <span data-testid="probe">{source}</span>;
}

describe("MdxProvider", () => {
  it("leaves pages with the default components when there is no provider", () => {
    render(<ComponentsProbe />);

    expect(screen.getByTestId("probe").textContent).toBe("default");
  });

  it("provides its components to descendants", () => {
    render(
      <MdxProvider components={providedComponents}>
        <ComponentsProbe />
      </MdxProvider>,
    );

    expect(screen.getByTestId("probe").textContent).toBe("provided");
  });
});
