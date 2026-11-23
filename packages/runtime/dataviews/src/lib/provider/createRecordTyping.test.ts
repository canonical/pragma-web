/**
 * Record typing is what a polymorphic collection knows about its types at
 * runtime: which fields apply to which type, and what type each selected
 * identity was displayed as. The declaration itself is the collection's
 * and is tested with it. Every case is mutation-tested — dropping the scope
 * index or the memory's prune fails one.
 */
import { describe, expect, it } from "vitest";
import {
  buildRowModel,
  type ContainerInstance as Container,
  type Instance,
  type VirtualMachineInstance as VirtualMachine,
} from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import { createChannel } from "../observable/index.js";
import { EMPTY_ROW_MODEL, type RowModel } from "../rows/index.js";
import { createSelection } from "../selection/index.js";
import createRecordTyping from "./createRecordTyping.js";

const readId = (instance: Instance): string => instance.id;

const createInstances = () =>
  createCollection({
    identify: readId,
    discriminator: "type",
    fields: [
      {
        field: "type",
        kind: "choices",
        options: ["container", "virtual-machine"],
      },
      {
        field: "secureboot",
        kind: "choices",
        options: ["true", "false"],
        appliesTo: ["virtual-machine"],
      },
      { field: "processes", kind: "number", min: 0, appliesTo: ["container"] },
      { field: "name", kind: "presence" },
    ],
  });

const buildContainer = (id: string): Container => ({ id, type: "container" });
const buildMachine = (id: string): VirtualMachine => ({
  id,
  type: "virtual-machine",
});

/** One typing over a model and a selection the case drives directly. */
const createTyping = (model: RowModel<Instance> = EMPTY_ROW_MODEL) => {
  const selection = createSelection();
  const rows = createChannel<RowModel<Instance>>(model);
  const record = createRecordTyping({
    collection: createInstances(),
    selection,
    rows,
  });
  return { record, rows, selection };
};

const buildModel = (rows: readonly Instance[]): RowModel<Instance> =>
  buildRowModel({ identify: readId, rows });

