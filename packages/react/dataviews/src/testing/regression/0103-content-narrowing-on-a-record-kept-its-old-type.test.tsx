/**
 * A column's own content is handed its record to narrow on the record's
 * type. The content rendered again when its own field moved or its
 * applicability did; a record returning under its id as another type, in a
 * column whose field applies to both types, moved neither, so the content
 * kept narrowing on the old type.
 *
 * A cell is drawn afresh when its record's type moves, in a table and on a
 * card alike.
 */

import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import {
  buildContainer,
  buildVirtualMachine,
  createInstanceProvider,
  type Instance,
  instances,
} from "../../../testing/instances.js";
import { Cards } from "../../lib/_work_in_progress/Cards/index.js";
import createColumns from "../../lib/_work_in_progress/DataTable/createColumns.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const columns = createColumns(instances, [
  { field: "name", header: "Name", rowHeader: true },
  {
    id: "kind",
    field: "status",
    header: "Kind",
    // Applies to both types; narrows on the record's.
    cell: ({ record }) => <>{record.type}</>,
  },
]);

const answeredByHand = () => {
  const { provider, source } = createInstanceProvider();
  const deliver = (rows: readonly Instance[]) => {
    act(() => {
      source.latest().deliver({ status: "succeeded", page: pageOf(rows) });
    });
  };
  const moveType = () => {
    deliver([buildContainer("i-1", "host-01")]);
    act(() => {
      provider.refresh();
    });
    deliver([buildVirtualMachine("i-1", "host-01")]);
  };
  return { provider, moveType };
};

describe("content narrowing on a record whose type moves", () => {
  it("narrows on the new type in a table", () => {
    const { provider, moveType } = answeredByHand();
    render(
      <DataTable provider={provider} columns={columns} label="Instances" />,
    );
    moveType();
    expect(
      within(screen.getByRole("row", { name: "host-01" })).getByRole("cell"),
    ).toHaveTextContent(/^virtual-machine$/);
  });

  it("narrows on the new type on a card", () => {
    const { provider, moveType } = answeredByHand();
    render(
      <Cards
        provider={provider}
        fields={columns}
        title="name"
        label="Instances"
      />,
    );
    moveType();
    expect(
      within(screen.getByRole("listitem", { name: "host-01" }))
        .getAllByRole("definition")
        .at(0),
    ).toHaveTextContent(/^virtual-machine$/);
  });
});
