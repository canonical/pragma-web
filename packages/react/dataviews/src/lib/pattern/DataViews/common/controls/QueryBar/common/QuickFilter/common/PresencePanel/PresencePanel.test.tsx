/**
 * A presence's panel over the quick filters' hosts: three radios, each
 * committing at once.
 */
import {
  createDataViewsProvider,
  type DataViewsProvider,
  declareCapabilities,
  type SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  buildPage,
  createManualSource,
} from "@canonical/dataviews-core/testing";
import { fireEvent, render, screen } from "@testing-library/react";
import { useMemo } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { QuickHost } from "../../../../../../../../../../../testing/index.js";
import {
  createQuickFilterProvider,
  quickHostCollection,
  quickHosts,
} from "../../../../../../../../../../../testing/index.js";
import { useDataViewsValue } from "../../../../../../../../../hooks/index.js";
import DataViews from "../../../../../../../Provider.js";
import { useQueryGroup } from "../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../../../types.js";
import { isSameConjuncts, listFieldConjuncts } from "../../utils/index.js";
import PresencePanel from "./PresencePanel.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

function Host({
  provider,
  named,
  onCommit,
}: {
  readonly provider: Provider;
  readonly named: boolean;
  readonly onCommit: () => void;
}) {
  const group = useQueryGroup({ provider });
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, "owner"),
    [],
  );
  const conjuncts = useDataViewsValue(group.state, {
    select: select,
    isEqual: isSameConjuncts,
  });
  return (
    <PresencePanel
      definition={{ field: "owner", kind: "presence" }}
      label="owner"
      conjuncts={conjuncts}
      group={group}
      named={named}
      onCommit={onCommit}
      onInvalid={vi.fn()}
    />
  );
}

const tree = (provider: Provider, named = false, onCommit = vi.fn()) => (
  <DataViews provider={provider}>
    <Host provider={provider} named={named} onCommit={onCommit} />
  </DataViews>
);

describe("PresencePanel", () => {
  it("marks the choice that applies, and commits each choice at once", () => {
    const provider = createQuickFilterProvider({
      query: "owner__isSet=false",
    }) as unknown as Provider;
    render(tree(provider));
    expect(screen.getByRole("group", { name: "owner" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Has no value" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Has a value" }));
    expect(provider.state.get().slice.filter).toEqual([
      { field: "owner", operator: "isSet", operands: [true] },
    ]);
    fireEvent.click(screen.getByRole("radio", { name: "Any" }));
    expect(provider.state.get().slice.filter).toEqual([]);
    // Once scripts run, the radios share a name of the panel's own.
    const names = screen
      .getAllByRole("radio")
      .map((radio) => radio.getAttribute("name"));
    expect(new Set(names).size).toBe(1);
    expect(names.at(0)).not.toBe("owner__isSet");
  });

  it("names each radio as the wire spells it, where asked", () => {
    const provider = createQuickFilterProvider() as unknown as Provider;
    render(tree(provider, true));
    expect(screen.getByRole("radio", { name: "Any" })).toHaveAttribute(
      "value",
      "",
    );
    const set = screen.getByRole("radio", { name: "Has a value" });
    expect(set).toHaveAttribute("name", "owner__isSet");
    expect(set).toHaveAttribute("value", "true");
  });

  it("renders unnamed radios before scripts run, where nothing is asked", () => {
    const provider = createQuickFilterProvider() as unknown as Provider;
    expect(renderToString(tree(provider))).not.toContain("name=");
  });

  it("leaves every radio in the Tab order before scripts run, for the browser to rove", () => {
    const provider = createQuickFilterProvider({
      query: "owner__isSet=true",
    }) as unknown as Provider;
    expect(renderToString(tree(provider, true))).not.toContain("tabindex");
  });

  it("says there is nothing to choose where the source offers no presence", () => {
    const source = createManualSource<QuickHost>({
      capabilities: declareCapabilities(quickHostCollection, {
        filter: { zone: ["isAny"] },
        facets: ["zone"],
      }),
      answer: () => buildPage(quickHosts),
    });
    render(
      tree(
        createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
      ),
    );
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByText("No options")).toBeInTheDocument();
  });

  it("says why a choice was refused", () => {
    const source = createManualSource<QuickHost>({
      capabilities: declareCapabilities(quickHostCollection, {
        filter: { owner: ["isSet"], zone: ["isAny"] },
        facets: ["zone"],
      }),
      answer: () => buildPage(quickHosts),
      listRefusals: ({ slice }) =>
        slice.filter.length > 0
          ? [
              {
                part: "filter",
                code: "unsupported-combination",
                field: "owner",
                operator: "isSet",
                reason: "owners are private",
              },
            ]
          : [],
    });
    const onCommit = vi.fn();
    render(
      tree(
        createDataViewsProvider({
          collection: quickHostCollection,
          source: source.source,
          facets: ["zone"],
        }) as unknown as Provider,
        false,
        onCommit,
      ),
    );
    fireEvent.click(screen.getByRole("radio", { name: "Has a value" }));
    expect(onCommit).toHaveBeenCalledWith([
      expect.objectContaining({ reason: "owners are private" }),
    ]);
    // Any, already chosen, commits nothing.
    fireEvent.click(screen.getByRole("radio", { name: "Any" }));
    expect(onCommit).toHaveBeenCalledTimes(1);
  });
});
