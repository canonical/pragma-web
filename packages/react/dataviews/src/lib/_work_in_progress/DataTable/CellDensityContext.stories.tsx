import { Badge, Button } from "@canonical/react-ds-global";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { expect, waitFor } from "storybook/test";
import { withAppScope } from "../../../storybook/decorators.js";
import readHostName from "../../../storybook/machines/readHostName.js";
import useMachineProvider from "../../../storybook/machines/useMachineProvider.js";
import { DataTable, type DataTableColumn } from "./index.js";

function CellContent() {
  const [targets, setTargets] = useState<Element[]>([]);
  const content = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const fixture = content.current?.closest("[data-cell-context-fixture]");
    if (fixture)
      setTargets(Array.from(fixture.querySelectorAll("[data-portal-target]")));
  }, []);
  return (
    <span ref={content}>
      <Button>Action</Button>
      <Badge value={3} />
      {targets.map((target) =>
        createPortal(
          <span
            data-portal-probe={target.getAttribute("data-portal-target")}
          />,
          target,
        ),
      )}
    </span>
  );
}

const columns: readonly DataTableColumn[] = [
  { id: "name", header: "Host", cell: CellContent },
];

function Fixture() {
  const provider = useMachineProvider();
  return (
    <div
      className="site"
      data-cell-context-fixture=""
      style={
        { "--_spacing-inset-control-block-dense": "11px" } as CSSProperties
      }
    >
      <DataTable
        provider={provider}
        columns={columns}
        label="Machines"
        rowLabel={readHostName}
      />
      <div data-portal-target="outside" />
      <table>
        <tbody>
          <tr>
            <td>
              <div data-portal-target="cell" />
            </td>
            <td>
              <div className="site" data-portal-target="boundary" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const meta = {
  title: "_work_in_progress/DataViews/Cell density context",
  component: Fixture,
  decorators: [withAppScope],
} satisfies Meta<typeof Fixture>;
export default meta;
type Story = StoryObj<typeof Fixture>;

export const Selection: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.dataset["densityProof"] = "running";
    try {
      await waitFor(() =>
        expect(
          canvasElement.querySelector('[role="columnheader"]'),
        ).not.toBeNull(),
      );
      const value = (element: Element | null) => {
        if (!element) throw new Error("missing density fixture");
        return getComputedStyle(element)
          .getPropertyValue("--_density-inset-control-block")
          .trim();
      };
      expect(value(canvasElement.querySelector('[role="columnheader"]'))).toBe(
        "11px",
      );
      await waitFor(() =>
        expect(
          canvasElement.querySelector(".ds.data-table-body-cell"),
        ).not.toBeNull(),
      );
      expect(
        value(canvasElement.querySelector(".ds.data-table-body-cell")),
      ).toBe("11px");
      await waitFor(() =>
        expect(
          canvasElement.querySelector('[data-portal-probe="cell"]'),
        ).not.toBeNull(),
      );
      expect(
        value(canvasElement.querySelector('[data-portal-probe="cell"]')),
      ).toBe("11px");
      expect(
        value(canvasElement.querySelector('[data-portal-probe="outside"]')),
      ).not.toBe("11px");
      expect(
        value(canvasElement.querySelector('[data-portal-probe="boundary"]')),
      ).not.toBe("11px");
      const cell = canvasElement.querySelector<HTMLElement>(
        ".ds.data-table-body-cell",
      );
      const button = cell?.querySelector("button");
      const badge = cell?.querySelector(".ds.badge");
      if (!cell || !button || !badge) throw new Error("missing controls");
      const geometry = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return [
          rect.width,
          rect.height,
          style.paddingBlockStart,
          style.paddingBlockEnd,
        ];
      };
      const before = [geometry(button), geometry(badge)];
      const originalStyle = cell.getAttribute("style");
      try {
        cell.style.setProperty("--_spacing-inset-control-block-dense", "13px");
        expect(value(cell)).toBe("13px");
        expect([geometry(button), geometry(badge)]).toEqual(before);
      } finally {
        if (originalStyle === null) cell.removeAttribute("style");
        else cell.setAttribute("style", originalStyle);
      }
      const cells = canvasElement.querySelectorAll(".ds.data-table-body-cell");
      const headers = canvasElement.querySelectorAll(
        ".ds.data-table-header-cell",
      );
      expect(headers.length).toBeGreaterThan(0);
      for (const actualCell of [...cells, ...headers])
        expect(value(actualCell)).toBe("11px");
      const paths = ["outside", "cell", "boundary"] as const;
      for (const path of paths) {
        const probes = canvasElement.querySelectorAll(
          `[data-portal-probe="${path}"]`,
        );
        expect(probes.length).toBe(cells.length);
        for (const probe of probes) {
          if (path === "cell") expect(value(probe)).toBe("11px");
          else expect(value(probe)).not.toBe("11px");
        }
      }
      canvasElement.dataset["densityCells"] = String(cells.length);
      canvasElement.dataset["densityHeaders"] = String(headers.length);
      canvasElement.dataset["densityPortalProbes"] = String(
        canvasElement.querySelectorAll("[data-portal-probe]").length,
      );
      canvasElement.dataset["densityPortalPaths"] = String(paths.length);
      canvasElement.dataset["densityForcedColors"] = String(
        matchMedia("(forced-colors: active)").matches,
      );
      canvasElement.dataset["densityProof"] = "pass";
    } catch (error) {
      canvasElement.dataset["densityProof"] = "error";
      canvasElement.dataset["densityError"] = String(error);
      throw error;
    }
  },
};
