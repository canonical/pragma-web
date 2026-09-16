/**
 * A root's context carries the widest provider shape, because React context
 * cannot be generic, and the typed scope hook takes it back at the
 * collection's own types. Nothing about that conversion is checked by the
 * compiler: what makes it sound is that the hook first compares the
 * collection it was handed against the one the root's provider was built
 * over, and throws when they differ.
 *
 * That proof is an ordering, and an ordering is easy to lose. Narrowing
 * before the comparison, or softening the comparison to a truthy test, would
 * hand a child in the wrong root another collection's provider typed as its
 * own: its records would be read under the wrong field names, and the failure
 * would surface far from here.
 *
 * What is pinned is the observable half of that ordering — that no scope
 * exists at all for a foreign root, in either direction of the mismatch. The
 * other half, that no member of the provider is read before the check, is not
 * pinned: observing reads means handing the root a wrapper, and the root
 * admits only the object the factory registered, so any wrapper is refused
 * before the hook is reached. A test that had to fake a provider to watch it
 * would be proving something about the fake.
 */

import {
  createCollection,
  createDataViewsProvider,
  type DataViewsProvider,
  declareCapabilities,
  type SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../testing/createManualSource.js";
import { createMachineProvider, machines } from "../../../testing/machines.js";
import DataViews from "../../lib/_work_in_progress/DataViews/Provider.js";
import { useDataViews } from "../../lib/index.js";

/** Another collection, over which the machine provider was not built. */
const racks = createCollection({
  identify: (rack: { readonly id: string }) => rack.id,
  fields: [{ field: "zone", kind: "choices", options: ["a", "b"] }],
});

/**
 * A root over the given provider. Generic in the collection and the record:
 * it renders a root and reads no record of its own, and the two cases below
 * mount providers over different collections.
 */
const inRoot =
  <TFields extends readonly SchemaFieldDefinition[], TRow extends object>(
    provider: DataViewsProvider<TFields, TRow>,
  ) =>
  ({ children }: { children: ReactNode }) => (
    <DataViews provider={provider}>{children}</DataViews>
  );

describe("a scope taken from the wrong root", () => {
  it("hands back no scope when the witness is not the root's collection", () => {
    const { provider } = createMachineProvider();
    const taken = vi.fn();
    const Child = () => {
      taken(useDataViews(racks));
      return null;
    };
    expect(() =>
      renderHook(() => Child(), { wrapper: inRoot(provider) }),
    ).toThrow(
      "useDataViews was passed a collection that is not the one the enclosing DataViews root's provider was built over",
    );
    // The narrowing follows the check, so nothing was ever handed back.
    expect(taken).not.toHaveBeenCalled();
  });

  it("hands back no scope when the root is over another collection", () => {
    const rackProvider = createDataViewsProvider({
      collection: racks,
      source: createManualSource<{ readonly id: string }>({
        capabilities: declareCapabilities(racks, {}),
      }).source,
    });
    const taken = vi.fn();
    const Child = () => {
      taken(useDataViews(machines));
      return null;
    };
    expect(() =>
      renderHook(() => Child(), { wrapper: inRoot(rackProvider) }),
    ).toThrow("not the one the enclosing DataViews root's provider");
    expect(taken).not.toHaveBeenCalled();
  });
});
