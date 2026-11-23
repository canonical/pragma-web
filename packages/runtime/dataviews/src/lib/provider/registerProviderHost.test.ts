import { describe, expect, it } from "vitest";
import { createManualSource, readId } from "../../../testing/index.js";
import { createCollection } from "../collection/index.js";
import createDataViewsProvider from "./createDataViewsProvider.js";
import readProviderHost from "./readProviderHost.js";
import registerProviderHost from "./registerProviderHost.js";

const provider = createDataViewsProvider({
  collection: createCollection({ fields: [], identify: readId }),
  source: createManualSource().source,
});

describe("registerProviderHost", () => {
  it("pairs a provider with its host, so the host reads back from it", () => {
    const host = readProviderHost(provider);
    const copy = { ...provider };
    registerProviderHost(copy, host);
    expect(readProviderHost(copy)).toBe(host);
  });
});
