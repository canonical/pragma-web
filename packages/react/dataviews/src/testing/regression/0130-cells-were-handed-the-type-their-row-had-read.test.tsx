/**
 * A cell and a card's value were handed their record's type as a prop, read
 * by the row or the card from a reader its renderer passed down, so content
 * drew again when a record returned as another type only by way of every
 * layer above it passing the type on.
 *
 * A cell and a value subscribe to the row's own `type` channel.
 */

import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  buildContainer,
  buildVirtualMachine,
  createInstanceProvider,
  type Instance,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";
import type { DisplayFieldCellProps } from "../../lib/common/index.js";

/** Content naming the record's type beside a value that does not move. */
const TypeOf = ({ record }: DisplayFieldCellProps) => (
  <span data-testid="type">{(record as Instance).type}</span>
);

const fields = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status", cell: TypeOf },
];

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

describe("content reading its record's type", () => {
  it("draws the new type in a table cell and on a card", () => {
    const { provider, deliver, refresh } = answeredByHand();
    render(
      <>
        <DataTable provider={provider} columns={fields} label="Instances" />
        <Cards
          provider={provider}
          fields={fields}
          title="name"
          label="Instances"
        />
      </>,
    );
    deliver([buildContainer("i-1", "host-01")]);
    const types = () =>
      screen.getAllByTestId("type").map((node) => node.textContent);
    expect(types()).toEqual(["container", "container"]);
    refresh();
    // The same status and name: only the type moved.
    deliver([buildVirtualMachine("i-1", "host-01")]);
    expect(types()).toEqual(["virtual-machine", "virtual-machine"]);
  });
});
