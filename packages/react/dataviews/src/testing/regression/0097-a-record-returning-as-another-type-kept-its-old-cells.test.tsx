/**
 * A row and a card read their record without subscribing to it, to decide
 * which of their fields apply, on the grounds that a record's type never
 * changes under its id. The row scopes replace a record in place, though, so
 * a record returning as another type updated its fields' channels and left
 * its row — which re-renders for none of them — drawing the old type's
 * applicability: a dash where the new type carries a value, or a value where
 * it carries none.
 *
 * A row and a card watch the record's type, and render again when it moves.
 */
import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  container,
  createInstanceProvider,
  type Instance,
  virtualMachine,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const columns = [
  { id: "name", header: "Name", rowHeader: true },
  { id: "image", header: "Image" },
];

/** A provider answered by hand, and a delivery of one page of instances. */
const answeredByHand = () => {
  const { provider, source } = createInstanceProvider();
  const deliver = (rows: readonly Instance[]) => {
    act(() => {
      source.latest().deliver({ status: "succeeded", page: pageOf(rows) });
    });
  };
  const refresh = () => {
    act(() => {
      provider.refresh();
    });
  };
  return { provider, deliver, refresh };
};

describe("a record returning under its id as another type", () => {
  it("redraws a table row's applicability", () => {
    const { provider, deliver, refresh } = answeredByHand();
    render(
      <DataTable provider={provider} columns={columns} label="Instances" />,
    );
    deliver([virtualMachine("i-1", "host-01")]);
    const image = () =>
      within(screen.getByRole("row", { name: "host-01" })).getByRole("cell");
    expect(image()).toHaveAccessibleName("Not applicable");
    refresh();
    deliver([container("i-1", "host-01", "ubuntu:24.04")]);
    expect(image()).toHaveTextContent(/^ubuntu:24\.04$/);
  });

  it("redraws a card's applicability", () => {
    const { provider, deliver, refresh } = answeredByHand();
    render(
      <Cards
        provider={provider}
        fields={columns}
        title="name"
        label="Instances"
      />,
    );
    deliver([container("i-1", "host-01", "ubuntu:24.04")]);
    const image = () =>
      within(screen.getByRole("listitem", { name: "host-01" }))
        .getAllByRole("definition")
        .at(0);
    expect(image()).toHaveTextContent(/^ubuntu:24\.04$/);
    refresh();
    deliver([virtualMachine("i-1", "host-01")]);
    expect(image()).toHaveTextContent(/^—Not applicable$/);
  });
});
