import {
  createArraySource,
  createDataViewsProvider,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildMachine, machines } from "../../../../../../testing/index.js";
import PlainList from "./PlainList.js";

describe("PlainList on the server", () => {
  it("lists the rows a refreshed provider holds", () => {
    const provider = createDataViewsProvider({
      collection: machines,
      source: createArraySource({
        rows: [buildMachine("m-1", "alpha")],
        collection: machines,
      }),
    });
    provider.refresh();
    const markup = renderToString(
      <PlainList
        provider={provider}
        label="Machines"
        nameRecord={(record) => record.name}
      />,
    );
    expect(markup).toContain("<li>alpha</li>");
  });
});
