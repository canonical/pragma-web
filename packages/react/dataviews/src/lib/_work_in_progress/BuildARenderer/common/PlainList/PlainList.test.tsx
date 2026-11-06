import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createMachineProvider,
  machine,
} from "../../../../../../testing/machines.js";
import PlainList from "./PlainList.js";

const rows = [machine("m-1", "alpha"), machine("m-2", "beta")];

describe("PlainList", () => {
  it("lists the provider's rows by name, under its label", () => {
    const { provider } = createMachineProvider({ rows });
    render(
      <PlainList
        provider={provider}
        label="Machines"
        nameRecord={(record) => record.name}
      />,
    );
    const items = within(
      screen.getByRole("list", { name: "Machines" }),
    ).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["alpha", "beta"]);
  });

  it("observes the provider while mounted, and stops on unmount", () => {
    const { provider, source } = createMachineProvider();
    const view = render(
      <PlainList
        provider={provider}
        label="Machines"
        nameRecord={(record) => record.name}
      />,
    );
    expect(source.calls).toHaveLength(1);
    view.unmount();
    expect(source.latest().releases).toBe(1);
  });
});
