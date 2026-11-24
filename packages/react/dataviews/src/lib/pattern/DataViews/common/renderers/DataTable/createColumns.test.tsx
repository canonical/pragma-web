import {
  createArraySource,
  createCollection,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, onTestFinished } from "vitest";
import {
  buildMachine,
  createMachineProvider,
  createWorkloadProvider,
  machines,
} from "../../../../../../../testing/index.js";
import { readColumnRegistry } from "../../../../../utils/index.js";
import createColumns from "./createColumns.js";
import DataTable from "./DataTable.js";

describe("createColumns", () => {
  describe("each column", () => {
    it("takes its field as its id unless given one", () => {
      const columns = createColumns({
        collection: machines,
        columns: [
          { field: "name", header: "Name" },
          { field: "cores", id: "power", header: "Power" },
        ],
      });
      expect(columns).toEqual([
        { field: "name", id: "name", header: "Name" },
        { field: "cores", id: "power", header: "Power" },
      ]);
    });

    it("keeps the members it is given, and no others", () => {
      const [column] = createColumns({
        collection: machines,
        columns: [
          {
            field: "cores",
            header: "Cores",
            sizing: { kind: "fixed", px: 80 },
            hideable: false,
            sortable: true,
            resizable: true,
          },
        ],
      });
      expect(column).toEqual({
        field: "cores",
        id: "cores",
        header: "Cores",
        sizing: { kind: "fixed", px: 80 },
        hideable: false,
        sortable: true,
        resizable: true,
      });
    });

    it("hands a column's own content its field's value at its type", () => {
      const { provider } = createMachineProvider({
        rows: [buildMachine("m-1", "alpha")],
      });
      onTestFinished(provider.observe());
      const columns = createColumns({
        collection: machines,
        columns: [
          {
            field: "cores",
            header: "Threads",
            cell: ({ value, record }) => `${value * 2} for ${record.name}`,
          },
        ],
      });
      render(<DataTable provider={provider} columns={columns} label="Fleet" />);
      expect(screen.getByRole("cell")).toHaveTextContent("8 for alpha");
    });

    it("hands a scoped field's content no value where the field does not apply", () => {
      const { provider } = createWorkloadProvider();
      onTestFinished(provider.observe());
      const columns = createColumns({
        collection: provider.collection,
        columns: [
          {
            field: "cores",
            header: "Cores",
            cell: ({ value }) =>
              value === undefined ? "idle" : value.toFixed(1),
          },
        ],
      });
      render(<DataTable provider={provider} columns={columns} label="Fleet" />);
      expect(
        screen.getAllByRole("cell").map((cell) => cell.textContent),
      ).toEqual(["idle", "4.0"]);
    });

    it("hands a key read through an index signature no value where a record lacks it", () => {
      const pods = createCollection({
        identify: (pod: { id: string; labels: Record<string, string> }) =>
          pod.id,
        fields: [{ field: "labels.team", kind: "text" }],
      });
      const provider = createDataViewsProvider({
        collection: pods,
        source: createArraySource({
          rows: [
            { id: "a", labels: { team: "core" } },
            { id: "b", labels: {} },
          ],
          collection: pods,
        }),
      });
      onTestFinished(provider.observe());
      const columns = createColumns({
        collection: pods,
        columns: [
          {
            field: "labels.team",
            header: "Team",
            cell: ({ value }) =>
              value === undefined ? "unowned" : value.toUpperCase(),
          },
        ],
      });
      render(<DataTable provider={provider} columns={columns} label="Pods" />);
      expect(
        screen.getAllByRole("cell").map((cell) => cell.textContent),
      ).toEqual(["CORE", "unowned"]);
    });

    it("takes a column over no field, handed its record", () => {
      const { provider } = createMachineProvider({
        rows: [buildMachine("m-1", "alpha")],
      });
      onTestFinished(provider.observe());
      const columns = createColumns({
        collection: machines,
        columns: [
          {
            id: "actions",
            header: "Actions",
            cell: ({ record }) => `Restart ${record.name}`,
          },
        ],
      });
      expect(columns.at(0)).not.toHaveProperty("field");
      render(<DataTable provider={provider} columns={columns} label="Fleet" />);
      expect(screen.getByRole("cell")).toHaveTextContent("Restart alpha");
    });

    it("throws for two columns sharing an id", () => {
      expect(() =>
        createColumns({
          collection: machines,
          columns: [
            { field: "name", header: "Name" },
            { field: "name", header: "Host" },
          ],
        }),
      ).toThrow(
        'createColumns names two columns "name"; give the second an id of its own',
      );
    });

    it("throws for an extra column whose id names a field", () => {
      expect(() =>
        createColumns({
          collection: machines,
          columns: [{ id: "cores", header: "Load", cell: () => "busy" }],
        }),
      ).toThrow(
        'createColumns names an extra column "cores", a field of the collection; give it the field or another id',
      );
    });
  });

  describe("the list", () => {
    it("is frozen, as is each column", () => {
      const columns = createColumns({
        collection: machines,
        columns: [{ field: "name", header: "Name" }],
      });
      expect(Object.isFrozen(columns)).toBe(true);
      expect(Object.isFrozen(columns.at(0))).toBe(true);
    });

    it("is registered against its collection", () => {
      const columns = createColumns({
        collection: machines,
        columns: [{ field: "name", header: "Name" }],
      });
      expect(readColumnRegistry().get(columns)).toBe(machines);
    });
  });
});
