import type { SourceDelivery } from "@canonical/dataviews-core";
import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../../../../testing/fixtures.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../../../testing/machines.js";
import StatusList from "./StatusList.js";

const failure: SourceDelivery<Machine> = {
  status: "failed",
  failure: { reason: "offline", cause: null, transient: null },
};

/** A list over a source the test answers by hand. */
const renderList = (messages?: { statusPending: string }) => {
  const fixture = createMachineProvider();
  render(
    <StatusList
      provider={fixture.provider}
      label="Machines"
      nameRecord={(record) => record.name}
      {...(messages === undefined ? {} : { messages })}
    />,
  );
  return fixture;
};

const readNames = (): readonly (string | null)[] =>
  within(screen.getByRole("region", { name: "Machines" }))
    .queryAllByRole("listitem")
    .map((item) => item.textContent);

describe("StatusList", () => {
  it("is busy and says it is loading until the first page arrives", () => {
    const { source } = renderList();
    const region = screen.getByRole("region", { name: "Machines" });
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveTextContent("Loading…");
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([machine("m-1", "alpha")]),
      });
    });
    expect(region).toHaveAttribute("aria-busy", "false");
    expect(readNames()).toEqual(["alpha"]);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("says its status in the application's words", () => {
    renderList({ statusPending: "Chargement…" });
    expect(screen.getByRole("region", { name: "Machines" })).toHaveTextContent(
      "Chargement…",
    );
  });

  it("says a failure in place of the rows", () => {
    const { source } = renderList();
    act(() => {
      source.latest().deliver(failure);
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows could not be loaded: offline",
    );
    expect(readNames()).toEqual([]);
  });

  it("keeps the rows under a failed refresh", () => {
    const { provider, source } = renderList();
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([machine("m-1", "alpha")]),
      });
    });
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver(failure);
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "These rows could not be refreshed: offline",
    );
    expect(readNames()).toEqual(["alpha"]);
  });
});
