import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../../../testing/buildMachine.js";
import { machines } from "../../../../../../testing/machines.js";
import ScopedRecordList from "./ScopedRecordList.js";

describe("ScopedRecordList on the server", () => {
  it("lists the rows, and draws no control a script must drive", () => {
    const provider = createDataViewsProvider({
      collection: machines,
      source: createArraySource({
        rows: [buildMachine("m-1", "alpha")],
        collection: machines,
      }),
    });
    provider.refresh();
    const markup = renderToString(
      <ScopedRecordList
        scope={provider}
        label="Machines"
        nameRecord={(record) => record.name}
        selectable
        sortBy={{ field: "name", label: "Sort by name" }}
      />,
    );
    expect(markup).toContain("<li>alpha</li>");
    expect(markup).not.toContain("checkbox");
    expect(markup).not.toContain("<button");
  });
});
