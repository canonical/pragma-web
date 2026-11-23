import { describe, expect, it } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../collection/index.js";
import createDataViewsProvider from "./createDataViewsProvider.js";
import readProviderHost from "./readProviderHost.js";

const collection = createCollection({
  fields: [{ field: "name", kind: "text" }],
  identify: readId,
});
const provider = createDataViewsProvider({
  collection,
  source: createManualSource().source,
});

describe("readProviderHost", () => {
  it("reads the host a provider was registered with", () => {
    expect(readProviderHost(provider).collection).toBe(collection);
  });

  it("refuses a structural copy of a provider", () => {
    expect(() => readProviderHost({ ...provider })).toThrow(
      "readProviderHost requires a provider created by createDataViewsProvider",
    );
  });
});
