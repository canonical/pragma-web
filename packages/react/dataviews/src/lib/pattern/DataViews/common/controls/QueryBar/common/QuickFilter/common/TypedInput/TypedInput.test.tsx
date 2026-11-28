/**
 * One typed value of a quick filter's panel, over the hosts' text field:
 * what applies shown, committed on Enter or on leaving, removed when
 * emptied.
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
import TypedInput from "./TypedInput.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** The `name contains` value, reading the field's conjuncts. */
function Host({
  provider,
  named,
}: {
  readonly provider: Provider;
  readonly named: boolean;
}) {
  const group = useQueryGroup(provider);
  const select = useMemo(
    () => (state: QueryStateStandIn) => listFieldConjuncts(state, "name"),
    [],
  );
  const conjuncts = useDataViewsValue(group.state, {
    select: select,
    isEqual: isSameConjuncts,
  });
  return (
    <TypedInput
      definition={{ field: "name", kind: "text" }}
      operator="contains"
      label="name contains"
      standing={conjuncts.find(({ ref }) => ref.operator === "contains")}
      hintId="hint"
      group={group}
      named={named}
      onCommit={vi.fn()}
      onInvalid={vi.fn()}
    />
  );
}

const mount = (query?: string, named = false) => {
  const provider = createQuickFilterProvider(
    query === undefined ? {} : { query },
  ) as unknown as Provider;
  render(
    <DataViews provider={provider}>
      <p id="hint">A hint</p>
      <Host provider={provider} named={named} />
    </DataViews>,
  );
  return provider;
};

const findInput = () =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "name contains" });

describe("TypedInput", () => {
  it("abandons what is typed on Escape: the blur after commits nothing", () => {
    const provider = mount("name__contains=web");
    fireEvent.change(findInput(), { target: { value: "host-9" } });
    fireEvent.keyDown(findInput(), { key: "Escape" });
    expect(findInput()).toHaveValue("web");
    fireEvent.blur(findInput());
    expect(provider.state.get().slice.filter).toEqual([
      { field: "name", operator: "contains", operands: ["web"] },
    ]);
    // What is typed after commits again.
    fireEvent.change(findInput(), { target: { value: "host-1" } });
    fireEvent.blur(findInput());
    expect(provider.state.get().slice.filter).toEqual([
      { field: "name", operator: "contains", operands: ["host-1"] },
    ]);
  });

  it("shows what applies at its address, described by its hint", () => {
    mount("name__contains=web");
    expect(findInput()).toHaveValue("web");
    expect(findInput()).toHaveAccessibleDescription("A hint");
    expect(findInput()).not.toHaveAttribute("inputmode");
  });

  it("names itself as the wire spells its clause, where asked", () => {
    mount(undefined, true);
    expect(findInput()).toHaveAttribute("name", "name__contains");
  });

  it("commits on Enter, and removes the value once emptied", () => {
    const provider = mount();
    fireEvent.change(findInput(), { target: { value: "host-1" } });
    fireEvent.keyDown(findInput(), { key: "Enter" });
    expect(provider.state.get().slice.filter).toEqual([
      { field: "name", operator: "contains", operands: ["host-1"] },
    ]);
    fireEvent.change(findInput(), { target: { value: "" } });
    fireEvent.blur(findInput());
    expect(provider.state.get().slice.filter).toEqual([]);
  });
});
