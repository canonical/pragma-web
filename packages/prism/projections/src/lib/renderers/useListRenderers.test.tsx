import { render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useListRenderers from "./useListRenderers.js";

describe("useListRenderers", () => {
  it("offers the table, then the cards, labelled from the catalog", () => {
    const { result } = renderHook(() => useListRenderers());
    expect(result.current.map(({ name, label }) => `${name}:${label}`)).toEqual(
      ["table:Table", "cards:Cards"],
    );
  });

  it("draws the items in the list under each renderer's name", () => {
    const { result } = renderHook(() => useListRenderers());
    const [table, cards] = result.current;
    const { container } = render(
      <>
        {table?.render({ children: <li>Northgate</li> })}
        {cards?.render({ children: <div>Kilnwood</div> })}
      </>,
    );
    expect(container.querySelector("ol.items")?.textContent).toBe("Northgate");
    expect(container.querySelector(".ds.cards")?.textContent).toBe("Kilnwood");
  });

  it("passes the empty line to the list", () => {
    const { result } = renderHook(() => useListRenderers());
    render(
      <>{result.current.at(0)?.render({ children: [], empty: "None." })}</>,
    );
    expect(screen.getByText("None.")).toBeInTheDocument();
  });
});
