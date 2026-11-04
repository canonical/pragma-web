import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
  type DataViewsProvider,
} from "@canonical/dataviews-core";
import { act, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import {
  createFacetedFleet,
  createFacetedManual,
} from "../../../../testing/createFacetedProviders.js";
import deliverFacets from "../../../../testing/deliverFacets.js";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import {
  createMachineProvider,
  type Machine,
  type MachineFields,
} from "../../../../testing/machines.js";
import silenceRenderErrors from "../../../../testing/silenceRenderErrors.js";
import DataChart from "./DataChart.js";

type Provider = DataViewsProvider<MachineFields, Machine>;

/** The accessible name the status chart is given. */
const NAME =
  "Machines by status: a bar chart of how many records hold each value";

/** The bar chart's data table, as value and count pairs. */
const readTable = (): readonly (readonly string[])[] =>
  within(screen.getByRole("table", { name: "Machines by status, as a table" }))
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      [...row.querySelectorAll("th, td")].map((cell) => cell.textContent ?? ""),
    );

/** The range chart's data table, as heading and value pairs. */
const readRange = (): readonly (readonly string[])[] =>
  within(screen.getByRole("table", { name: "Cores, as a table" }))
    .getAllByRole("row")
    .map((row) =>
      [...row.querySelectorAll("th, td")].map((cell) => cell.textContent ?? ""),
    );

/** Each bar's drawn data end, as the `H` its path draws its top edge to. */
const readBarEnds = (container: HTMLElement): readonly string[] =>
  [...container.querySelectorAll(".bar")].map(
    (bar) =>
      bar
        .getAttribute("d")
        ?.match(/H([\d.]+)/)
        ?.at(1) ?? "",
  );

/** Where each marker is drawn along the axis, in the drawing's units. */
const readMarkers = (container: HTMLElement): readonly number[] =>
  [...container.querySelectorAll(".marker")].map((marker) =>
    Number(marker.getAttribute("cx")),
  );

describe("DataChart", () => {
  it("is a figure captioned by its label, spreading and merging the caller's props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <DataChart
        type="bar"
        provider={createFacetedFleet()}
        field="status"
        label="Machines by status"
        className="mine"
        data-testid="chart"
        ref={ref}
      />,
    );
    const root = screen.getByTestId("chart");
    expect(root.tagName).toBe("FIGURE");
    expect(root).toHaveAccessibleName("Machines by status");
    expect(root).toHaveClass("ds", "data-chart", "mine");
    expect(ref.current).toBe(root);
  });

  it("is a figure of a range captioned by its label, spreading and merging the caller's props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <DataChart
        type="range"
        provider={createFacetedFleet()}
        field="cores"
        label="Cores"
        className="mine"
        data-testid="chart"
        ref={ref}
      />,
    );
    const root = screen.getByTestId("chart");
    expect(root.tagName).toBe("FIGURE");
    expect(root).toHaveAccessibleName("Cores");
    expect(root).toHaveClass("ds", "data-chart", "mine");
    expect(ref.current).toBe(root);
  });

  it("has no axe violation drawing bars", async () => {
    const { container } = render(
      <DataChart
        type="bar"
        provider={createFacetedFleet()}
        field="status"
        label="Machines by status"
      />,
    );
    await expectNoAxeViolations(container);
  });

  it("has no axe violation drawing a range", async () => {
    const { container } = render(
      <DataChart
        type="range"
        provider={createFacetedFleet()}
        field="cores"
        label="Cores"
      />,
    );
    await expectNoAxeViolations(container);
  });
});

