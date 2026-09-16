/**
 * A row's selection cell subscribed to its whole record, to name its
 * checkbox, and to it a second time where no column is the row header —
 * though with no row label given it read nothing from the record at all.
 * Any field of the row moving rendered its checkbox again.
 *
 * The cell reads the name it needs through a selector, so it renders again
 * only when that name changes.
 */

import { act, render } from "@testing-library/react";
import { type ComponentProps, createElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { pageOf } from "../../../testing/fixtures.js";
import { createMachineProvider, machine } from "../../../testing/machines.js";
import { DataTable } from "../../lib/_work_in_progress/DataTable/index.js";

const renders = vi.hoisted(() => ({ names: [] as string[] }));

vi.mock("@canonical/react-ds-global-form", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@canonical/react-ds-global-form")>();
  return {
    ...actual,
    CheckboxInput: (
      props: ComponentProps<typeof actual.CheckboxInput>,
    ): ReactElement => {
      renders.names.push(String(props["aria-label"]));
      return createElement(actual.CheckboxInput, props);
    },
  };
});

describe("a field of a selectable row moving", () => {
  it("renders the row's checkbox again for no field it does not name the row by", () => {
    const { provider, source } = createMachineProvider();
    render(
      <DataTable
        provider={provider}
        columns={[
          { id: "name", header: "Name", rowHeader: true },
          { id: "status", header: "Status" },
        ]}
        label="Machines"
        selectable
      />,
    );
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([machine("m-1", "alpha", "running")]),
      });
    });
    renders.names.length = 0;
    act(() => {
      provider.refresh();
    });
    act(() => {
      source.latest().deliver({
        status: "succeeded",
        page: pageOf([machine("m-1", "alpha", "failed")]),
      });
    });
    expect(renders.names.filter((name) => name === "Select alpha")).toEqual([]);
  });
});