describe("createRecordTyping", () => {
  it("refuses to build over a monomorphic collection", () => {
    expect(() =>
      createRecordTyping({
        collection: createCollection({ fields: [], identify: readId }),
        selection: createSelection(),
        rows: createChannel<RowModel<Instance>>(EMPTY_ROW_MODEL),
      }),
    ).toThrow("a monomorphic collection has no record typing to build");
  });

  describe("applicability", () => {
    it("applies an unscoped field to every type", () => {
      const { record } = createTyping();
      expect(record.readApplicability("type", buildContainer("c-1"))).toBe(
        "applies",
      );
      expect(record.readApplicability("type", buildMachine("v-1"))).toBe(
        "applies",
      );
    });

    it("applies a field the schema does not describe at all", () => {
      // A column showing something outside the schema has no scoping, and
      // absent scoping is every type.
      expect(
        createTyping().record.readApplicability(
          "uptime",
          buildContainer("c-1"),
        ),
      ).toBe("applies");
    });

    it("withholds a scoped field from a row of another type", () => {
      const { record } = createTyping();
      expect(record.readApplicability("secureboot", buildMachine("v-1"))).toBe(
        "applies",
      );
      expect(
        record.readApplicability("secureboot", buildContainer("c-1")),
      ).toBe("not-applicable");
      expect(record.readApplicability("processes", buildContainer("c-1"))).toBe(
        "applies",
      );
      expect(record.readApplicability("processes", buildMachine("v-1"))).toBe(
        "not-applicable",
      );
    });

    it("withholds a scoped field from a row carrying no declared type", () => {
      const { record } = createTyping();
      const untyped = { id: "x", type: "sandbox" } as unknown as Instance;
      expect(record.readApplicability("secureboot", untyped)).toBe(
        "not-applicable",
      );
    });
  });

  describe("rejectionOf", () => {
    it("accepts a model whose every row carries a declared type", () => {
      const { record } = createTyping();
      expect(
        record.readRejection(
          buildModel([buildContainer("c-1"), buildMachine("v-1")]),
        ),
      ) //
        .toBeNull();
    });

    it("names the row and the value a model cannot be displayed for", () => {
      const { record } = createTyping();
      const rogue = { id: "x-1", type: "sandbox" } as unknown as Instance;
      expect(
        record.readRejection(buildModel([buildContainer("c-1"), rogue])),
      ).toBe('record type "sandbox" of row "x-1" is not declared');
    });

    it("names a row carrying no discriminator value at all", () => {
      const { record } = createTyping();
      const rogue = { id: "x-1" } as unknown as Instance;
      expect(record.readRejection(buildModel([rogue]))).toBe(
        'record type undefined of row "x-1" is not declared',
      );
    });
  });

  describe("type memory", () => {
    it("reads a selected row's type from the rows on display", () => {
      const { record, selection } = createTyping(
        buildModel([buildMachine("v-1")]),
      );
      selection.set(["v-1"]);
      expect(record.readRecordType("v-1")).toBe("virtual-machine");
    });

    it("knows no type for an identity that is not selected", () => {
      const { record } = createTyping(buildModel([buildMachine("v-1")]));
      expect(record.readRecordType("v-1")).toBeNull();
    });

    it("knows no type for a selected identity it never modelled", () => {
      // A selection a host restored over rows this provider has not seen:
      // "not loaded", never a type assumed from nothing.
      const displayed = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(displayed);
      selection.set(["gone", "v-1"]);
      record.remember(displayed);
      rows.set(EMPTY_ROW_MODEL);
      expect(record.readRecordType("gone")).toBeNull();
      expect(record.readRecordType("v-1")).toBe("virtual-machine");
    });

    it("keeps a selected row's type once its page is replaced", () => {
      const first = buildModel([buildMachine("v-1"), buildContainer("c-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1", "c-1"]);
      record.remember(first);
      rows.set(buildModel([buildMachine("v-2")]));
      expect(record.readRecordType("v-1")).toBe("virtual-machine");
      expect(record.readRecordType("c-1")).toBe("container");
    });

    it("takes the type of a row selected on the page being left", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      // No read while it was displayed: the memory is taken on the way out.
      record.remember(first);
      rows.set(EMPTY_ROW_MODEL);
      expect(record.readRecordType("v-1")).toBe("virtual-machine");
    });

    it("answers from the row on display, never from an older memory", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      record.remember(first);
      // The identity comes back as a record of another type. Memory is for
      // the rows that are not displayed; it never overrules one that is.
      rows.set(buildModel([buildContainer("v-1")]));
      expect(record.readRecordType("v-1")).toBe("container");
    });

    it("re-takes the memory from the row displayed now", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      record.remember(first);
      const second = buildModel([buildContainer("v-1")]);
      rows.set(second);
      record.remember(second);
      rows.set(EMPTY_ROW_MODEL);
      expect(record.readRecordType("v-1")).toBe("container");
    });

    it("carries a remembered type through the pages that follow", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      record.remember(first);
      const second = buildModel([buildContainer("c-1")]);
      rows.set(second);
      // A second page the row is not on: the memory is not re-taken from a
      // model that never held it, it is carried.
      record.remember(second);
      rows.set(EMPTY_ROW_MODEL);
      expect(record.readRecordType("v-1")).toBe("virtual-machine");
    });

    it("drops the type of an identity that left the selection", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      record.remember(first);
      rows.set(EMPTY_ROW_MODEL);
      selection.remove(["v-1"]);
      expect(record.readRecordType("v-1")).toBeNull();
      // And the deselected identity is not carried into the next memory.
      record.remember(EMPTY_ROW_MODEL);
      selection.set(["v-1"]);
      expect(record.readRecordType("v-1")).toBeNull();
    });

    it("remembers nothing for a row whose type is not declared", () => {
      const rogue = { id: "x-1", type: "sandbox" } as unknown as Instance;
      const first = buildModel([rogue]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["x-1"]);
      record.remember(first);
      rows.set(EMPTY_ROW_MODEL);
      expect(record.readRecordType("x-1")).toBeNull();
    });

    it("forgets everything when reset begins the next generation", () => {
      const first = buildModel([buildMachine("v-1")]);
      const { record, rows, selection } = createTyping(first);
      selection.set(["v-1"]);
      record.remember(first);
      rows.set(EMPTY_ROW_MODEL);
      record.forget();
      expect(record.readRecordType("v-1")).toBeNull();
    });
  });
});
