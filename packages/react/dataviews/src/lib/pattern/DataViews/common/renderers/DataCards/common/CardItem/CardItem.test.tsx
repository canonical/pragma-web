import type {
  DataViewsProvider,
  SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  createWorkloadProvider,
  silenceRenderErrors,
} from "../../../../../../../../../testing/index.js";
import CardItem from "./CardItem.js";

/** A provider answered with one machine, m-1. */
const createAlpha = () =>
  createMachineProvider({
    rows: [buildMachine("m-1", "alpha", "failed", 8)],
  }).provider;

/**
 * The provider and the channels of its row over the observed fields,
 * released when the test finishes.
 *
 * @note Impure: observes the provider and its row scopes.
 */
const observeRow = <
  TFields extends readonly SchemaFieldDefinition[],
  TRow extends object,
>({
  fields,
  provider,
  rowId = "m-1",
}: {
  readonly fields: readonly string[];
  readonly provider: DataViewsProvider<TFields, TRow>;
  readonly rowId?: string;
}) => {
  const releaseProvider = provider.observe();
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields,
  });
  const releaseScopes = scopes.observe();
  onTestFinished(() => {
    releaseScopes();
    releaseProvider();
  });
  return { provider, channels: scopes.readRow(rowId) };
};

describe("CardItem", () => {
  it("is a list item named by its title, holding its title and its details", () => {
    const { provider, channels } = observeRow({
      fields: ["name", "status"],
      provider: createAlpha(),
    });
    render(
      <ul>
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "name", header: "Name" }}
          details={[{ id: "status", header: "Status" }]}
          selectable={false}
          nameRecord={() => null}
        />
      </ul>,
    );
    const card = screen.getByRole("listitem", { name: "alpha" });
    expect(card).toHaveClass("ds", "card", "data-card");
    expect(card.querySelector(".header")).toHaveTextContent("alpha");
    expect(card.querySelector(".content dd")).toHaveTextContent("failed");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("toggles its record's selection from its checkbox, named by the caller's label", () => {
    const { provider, channels } = observeRow({
      fields: ["name"],
      provider: createAlpha(),
    });
    render(
      <ul>
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "name", header: "Name" }}
          details={[]}
          selectable
          nameRecord={(row, rowId) => `${row.name} (${rowId})`}
        />
      </ul>,
    );
    const checkbox = screen.getByRole("checkbox", {
      name: "Select alpha (m-1)",
    });
    fireEvent.click(checkbox);
    expect([...provider.selection.state.get().ids]).toEqual(["m-1"]);
    expect(checkbox).toBeChecked();
    act(() => {
      provider.selection.clear();
    });
    expect(checkbox).not.toBeChecked();
  });

  it("names a card by its identity where the caller's label is blank", () => {
    const { provider, channels } = observeRow({
      fields: ["name"],
      provider: createAlpha(),
    });
    render(
      <ul>
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "name", header: "Name" }}
          details={[]}
          selectable={false}
          nameRecord={() => " "}
        />
      </ul>,
    );
    expect(screen.getByRole("listitem", { name: "m-1" })).toBeInTheDocument();
  });

  it("names a card by its identity where its title does not apply", () => {
    const { provider, channels } = observeRow({
      fields: ["image"],
      provider: createWorkloadProvider().provider,
      rowId: "w-2",
    });
    render(
      <ul>
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "image", header: "Image" }}
          details={[]}
          selectable={false}
          nameRecord={() => null}
        />
      </ul>,
    );
    expect(screen.getByRole("listitem", { name: "w-2" })).toBeInTheDocument();
  });

  it("throws when its title's field is not observed", () => {
    silenceRenderErrors();
    const { provider, channels } = observeRow({
      fields: ["status"],
      provider: createAlpha(),
    });
    expect(() =>
      render(
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "name", header: "Name" }}
          details={[]}
          selectable={false}
          nameRecord={() => null}
        />,
      ),
    ).toThrow('no channel observes the field "name"');
  });

  it("passes native props to its card", () => {
    const { provider, channels } = observeRow({
      fields: ["name"],
      provider: createAlpha(),
    });
    render(
      <ul>
        <CardItem
          provider={provider}
          readApplicability={readProviderHost(provider).readApplicability}
          channels={channels}
          title={{ id: "name", header: "Name" }}
          details={[]}
          selectable={false}
          nameRecord={() => null}
          id="probe"
        />
      </ul>,
    );
    expect(screen.getByRole("listitem", { name: "alpha" })).toHaveAttribute(
      "id",
      "probe",
    );
  });
});
