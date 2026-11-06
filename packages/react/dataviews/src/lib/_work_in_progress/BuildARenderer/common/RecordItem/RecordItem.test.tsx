import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import {
  createRowScopes,
  resolveMessages,
} from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { machine, machines } from "../../../../../../testing/machines.js";
import RecordItem from "./RecordItem.js";

const english = resolveMessages();

/** One record's channels, over a provider holding it. */
const readChannels = () => {
  const provider = createDataViewsProvider({
    collection: machines,
    source: createArraySource({
      rows: [machine("m-1", "alpha")],
      collection: machines,
    }),
  });
  // Unobserved, an array source answers within the call.
  provider.refresh();
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: [],
  });
  return { provider, scopes, channels: scopes.readRow("m-1") };
};

describe("RecordItem", () => {
  it("lists the record by name, without a checkbox unless selectable", () => {
    const { provider, channels } = readChannels();
    render(
      <ul>
        <RecordItem
          channels={channels}
          selection={provider.selection}
          nameRecord={(record) => record.name}
          selectable={false}
          messages={english}
        />
      </ul>,
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("alpha");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("toggles the record's selection from its checkbox", () => {
    const { provider, scopes, channels } = readChannels();
    const detach = scopes.observe();
    render(
      <ul>
        <RecordItem
          channels={channels}
          selection={provider.selection}
          nameRecord={(record) => record.name}
          selectable
          messages={english}
        />
      </ul>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Select alpha" });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    act(() => {
      provider.selection.clear();
    });
    expect(checkbox).not.toBeChecked();
    detach();
  });
});
