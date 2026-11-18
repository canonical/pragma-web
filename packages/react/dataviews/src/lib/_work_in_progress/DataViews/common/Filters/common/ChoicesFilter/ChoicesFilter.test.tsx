/**
 * One closed-set filter, mounted on its own under a root: a checkbox per
 * option named as the wire spells the set, and a standing set moved to the
 * other set operator in one edit — by a button once scripts run, and by a
 * link to the same place before they do.
 */
import {
  type Count,
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
  type PredicateOperand,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../../../testing/createMachineProvider.js";
import {
  MACHINE_DECLARATION,
  machines,
} from "../../../../../../../../testing/machines.js";
import type { IdentifiedRecord } from "../../../../../../../../testing/types.js";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import DataViews from "../../../../Provider.js";
import { findFilterHandle } from "../../../utils/index.js";
import ChoicesFilter from "./ChoicesFilter.js";
import type { ChoicesFilterProps } from "./types.js";

/** A source declaring status under both set operators. */
const BOTH_DECLARED = declareCapabilities(machines, {
  ...MACHINE_DECLARATION,
  filter: { ...MACHINE_DECLARATION.filter, status: ["isAny", "isNone"] },
});

/** The filter at the root's own status handles. */
const StatusFilter = ({
  operator = "isAny" as "isAny" | "isNone",
  options = ["failed", "running"] as readonly (string | number)[],
  serverOwned = false,
  counts = null as ReadonlyMap<string, Count> | null,
  alternativeDeclared = false,
  declared = true,
  leavesWhenCleared = false,
  onLeave = () => {},
}) => {
  const { provider, filters } = useDataViewsRoot("ChoicesFilter test");
  const alternative = operator === "isAny" ? "isNone" : "isAny";
  return (
    <ChoicesFilter
      options={options}
      serverOwned={serverOwned}
      counts={counts}
      handle={findFilterHandle(filters, "status", operator)}
      operator={operator}
      alternativeDeclared={alternativeDeclared}
      alternativeHandle={findFilterHandle(filters, "status", alternative)}
      host={readProviderHost(provider)}
      label="Status"
      field="status"
      declared={declared}
      leavesWhenCleared={leavesWhenCleared}
      onLeave={onLeave}
    />
  );
};

/** A provider over the machines, declaring both set operators on status. */
const buildProvider = (location?: QueryLocation) =>
  createMachineProvider({
    rows: [],
    capabilities: BOTH_DECLARED,
    ...(location === undefined ? {} : { location }),
  }).provider;

/** The filter mounted in a root over the provider. */
const mountFilter = (
  provider: ReturnType<typeof buildProvider>,
  props: Parameters<typeof StatusFilter>[0] = {},
) =>
  render(
    <DataViews provider={provider}>
      <StatusFilter {...props} />
    </DataViews>,
  );

/** Stand a status predicate under the operator. */
const standStatus = (
  provider: ReturnType<typeof buildProvider>,
  operator: "isAny" | "isNone",
  operands: readonly string[],
): void => {
  act(() => {
    readProviderHost(provider).setPredicate({
      field: "status",
      operator,
      operands: [...operands],
    });
  });
};

/** A collection whose closed set, tags, holds conjuncts that sort apart. */
const tags = createCollection({
  identify: (row: IdentifiedRecord) => row.id,
  fields: [
    {
      field: "tags",
      kind: "choices",
      options: ["ex-gpu", "ex-nvme", "ex-ssd"],
    },
    { field: "cpu", kind: "number" },
  ],
});

/** A provider over the tags collection at a link. */
const buildTagsProvider = (href: string) =>
  createDataViewsProvider({
    collection: tags,
    source: createManualSource<IdentifiedRecord>({
      capabilities: declareCapabilities(tags, {
        filter: { tags: true, cpu: true },
      }),
    }).source,
    location: createMemoryLocation({ href }),
  });

/** The any-of filter on `tags`, beside its none-of alternative. */
const TagsFilter = ({
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

/** The tags filter mounted in a root over the provider. */
const mountTagsFilter = (
  provider: ReturnType<typeof buildTagsProvider>,
  onLeave = () => {},
  options?: ChoicesFilterProps["options"],
) =>
  render(
    <DataViews provider={provider}>
      <TagsFilter
        onLeave={onLeave}
        {...(options === undefined ? {} : { options })}
      />
    </DataViews>,
  );

describe("ChoicesFilter", () => {
  it("draws a checkbox per option under a legend naming the set", () => {
    mountFilter(buildProvider());
    const group = screen.getByRole("group", { name: "Status is any of" });
    expect(group).toHaveClass("ds", "data-views-filters-choices");
    const failed = screen.getByRole("checkbox", { name: "failed" });
    expect(failed).toHaveAttribute("name", "status");
    expect(failed).toHaveAttribute("value", "failed");
    expect(failed).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "running" })).toBeEnabled();
  });

  it("names a none-of set's checkboxes as the wire spells it", () => {
    mountFilter(buildProvider(), { operator: "isNone" });
    expect(
      screen.getByRole("group", { name: "Status is none of" }),
    ).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "failed" })).toHaveAttribute(
      "name",
      "status__isNone",
    );
  });

  it("adds to the set as an option is checked, and clears it with the last", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, { onLeave });
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "running" }));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["failed", "running"] },
    ]);
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "status", operator: "isAny", operands: ["running"] },
    ]);
    fireEvent.click(screen.getByRole("checkbox", { name: "running" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it("leaves with the last option cleared when it leaves once cleared", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, { leavesWhenCleared: true, onLeave });
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(onLeave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("draws nothing for a none-of set not offered while nothing stands", () => {
    mountFilter(buildProvider(), {
      operator: "isNone",
      alternativeDeclared: true,
    });
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("offers an undeclared set only while it stands, for removal alone", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, { declared: false, onLeave });
    expect(screen.queryByRole("group")).toBeNull();
    standStatus(provider, "isAny", ["failed"]);
    expect(screen.getByRole("checkbox", { name: "failed" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "running" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("leaves with a none-of set offered only while it stood", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, {
      operator: "isNone",
      alternativeDeclared: true,
      onLeave,
    });
    standStatus(provider, "isNone", ["failed"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("draws nothing without options", () => {
    mountFilter(buildProvider(), { options: [] });
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("lists a server's options with those the set holds, the held ones leaving with it", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, { serverOwned: true, options: ["running"], onLeave });
    standStatus(provider, "isAny", ["failed", "running"]);
    expect(
      screen.getAllByRole("checkbox").map((box) => box.getAttribute("value")),
    ).toEqual(["running", "failed"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "running" }));
    expect(onLeave).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: "failed" }));
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("describes each option by its count, a missing one counting none", () => {
    mountFilter(buildProvider(), {
      counts: new Map([["failed", { kind: "exact", value: 1200 }]]),
    });
    expect(
      screen.getByRole("checkbox", { name: "failed" }),
    ).toHaveAccessibleDescription("1,200");
    expect(
      screen.getByRole("checkbox", { name: "running" }),
    ).toHaveAccessibleDescription("0");
  });

  it("says no count while none answers", () => {
    mountFilter(buildProvider());
    expect(
      screen.getByRole("checkbox", { name: "failed" }),
    ).not.toHaveAttribute("aria-describedby");
  });

  it("moves a standing set to the other operator, and leaves with it", () => {
    const provider = buildProvider();
    const onLeave = vi.fn();
    mountFilter(provider, { alternativeDeclared: true, onLeave });
    expect(screen.queryByRole("button")).toBeNull();
    standStatus(provider, "isAny", ["failed"]);
    fireEvent.click(
      screen.getByRole("button", { name: "Match none of these instead" }),
    );
    expect(provider.state.get().slice.filter).toEqual([
      { field: "status", operator: "isNone", operands: ["failed"] },
    ]);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it("offers a none-of set the move to any-of", () => {
    const provider = buildProvider();
    mountFilter(provider, { operator: "isNone", alternativeDeclared: true });
    standStatus(provider, "isNone", ["failed"]);
    expect(
      screen.getByRole("button", { name: "Match any of these instead" }),
    ).toBeVisible();
  });

  it("offers no move without the other operator declared", () => {
    const provider = buildProvider();
    mountFilter(provider);
    standStatus(provider, "isAny", ["failed"]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers no move onto a set that stands", () => {
    const provider = buildProvider();
    mountFilter(provider, { alternativeDeclared: true });
    standStatus(provider, "isAny", ["failed"]);
    standStatus(provider, "isNone", ["running"]);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("draws the move as a link before scripts take over", () => {
    const provider = buildProvider(
      createMemoryLocation({ href: "/machines?status=failed" }),
    );
    const html = renderToString(
      <DataViews provider={provider}>
        <StatusFilter alternativeDeclared />
      </DataViews>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    const link = container.querySelector("a.switch");
    expect(link?.textContent).toBe("Match none of these instead");
    expect(
      new URLSearchParams(link?.getAttribute("href") ?? "").get(
        "status__isNone",
      ),
    ).toBe("failed");
  });

  it("draws no link without a location to lead to", () => {
    const provider = buildProvider();
    standStatus(provider, "isAny", ["failed"]);
    const html = renderToString(
      <DataViews provider={provider}>
        <StatusFilter alternativeDeclared />
      </DataViews>,
    );
    expect(html).toContain("failed");
    expect(html).not.toContain("<a");
  });

  it("moves a standing set to none-of in one edit, and leaves with it", () => {
    const provider = buildTagsProvider("/machines?tags=ex-gpu&cpu__gte=4");
    const host = readProviderHost(provider);
    const heard: string[] = [];
    host.transitions.subscribe(() => {
      heard.push(String(host.transitions.get()?.cause));
    });
    const onLeave = vi.fn();
    mountTagsFilter(provider, onLeave);
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
    const provider = buildTagsProvider(
      "/machines?tags=ex-gpu&tags__isAny__1=ex-nvme",
    );
    mountTagsFilter(provider, () => {}, ["ex-gpu", "ex-nvme", "ex-ssd"]);
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
      <DataViews
        provider={buildTagsProvider("/machines?tags=ex-gpu&cpu__gte=4")}
      >
        <TagsFilter onLeave={() => {}} />
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
      <DataViews provider={buildTagsProvider("/machines")}>
        <TagsFilter onLeave={() => {}} className="extra" id="tags-filter" />
      </DataViews>,
    );
    const group = screen.getByRole("group", { name: "Tags is any of" });
    expect(group).toHaveAttribute("id", "tags-filter");
    expect(group.className).toBe("ds data-views-filters-choices extra");
  });
});
