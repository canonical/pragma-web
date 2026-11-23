import { describe, expect, it } from "vitest";
import { createManualSource, readId } from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import createDataViewsProvider from "./createDataViewsProvider.js";
import isDataViewsProvider from "./isDataViewsProvider.js";

const provider = createDataViewsProvider({
  collection: createCollection({ fields: [], identify: readId }),
  source: createManualSource().source,
});

describe("isDataViewsProvider", () => {
  it("recognizes a provider the factory built", () => {
    expect(isDataViewsProvider(provider)).toBe(true);
  });

  it("refuses a structural copy of one", () => {
    expect(isDataViewsProvider({ ...provider })).toBe(false);
  });

  it("refuses anything that is not an object", () => {
    expect(isDataViewsProvider(null)).toBe(false);
    expect(isDataViewsProvider("provider")).toBe(false);
  });
});
