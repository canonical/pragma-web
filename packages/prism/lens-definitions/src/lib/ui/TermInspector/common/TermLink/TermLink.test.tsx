import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createRouterHarness from "../../../../../../testing/createRouterHarness.js";
import TermLink from "./TermLink.js";

const NAMESPACES = [{ prefix: "ds", namespace: "https://ds.canonical.com/" }];

describe("TermLink", () => {
  it("links to the term's view under the graph's label", () => {
    render(
      createRouterHarness(
        <TermLink
          className="custom-class"
          label="Component"
          namespaces={NAMESPACES}
          uri="https://ds.canonical.com/Component"
        />,
      ),
    );
    const link = screen.getByRole("link", { name: "Component" });
    expect(link).toHaveAttribute("href", "/definitions/ds%3AComponent");
    expect(link.className).toBe("ds term-link custom-class");
  });

  it("stands the compact address in for an absent label", () => {
    render(
      createRouterHarness(
        <TermLink
          label={null}
          namespaces={NAMESPACES}
          uri="https://ds.canonical.com/Tier"
        />,
      ),
    );
    expect(screen.getByRole("link", { name: "ds:Tier" })).toBeInTheDocument();
  });

  it("marks the current term", () => {
    render(
      createRouterHarness(
        <TermLink
          label="Tier"
          namespaces={NAMESPACES}
          uri="https://ds.canonical.com/Tier"
        />,
        "/definitions/ds%3ATier",
      ),
    );
    expect(screen.getByRole("link", { name: "Tier" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
