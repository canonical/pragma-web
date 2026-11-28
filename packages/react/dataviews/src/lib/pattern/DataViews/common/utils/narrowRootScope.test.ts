import {
  createFilterInputs,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import {
  createMachineProvider,
  machines,
  RACK_COLLECTION,
} from "../../../../../../testing/index.js";
import narrowRootScope from "./narrowRootScope.js";
import widenRootProvider from "./widenRootProvider.js";

/** A root's scope over a fresh machine provider, as its context holds it. */
const buildRoot = () => {
  const provider = widenRootProvider(createMachineProvider().provider);
  const { handles } = createFilterInputs({ host: readProviderHost(provider) });
  return { provider, filters: handles };
};

describe("narrowRootScope", () => {
  it("hands back the root's own provider and filters for its collection", () => {
    const root = buildRoot();
    const scope = narrowRootScope(root, machines);
    expect(scope.provider).toBe(root.provider);
    expect(scope.filters).toBe(root.filters);
  });

  it("throws for a collection the provider was not built over", () => {
    expect(() => narrowRootScope(buildRoot(), RACK_COLLECTION)).toThrow(
      "useDataViews was passed a collection that is not the one the enclosing DataViews root's provider was built over",
    );
  });
});
