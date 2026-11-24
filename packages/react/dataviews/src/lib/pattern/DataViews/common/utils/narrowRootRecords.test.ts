import { describe, expect, it } from "vitest";
import {
  createMachineProvider,
  machines,
  RACKED_MACHINE_COLLECTION,
} from "../../../../../../testing/index.js";
import { createColumns } from "../renderers/DataTable/index.js";
import narrowRootRecords from "./narrowRootRecords.js";
import widenRootProvider from "./widenRootProvider.js";

/** A root's provider over the machine collection, as its context holds it. */
const buildRoot = () => widenRootProvider(createMachineProvider().provider);

describe("narrowRootRecords", () => {
  it("hands back the root's provider for columns over its collection", () => {
    const provider = buildRoot();
    const columns = createColumns({
      collection: machines,
      columns: [{ field: "name", header: "Name" }],
    });
    expect(narrowRootRecords(provider, columns, "DataTable")).toBe(provider);
  });

  it("hands back the root's provider for columns written by hand", () => {
    const provider = buildRoot();
    expect(
      narrowRootRecords(
        provider,
        [{ id: "name", header: "Name" }],
        "DataTable",
      ),
    ).toBe(provider);
  });

  it("throws for columns over another collection, naming the part", () => {
    const columns = createColumns({
      collection: RACKED_MACHINE_COLLECTION,
      columns: [{ field: "name", header: "Name" }],
    });
    expect(() => narrowRootRecords(buildRoot(), columns, "DataCards")).toThrow(
      "DataCards was given columns declared over another collection",
    );
  });
});
