/**
 * The frame around the table: the caller's box, holding the table, a footer
 * beneath it and outside the table role, and a standalone table's announcer.
 */
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { act, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import expectNoAxeViolations from "../../../../testing/expectNoAxeViolations.js";
import { deliverRows } from "../../../../testing/fixtures.js";
import {
  createInstanceProvider,
  MIXED_FLEET,
} from "../../../../testing/instances.js";
import {
  createMachineProvider,
  type Machine,
  machine,
} from "../../../../testing/machines.js";
import DataTable from "./DataTable.js";
import type { DataTableColumn } from "./types.js";

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
];

const rows: readonly Machine[] = [machine("m-1", "alpha")];

/** The frame around the one table on screen. */
const frameOf = (): HTMLElement => {
  const frame = screen.getByRole("table", { name: "Machines" }).parentElement;
  if (frame === null) {
    throw new Error("the table stands in no frame");
  }
  return frame;
};

describe("DataTable", () => {
  describe("the table's frame", () => {
    it("holds the table, and nothing of the table's own", () => {
      const { provider } = createMachineProvider({ rows });
      render(
        <DataTable provider={provider} columns={columns} label="Machines" />,
      );
      const frame = frameOf();
      expect(frame).toHaveClass("ds", "data-table", "dense");
      expect(frame).not.toHaveAttribute("role");
      expect(frame.querySelector(":scope > .footer")).toBeNull();
      // The table's children are its row groups: nothing else stands in it.
      expect(
        [...screen.getByRole("table").children].map((child) =>
          child.getAttribute("role"),
        ),
      ).toEqual(["rowgroup", "rowgroup"]);
    });

    it("places the footer beneath the table, outside its role", () => {
      const { provider } = createMachineProvider({ rows });
      render(
        <DataTable
          provider={provider}
          columns={columns}
          label="Machines"
          footer={<nav aria-label="Pages">pages</nav>}
        />,
      );
      const frame = frameOf();
      const footer = frame.querySelector(":scope > .footer");
      expect(footer).toContainElement(
        screen.getByRole("navigation", { name: "Pages" }),
      );
      // After the table, and not among its rows.
      expect(screen.getByRole("table").nextElementSibling).toBe(footer);
      expect(
        within(screen.getByRole("table")).queryByRole("navigation"),
      ).toBeNull();
    });

    it("places a standalone table's announcer in the frame, after the footer", () => {
      const { provider } = createMachineProvider({ rows });
      render(
        <DataTable
          provider={provider}
          columns={columns}
          label="Machines"
          footer={<p>pages</p>}
        />,
      );
      const frame = frameOf();
      const announcer = frame.querySelector(".ds.data-views-announcer");
      expect(announcer).not.toBeNull();
      expect(frame.querySelector(":scope > .footer")?.nextElementSibling) //
        .toBe(announcer);
    });

    it("has no axe violation with a footer", async () => {
      const { provider } = createMachineProvider({ rows });
      const { container } = render(
        <DataTable
          provider={provider}
          columns={columns}
          label="Machines"
          footer={<nav aria-label="Pages">pages</nav>}
        />,
      );
      await expectNoAxeViolations(container);
    });
  });

  /** A provider over the instance collection. */
  type InstanceProvider = ReturnType<typeof createInstanceProvider>["provider"];

  describe("records of several types, rendered on the server", () => {
    const typed = [
      { id: "name", header: "Name", rowHeader: true },
      { id: "image", header: "Image", sortable: true },
    ];

    const build = (provider: InstanceProvider) => (
      <DataTable
        provider={provider}
        columns={typed}
        label="Instances"
        selectable
        footer={<nav aria-label="Pages">pages</nav>}
      />
    );

    /** A provider holding its rows, as a server does: nothing observes it. */
    const holding = (): InstanceProvider => {
      const { provider } = createInstanceProvider();
      const host = readProviderHost(provider);
      host.complete(host.refresh(), deliverRows(MIXED_FLEET));
      return provider;
    };

    it("hydrates without a mismatch", async () => {
      const container = document.createElement("div");
      container.innerHTML = renderToString(build(holding()));
      document.body.append(container);
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      const root = await act(async () =>
        hydrateRoot(container, build(holding())),
      );
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
        container.remove();
        errors.mockRestore();
      });
      expect(errors).not.toHaveBeenCalled();
      expect(
        within(container).getByRole("row", { name: "db-01" }),
      ).toBeInTheDocument();
    });
  });
});
