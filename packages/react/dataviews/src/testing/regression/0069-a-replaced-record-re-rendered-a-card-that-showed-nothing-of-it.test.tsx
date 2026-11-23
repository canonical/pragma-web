/**
 * Every card subscribed to its whole record to name itself, though a card
 * names itself by its title field unless the caller names it. A page arriving
 * with the same values in fresh objects then re-rendered every card, for a
 * change no card showed. The record is read as the name itself, so a record
 * replaced without changing what it is called re-renders nothing.
 */

import { buildPage } from "@canonical/dataviews-core/testing";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildMachine, createMachineProvider } from "../../../testing/index.js";
import { DataCards } from "../../lib/_work_in_progress/DataCards/index.js";
import type {
  DisplayField,
  DisplayFieldCellProps,
} from "../../lib/common/index.js";

describe("regression 0069 — a replaced record re-rendered a card that showed nothing of it", () => {
  it("re-renders no card that shows nothing of what changed", () => {
    const renders: string[] = [];
    const Probe = ({ rowId }: DisplayFieldCellProps) => {
      renders.push(rowId);
      return null;
    };
    const fields: readonly DisplayField[] = [
      { id: "name", header: "Name" },
      { id: "probe", header: "Probe", field: "status", cell: Probe },
    ];
    const { provider, source } = createMachineProvider();
    render(
      <DataCards
        provider={provider}
        fields={fields}
        title="name"
        label="Machines"
      />,
    );
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m-1", "alpha")]),
      });
    });
    expect(renders).toEqual(["m-1"]);
    renders.length = 0;

    act(() => {
      provider.refresh();
    });
    act(() => {
      // The same machine, in a new object: nothing a card shows has moved.
      source.readLatest().deliver({
        status: "succeeded",
        page: buildPage([buildMachine("m-1", "alpha")]),
      });
    });
    expect(renders).toEqual([]);
    expect(screen.getByRole("listitem", { name: "alpha" })).toBeInTheDocument();
  });
});
