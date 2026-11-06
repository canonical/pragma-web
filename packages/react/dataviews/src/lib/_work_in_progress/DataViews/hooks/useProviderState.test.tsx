/**
 * One root's state: the provider observed while the root is mounted, the
 * root's own filter records and the sessions they type in, and the words
 * its parts speak.
 */
import {
  createCollection,
  createDataViewsProvider,
  declareCapabilities,
  type QueryLocation,
} from "@canonical/dataviews-core";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import createManualSource from "../../../../../testing/createManualSource.js";
import createRecordingLocation from "../../../../../testing/createRecordingLocation.js";
import { COUNTED_EXACTLY } from "../../../../../testing/fixtures.js";
import { findFilterHandle } from "../common/utils/index.js";
import useProviderState from "./useProviderState.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [{ field: "cpu", kind: "number", min: 0 }],
});

const makeFixture = (location?: QueryLocation) => {
  const source = createManualSource<Row>({
    capabilities: declareCapabilities(collection, {
      filter: { cpu: true },
      counts: COUNTED_EXACTLY,
    }),
  });
  const provider = createDataViewsProvider({
    collection,
    source: source.source,
    ...(location === undefined ? {} : { location }),
  });
  return { source, provider };
};

describe("useProviderState", () => {
  it("refuses a provider createDataViewsProvider did not create", () => {
    const failure = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderHook(() => useProviderState({ provider: {} as never })),
    ).toThrow(
      "DataViews requires a provider created by createDataViewsProvider",
    );
    failure.mockRestore();
  });

  it("observes the provider for as long as the root is mounted", () => {
    const { source, provider } = makeFixture();
    const hook = renderHook(() => useProviderState({ provider }));
    expect(source.calls).toHaveLength(1);
    hook.unmount();
    expect(source.latest().releases).toBe(1);
  });

  it("speaks the words it is handed, over English", () => {
    const { provider } = makeFixture();
    const hook = renderHook(() =>
      useProviderState({
        provider,
        messages: { statusNoData: "Nothing here yet." },
      }),
    );
    const { messages } = hook.result.current.value;
    expect(messages.statusNoData).toBe("Nothing here yet.");
    expect(messages.statusPending).toBeTypeOf("string");
  });

  it("holds one value while nothing it carries changes", () => {
    const { provider } = makeFixture();
    const hook = renderHook(() => useProviderState({ provider }));
    const first = hook.result.current.value;
    hook.rerender();
    expect(hook.result.current.value).toBe(first);
    expect(first.provider).toBe(provider);
  });

  it("ends the typing session of every filter record at once", () => {
    const recorded = createRecordingLocation({ href: "/machines" });
    const { provider } = makeFixture(recorded.location);
    const hook = renderHook(() => useProviderState({ provider }));
    const { filters, endSessions } = hook.result.current.value;
    const from = findFilterHandle<number>(filters, "cpu", "gte");
    const before = recorded.writes.length;
    act(() => {
      from.edit("4");
      from.edit("48");
      endSessions();
      from.edit("8");
    });
    expect(recorded.writes.slice(before).map(([, mode]) => mode)).toEqual([
      "push",
      "replace",
      "push",
    ]);
  });
});
