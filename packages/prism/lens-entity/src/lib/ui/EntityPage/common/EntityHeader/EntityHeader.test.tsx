import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EntityHeader from "./EntityHeader.js";

describe("EntityHeader", () => {
  it("names the entity in the one level-1 heading, its class and address in the status line", () => {
    const { container } = render(
      <EntityHeader
        address="metro:northgate"
        kind="Station"
        title="Northgate"
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Northgate",
    );
    const status = container.querySelector(".status");
    expect(status?.querySelector(".kind")?.textContent).toBe("Station");
    expect(status?.querySelector(".address")?.textContent).toBe(
      "metro:northgate",
    );
    expect(status?.lastElementChild?.classList.contains("copy-button")).toBe(
      true,
    );
    expect(container.querySelector(".summary")).toBeNull();
  });

  it("passes native props to its root header", () => {
    const { container } = render(
      <EntityHeader
        address="metro:northgate"
        className="site"
        data-probe="header"
        kind="Station"
        title="Northgate"
      />,
    );
    const root = container.querySelector('[data-probe="header"]');
    expect(root?.tagName).toBe("HEADER");
    expect(root?.className).toBe("ds entity-header site");
  });
});
