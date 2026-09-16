/**
 * The checkbox of a row a column heads: named by the caller where it gave a
 * name, by the header's text otherwise, and by the row's identity where that
 * text is blank.
 */
import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import { deliverRows } from "../../../../../../../../testing/fixtures.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../../../../../testing/machines.js";
import HeaderNamedCheckbox from "./HeaderNamedCheckbox.js";

/** One machine row's channels over its name, with a way to rename it. */
const rowOf = () => {
  const { provider } = createMachineProvider();
  const host = readProviderHost(provider);
  const publish = (rows: readonly Machine[]) => {
    host.complete(host.refresh(), deliverRows(rows));
  };
  publish([machine("m-1", "alpha")]);
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: ["name"],
  });
  onTestFinished(scopes.observe());
  const channels = scopes.readRow("m-1");
  const header = channels.fields["name"];
  if (header === undefined) {
    throw new Error("the name field is observed");
  }
  return { provider, channels, header, publish };
};

describe("HeaderNamedCheckbox", () => {
  it("names the row by the header's text, following it, and by its id when blank", () => {
    const { provider, channels, header, publish } = rowOf();
    render(
      <HeaderNamedCheckbox
        provider={provider}
        channels={channels}
        selected={false}
        channel={header}
        named={null}
      />,
    );
    expect(screen.getByRole("checkbox")).toHaveAccessibleName("Select alpha");
    act(() => {
      publish([machine("m-1", "  ")]);
    });
    expect(screen.getByRole("checkbox")).toHaveAccessibleName("Select m-1");
  });

  it("names the row by the caller's name over the header's text", () => {
    const { provider, channels, header } = rowOf();
    render(
      <HeaderNamedCheckbox
        provider={provider}
        channels={channels}
        selected={false}
        channel={header}
        named="the alpha host"
      />,
    );
    expect(screen.getByRole("checkbox")).toHaveAccessibleName(
      "Select the alpha host",
    );
  });
});
