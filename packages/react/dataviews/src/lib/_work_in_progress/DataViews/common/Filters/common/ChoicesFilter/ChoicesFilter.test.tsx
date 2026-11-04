/**
 * One closed-set filter, mounted on its own under a root: a checkbox per
 * option named as the wire spells the set, and a standing set moved to the
 * other set operator in one edit — by a button once scripts run, and by a
 * link to the same place before they do.
 */
import {
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
  type PredicateOperand,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import ChoicesFilter from "./ChoicesFilter.js";
import type { ChoicesFilterProps } from "./types.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [
    {
      field: "tags",
      kind: "choices",
      options: ["ex-gpu", "ex-nvme", "ex-ssd"],
    },
    { field: "cpu", kind: "number" },
  ],
});

const makeProvider = (href: string) =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({
      capabilities: declareCapabilities(collection, {
        filter: { tags: true, cpu: true },
      }),
    }).source,
    location: createMemoryLocation({ href }),
  });

type Provider = ReturnType<typeof makeProvider>;

/** The any-of filter on `tags`, beside its none-of alternative. */
const Harness = ({
  onLeave,
  options = ["ex-gpu", "ex-nvme"],
  ...native
}: Pick<ChoicesFilterProps, "onLeave" | "className" | "id"> &
  Partial<Pick<ChoicesFilterProps, "options">>) => {
  const { provider, filters } = useDataViewsRoot("ChoicesFilter test");
  return (
    <ChoicesFilter
      options={options}
      serverOwned={false}
      counts={null}
      handle={findFilterHandle<ReadonlySet<PredicateOperand>>(
        filters,
        "tags",
        "isAny",
      )}
      operator="isAny"
      alternativeDeclared
      alternativeHandle={findFilterHandle<ReadonlySet<PredicateOperand>>(
        filters,
        "tags",
        "isNone",
      )}
      host={readProviderHost(provider)}
      label="Tags"
      field="tags"
      declared
      leavesWhenCleared={false}
      onLeave={onLeave}
      {...native}
    />
  );
};

const mount = (
  provider: Provider,
  onLeave = () => {},
  options?: ChoicesFilterProps["options"],
) =>
  render(
    <DataViews provider={provider}>
      <Harness
        onLeave={onLeave}
        {...(options === undefined ? {} : { options })}
      />
    </DataViews>,
  );

describe("ChoicesFilter", () => {
  it("names each checkbox as the wire spells the set, and edits the set", () => {
    const provider = makeProvider("/machines");
    mount(provider);
    const gpu = screen.getByRole("checkbox", { name: "ex-gpu" });
    expect(gpu).toHaveAttribute("name", "tags");
    expect(gpu).toHaveAttribute("value", "ex-gpu");
    fireEvent.click(gpu);
    expect(provider.state.get().slice.filter).toEqual([
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
    ]);
    fireEvent.click(gpu);
    expect(provider.state.get().slice.filter).toEqual([]);
  });

  it("moves a standing set to none-of in one edit, and leaves with it", () => {
    const provider = makeProvider("/machines?tags=ex-gpu&cpu__gte=4");
    const host = readProviderHost(provider);
    const heard: string[] = [];
    host.transitions.subscribe(() => {
      heard.push(String(host.transitions.get()?.cause));
    });
    const onLeave = vi.fn();
    mount(provider, onLeave);
    fireEvent.click(
      screen.getByRole("button", { name: "Match none of these instead" }),
    );
    expect(provider.state.get().slice.filter).toEqual([
      { field: "cpu", operator: "gte", operands: [4] },
      { field: "tags", operator: "isNone", operands: ["ex-gpu"] },
    ]);
    expect(heard).toEqual(["filter"]);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("moves the set it shows, whichever conjunct at its address that is", () => {
    const provider = makeProvider(
      "/machines?tags=ex-gpu&tags__isAny__1=ex-nvme",
    );
    mount(provider, () => {}, ["ex-gpu", "ex-nvme", "ex-ssd"]);
    // The control's set becomes ex-ssd, which sorts after ex-nvme's.
    fireEvent.click(screen.getByRole("checkbox", { name: "ex-ssd" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "ex-gpu" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Match none of these instead" }),
    );
    expect(provider.state.get().slice.filter).toEqual([
      { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
      { field: "tags", operator: "isNone", operands: ["ex-ssd"] },
    ]);
  });

  it("links to where the move leads before any script runs", () => {
    const html = renderToString(
      <DataViews provider={makeProvider("/machines?tags=ex-gpu&cpu__gte=4")}>
        <Harness onLeave={() => {}} />
      </DataViews>,
    );
    const href = /<a class="switch" href="([^"]*)">/
      .exec(html)
      ?.at(1)
      ?.replaceAll("&amp;", "&");
    expect(href).toBe("?cpu__gte=4&tags__isNone=ex-gpu&page=1&size=50");
  });
  it("passes native props to its group, keeping its own class first", () => {
    render(
      <DataViews provider={makeProvider("/machines")}>
        <Harness onLeave={() => {}} className="extra" id="tags-filter" />
      </DataViews>,
    );
    const group = screen.getByRole("group", { name: "Tags is any of" });
    expect(group).toHaveAttribute("id", "tags-filter");
    expect(group.className).toBe("ds data-views-filters-choices extra");
  });
});
