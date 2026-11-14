import { describe, expect, it } from "vitest";
import { consumerCode } from "./consumerCode.js";

/** The code a story's panel shows for the given consumer. */
const readCode = (config: Parameters<typeof consumerCode>[0]): string =>
  consumerCode(config).docs.source.code;

describe("consumerCode", () => {
  it("shows tsx", () => {
    expect(
      consumerCode({ parts: ["DataTable"], render: "<DataTable />" }).docs
        .source.language,
    ).toBe("tsx");
  });

  it("wires the machines over a local array by default", () => {
    const code = readCode({
      parts: ["DataViews", "DataTable"],
      render:
        "<DataViews provider={provider}>\n\n  <DataTable />\n</DataViews>",
    });
    expect(code).toBe(`import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { DataViews, DataTable } from "@canonical/dataviews-react";
import { useState } from "react";
import { machineCollection, machines } from "./machines.js";

export function Machines() {
  // Built once: the parts observe it, which starts its source and ports.
  const [provider] = useState(() =>
    createDataViewsProvider({
      collection: machineCollection,
      source: createArraySource({
        rows: machines,
        collection: machineCollection,
        searchFields: ["name", "owner"],
      }),
    }),
  );
  return (
    <DataViews provider={provider}>

      <DataTable />
    </DataViews>
  );
}`);
  });

  it("names the core's functions and types the declarations use", () => {
    const code = readCode({
      parts: ["DataTable"],
      core: ["createCollection"],
      coreTypes: ["Query"],
      render: "<DataTable />",
    });
    expect(code).toContain(
      "  createDataViewsProvider,\n  createCollection,\n  type Query,\n}",
    );
  });

  it("imports no array source a custom source does not use", () => {
    const code = readCode({
      parts: ["DataTable"],
      source: "createRestSource()",
      render: "<DataTable />",
    });
    expect(code).not.toContain("createArraySource,");
    expect(code).toContain("source: createRestSource(),");
  });

  it("gives the provider the browser's store", () => {
    const code = readCode({
      parts: ["DataTable"],
      store: true,
      render: "<DataTable />",
    });
    expect(code).toContain(
      'import { createIndexedDBViewStore } from "@canonical/dataviews-core/indexeddb";',
    );
    expect(code).toContain('database: "operations-console-views",');
    expect(code).toContain("      views: store,\n      presentation: store,");
  });

  it("carries the starting query, location and facets", () => {
    const code = readCode({
      parts: ["DataTable"],
      query: "status=failed",
      location: "createBrowserLocation()",
      facets: ["status", "cores"],
      render: "<DataTable />",
    });
    expect(code).toContain("      location: createBrowserLocation(),");
    expect(code).toContain(
      '      snapshot: { query: "status=failed", presentation: {} },',
    );
    expect(code).toContain('      facets: ["status", "cores"],');
  });

  it("issues the commands once the provider is built", () => {
    const code = readCode({
      parts: ["DataTable"],
      prepare: "provider.refresh();",
      render: "<DataTable />",
    });
    expect(code).toContain("const [provider] = useState(() => {");
    expect(code).toContain(
      "\n    provider.refresh();\n    return provider;\n  });",
    );
  });

  it("places further imports, declarations and hooks", () => {
    const code = readCode({
      parts: ["DataTable"],
      imports: 'import { racks } from "./racks.js";',
      declarations: "const columns = [];",
      hooks: ["useMemo"],
      render: "<DataTable />",
    });
    expect(code).toContain('import { useState, useMemo } from "react";');
    expect(code).toContain('import { racks } from "./racks.js";');
    expect(code).not.toContain("./machines.js");
    expect(code).toContain("\n\nconst columns = [];\n\nexport function");
  });
});
