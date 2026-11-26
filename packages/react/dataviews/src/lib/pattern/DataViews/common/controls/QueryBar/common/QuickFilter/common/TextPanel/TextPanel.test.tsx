/**
 * A text's panel over the quick filters' hosts: one input per operator
 * offered, each committing its own clause.
 */
import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { useMemo } from "react";
import { describe, expect, it, vi } from "vitest";
import { createQuickFilterProvider } from "../../../../../../../../../../../testing/index.js";
import { useDataViewsValue } from "../../../../../../../../../hooks/index.js";
import DataViews from "../../../../../../../Provider.js";
import { useQueryGroup } from "../../../../hooks/index.js";
import type { QueryStateStandIn } from "../../../../types.js";
import { isSameConjuncts, listFieldConjuncts } from "../../utils/index.js";
import TextPanel from "./TextPanel.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

function Host({ provider }: { readonly provider: Provider }) {
  const group = useQueryGroup({ provider });
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, "name"),
    [],
  );
  const conjuncts = useDataViewsValue(group.state, select, isSameConjuncts);
  return (
    <TextPanel
      definition={{ field: "name", kind: "text" }}
      label="name"
      conjuncts={conjuncts}
      group={group}
      named={false}
      onCommit={vi.fn()}
      onInvalid={vi.fn()}
    />
  );
}

describe("TextPanel", () => {
  it("offers one input per operator, each committing its own clause", () => {
    const provider = createQuickFilterProvider({
      query: "name__startsWith=ex",
    }) as unknown as Provider;
    render(
      <DataViews provider={provider}>
        <Host provider={provider} />
      </DataViews>,
    );
    expect(
      screen.getByRole("textbox", { name: "name starts with" }),
    ).toHaveValue("ex");
    const contains = screen.getByRole("textbox", { name: "name contains" });
    expect(contains).toHaveValue("");
    fireEvent.change(contains, { target: { value: "host-1" } });
    fireEvent.keyDown(contains, { key: "Enter" });
    expect(provider.state.get().slice.filter).toEqual(
      expect.arrayContaining([
        { field: "name", operator: "contains", operands: ["host-1"] },
        { field: "name", operator: "startsWith", operands: ["ex"] },
      ]),
    );
  });
});