describe('DataChart of type "bar"', () => {
  it("counts each value over every matching record, not over the page on screen", () => {
    // Twelve machines, five to a page: every third failed.
    const provider = createFacetedFleet({ query: "page=1&size=5" });
    const { container } = render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    // Five to a page, while the counts cover all twelve.
    expect(provider.state.get().window).toMatchObject({ size: 5 });
    expect(readTable()).toEqual([
      ["failed", "4"],
      ["running", "8"],
    ]);
    // Eight is the axis's end: 264 units of plot past the 136-unit label
    // column, less the 4-unit rounded end. Four is half of it.
    expect(readBarEnds(container)).toEqual(["264", "396"]);
    expect(
      [...container.querySelectorAll(".tick")].map((tick) => tick.textContent),
    ).toEqual(["0", "2", "4", "6", "8"]);
  });

  it("keeps every value's count while a filter on the field keeps some", () => {
    const provider = createFacetedFleet({ href: "/machines?status=failed" });
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    // The filter is in force — four of the twelve match it …
    expect(provider.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed"] },
    ]);
    expect(provider.state.get().result.counts?.matched).toEqual({
      kind: "exact",
      value: 4,
    });
    // … and the bars still count every machine, failed or running, because a
    // facet lifts its own field's restriction.
    expect(readTable()).toEqual([
      ["failed", "4"],
      ["running", "8"],
    ]);
  });

  it("is an image named for what it shows, followed by a table of its numbers", () => {
    const provider = createFacetedFleet();
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    const image = screen.getByRole("img", { name: NAME });
    expect(image.tagName).toBe("svg");
    const table = screen.getByRole("table", {
      name: "Machines by status, as a table",
    });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Value", "Count"]);
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual(["failed", "running"]);
  });

  it("says a lower bound as one, and draws no bar for a value the source did not count", () => {
    const { provider, source } = createFacetedManual();
    const { container } = render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    deliverFacets(source, {
      status: {
        kind: "values",
        values: [
          { value: "failed", count: { kind: "at-least", value: 3 } },
          { value: "running", count: { kind: "unknown" } },
        ],
      },
      cores: { kind: "range", min: 1, max: 1 },
    });
    expect(readTable()).toEqual([
      ["failed", "at least 3"],
      ["running", "Not counted"],
    ]);
    expect(container.querySelectorAll(".bar")).toHaveLength(1);
    expect(
      [...container.querySelectorAll(".value")].map(
        (value) => value.textContent,
      ),
    ).toEqual(["at least 3", "Not counted"]);
  });

  it("draws no bar for a value no record holds", () => {
    const { provider, source } = createFacetedManual();
    const { container } = render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    deliverFacets(source, {
      status: {
        kind: "values",
        values: [
          { value: "failed", count: { kind: "exact", value: 0 } },
          { value: "running", count: { kind: "exact", value: 2 } },
        ],
      },
      cores: { kind: "range", min: 1, max: 1 },
    });
    expect(container.querySelectorAll(".bar")).toHaveLength(1);
  });

  it("draws a bar shorter than its rounded end square", () => {
    const { provider, source } = createFacetedManual();
    const { container } = render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    deliverFacets(source, {
      status: {
        kind: "values",
        values: [
          { value: "failed", count: { kind: "exact", value: 1 } },
          { value: "running", count: { kind: "exact", value: 100 } },
        ],
      },
      cores: { kind: "range", min: 1, max: 1 },
    });
    const bars = [...container.querySelectorAll(".bar")];
    expect(bars.at(0)?.getAttribute("d")).not.toContain("Q");
    expect(bars.at(1)?.getAttribute("d")).toContain("Q");
  });

  it("shows the loading status in place of bars until a result answers", () => {
    const { provider } = createFacetedManual();
    const { container } = render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    expect(
      container.querySelector("[data-status='pending']"),
    ).toHaveTextContent("Loading…");
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("never draws bars counted for an earlier query: the stale status stands in their place", () => {
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    deliverFacets(source, {
      status: {
        kind: "values",
        values: [{ value: "failed", count: { kind: "exact", value: 1 } }],
      },
      cores: { kind: "range", min: 1, max: 1 },
    });
    expect(screen.getByRole("img", { name: NAME })).toBeInTheDocument();
    act(() => {
      provider.setSearch("alp");
    });
    act(() => {
      source.latest().deliver({
        status: "failed",
        failure: { reason: "offline", cause: null, transient: null },
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows do not match the current query: offline",
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("says the collection holds nothing, and draws no bars", () => {
    const provider = createFacetedFleet({ count: 0 });
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
        renderStatus={(status) => `said ${status.status}`}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("said no-data");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("says a query matched nothing, apart from a collection holding nothing", () => {
    // A restriction the source runs, matching none of the fleet: its
    // machines hold one core apiece up to their number.
    const provider = createFacetedFleet({ href: "/machines?cores__gte=999" });
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
        renderStatus={(status) => `said ${status.status}`}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("said no-results");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("says the source counted nothing for a field whose facet is not asked for", () => {
    const provider = createFacetedFleet({ facets: ["cores"] });
    render(
      <DataChart
        type="bar"
        provider={provider}
        field="status"
        label="Machines by status"
      />,
    );
    expect(
      screen.getByText("The source answered no counts for this field."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe('DataChart of type "range"', () => {
  it("draws the lowest and highest values over every matching record, on a round axis from the field's bound", () => {
    // Twelve machines holding 1 to 12 cores, five to a page.
    const provider = createFacetedFleet({ query: "page=1&size=5" });
    const { container } = render(
      <DataChart
        type="range"
        provider={provider}
        field="cores"
        label="Cores"
      />,
    );
    // Five on the page, while the range covers all twelve.
    expect(provider.state.get().window).toMatchObject({ size: 5 });
    expect(readRange()).toEqual([
      ["Lowest", "1"],
      ["Highest", "12"],
    ]);
    // The schema says cores start at 0, so the axis does, in steps of five.
    expect(
      [...container.querySelectorAll(".tick")].map((tick) => tick.textContent),
    ).toEqual(["0", "5", "10", "15"]);
    // 432 units of axis from an inset of 24, over 0 to 15.
    const [lowest, highest] = readMarkers(container);
    expect(lowest).toBeCloseTo(24 + (1 / 15) * 432);
    expect(highest).toBeCloseTo(24 + (12 / 15) * 432);
    const band = container.querySelector(".band");
    expect(Number(band?.getAttribute("width"))).toBeCloseTo((11 / 15) * 432);
  });

  it("is an image named with its range, followed by a table of both values", () => {
    render(
      <DataChart
        type="range"
        provider={createFacetedFleet()}
        field="cores"
        label="Cores"
      />,
    );
    expect(
      screen.getByRole("img", { name: "Cores: a range chart from 1 to 12" })
        .tagName,
    ).toBe("svg");
    expect(
      within(screen.getByRole("table", { name: "Cores, as a table" }))
        .getAllByRole("rowheader")
        .map((header) => header.textContent),
    ).toEqual(["Lowest", "Highest"]);
  });

  it("says no record holds a value when the range has no ends", () => {
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        type="range"
        provider={provider}
        field="cores"
        label="Cores"
      />,
    );
    deliverFacets(source, {
      status: { kind: "values", values: [] },
      cores: { kind: "range", min: null, max: null },
    });
    expect(
      screen.getByText("No matching record holds a value."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("widens its axis past a range beyond the field's declared bound", () => {
    const { provider, source } = createFacetedManual();
    const { container } = render(
      <DataChart
        type="range"
        provider={provider}
        field="cores"
        label="Cores"
      />,
    );
    deliverFacets(source, {
      status: { kind: "values", values: [] },
      cores: { kind: "range", min: -4, max: 7 },
    });
    expect(
      [...container.querySelectorAll(".tick")].map((tick) => tick.textContent),
    ).toEqual(["-5", "0", "5", "10"]);
  });

  it("reaches the field's declared upper bound past the range, and starts from the range where no lower bound is declared", () => {
    type Host = { readonly id: string; readonly memory: number };
    const hosts = createCollection({
      identify: (host: Host) => host.id,
      // An upper bound only: the axis starts from the range itself.
      fields: [{ field: "memory", kind: "number", max: 64 }],
    });
    const provider = createDataViewsProvider({
      collection: hosts,
      source: createArraySource({
        rows: [
          { id: "h-1", memory: 4 },
          { id: "h-2", memory: 12 },
        ],
        collection: hosts,
      }),
      facets: ["memory"],
    });
    const { container } = render(
      <DataChart
        type="range"
        provider={provider}
        field="memory"
        label="Memory"
      />,
    );
    expect(
      screen.getByRole("img", { name: "Memory: a range chart from 4 to 12" }),
    ).toBeInTheDocument();
    expect(
      [...container.querySelectorAll(".tick")].map((tick) => tick.textContent),
    ).toEqual(["0", "20", "40", "60", "80"]);
  });

  it("says the source measured nothing for a field whose facet is not asked for", () => {
    render(
      <DataChart
        type="range"
        provider={createFacetedFleet({ facets: ["status"] })}
        field="cores"
        label="Cores"
      />,
    );
    expect(
      screen.getByText("The source answered no range for this field."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe("DataChart validation", () => {
  it("refuses a value that is not a provider", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <DataChart
          type="bar"
          provider={{} as Provider}
          field="status"
          label="Machines by status"
        />,
      ),
    ).toThrow(
      "DataChart requires a provider created by createDataViewsProvider",
    );
  });

  it("refuses a field that is not a number", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <DataChart
          type="range"
          provider={createFacetedFleet()}
          field="status"
          label="Status"
        />,
      ),
    ).toThrow(
      'DataChart of type "range" draws a number field, and "status" is not one',
    );
  });

  it("refuses a field its source does not facet", () => {
    silenceRenderErrors();
    // The manual machine source declares no facets at all.
    const { provider } = createMachineProvider({ rows: [] });
    expect(() =>
      render(
        <DataChart
          type="bar"
          provider={provider}
          field="status"
          label="Machines by status"
        />,
      ),
    ).toThrow('DataChart names "status", which the source does not facet');
    expect(() =>
      render(
        <DataChart
          type="bar"
          provider={createFacetedFleet()}
          field="name"
          label="Machines by name"
        />,
      ),
    ).toThrow('DataChart names "name", which the source does not facet');
  });

  it("refuses a number field its source does not facet", () => {
    silenceRenderErrors();
    // The manual machine source declares no facets at all.
    const { provider } = createMachineProvider({ rows: [] });
    expect(() =>
      render(
        <DataChart
          type="range"
          provider={provider}
          field="cores"
          label="Cores"
        />,
      ),
    ).toThrow('DataChart names "cores", which the source does not facet');
  });

  it("refuses a field faceted as a range", () => {
    silenceRenderErrors();
    const provider = createFacetedFleet();
    expect(() =>
      render(
        <DataChart
          type="bar"
          provider={provider}
          field="cores"
          label="Cores"
        />,
      ),
    ).toThrow('DataChart of type "bar" draws values, and "cores" is a range');
  });

  it("refuses a range over a field the schema does not declare", () => {
    silenceRenderErrors();
    expect(() =>
      render(
        <DataChart
          provider={createFacetedFleet()}
          type="range"
          field="memory"
          label="Memory"
        />,
      ),
    ).toThrow(
      'DataChart of type "range" draws a number field, and "memory" is not one',
    );
  });

  it("refuses a number field the source answers with values", () => {
    silenceRenderErrors();
    const { provider, source } = createFacetedManual();
    render(
      <DataChart
        provider={provider}
        type="range"
        field="cores"
        label="Cores"
      />,
    );
    expect(() =>
      deliverFacets(source, {
        status: { kind: "values", values: [] },
        cores: { kind: "values", values: [] },
      }),
    ).toThrow(
      'DataChart of type "range" draws a range, and "cores" holds values',
    );
  });
});

describe("DataChart hydrating what the server drew", () => {
  it("draws the bars the server drew from its facets, with no mismatch", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const build = () => {
      const provider = createFacetedFleet({ href: "/machines?status=failed" });
      provider.refresh();
      return (
        <DataChart
          type="bar"
          provider={provider}
          field="status"
          label="Machines by status"
        />
      );
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(build());
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    const drawn = readBarEnds(container);
    expect(drawn).toEqual(["264", "396"]);
    const recovered = vi.fn();
    await act(async () => {
      const root = hydrateRoot(container, build(), {
        onRecoverableError: recovered,
      });
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(recovered).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(readBarEnds(container)).toEqual(drawn);
  });

  it("draws the range the server drew from its facets, with no mismatch", async () => {
    const errors = vi.spyOn(console, "error");
    onTestFinished(() => {
      errors.mockRestore();
    });
    const build = () => {
      const provider = createFacetedFleet({ href: "/machines?status=failed" });
      provider.refresh();
      return (
        <DataChart
          type="range"
          provider={provider}
          field="cores"
          label="Cores"
        />
      );
    };
    const container = document.createElement("div");
    container.innerHTML = renderToString(build());
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    const drawn = readMarkers(container);
    expect(drawn).toHaveLength(2);
    const recovered = vi.fn();
    await act(async () => {
      const root = hydrateRoot(container, build(), {
        onRecoverableError: recovered,
      });
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(recovered).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(readMarkers(container)).toEqual(drawn);
  });
});
