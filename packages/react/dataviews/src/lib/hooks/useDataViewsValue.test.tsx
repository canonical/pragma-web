import type { ReadonlyChannel } from "@canonical/dataviews-core";
import { act, render, renderHook } from "@testing-library/react";
import {
  StrictMode,
  Suspense,
  startTransition,
  use,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, expectTypeOf, it, onTestFinished, vi } from "vitest";
import createFakeChannel from "../../../testing/createFakeChannel.js";
import createListing from "../../../testing/createListing.js";
import listIds from "../../../testing/listIds.js";
import type { Listing } from "../../../testing/types.js";
import useDataViewsValue from "./useDataViewsValue.js";

/** Read the ids of a listing: a part of the snapshot, never a new list. */
const selectIds = (listing: Listing): readonly number[] => listing.ids;

/** Read the other list of a listing: a part of the snapshot. */
const selectOther = (listing: Listing): readonly number[] => listing.other;

/** Whether two lists hold the same ids in the same order. */
const areIdListsEqual = (
  previous: readonly number[],
  next: readonly number[],
): boolean =>
  previous.length === next.length &&
  previous.every((id, index) => id === next.at(index));

describe("useDataViewsValue", () => {
  it("returns the channel's current snapshot", () => {
    const channel = createFakeChannel({ count: 0 });
    const { result } = renderHook(() => useDataViewsValue(channel));
    expect(result.current).toEqual({ count: 0 });
  });

  it("re-renders only when the channel publishes", () => {
    const channel = createFakeChannel(0);
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useDataViewsValue(channel);
    });
    expect(renders).toBe(1);
    act(() => channel.set(1));
    expect(result.current).toBe(1);
    expect(renders).toBe(2);
    act(() => channel.set(1));
    expect(renders).toBe(2);
  });

  it("re-renders only when the selected part of the snapshot changes", () => {
    const channel = createFakeChannel({
      width: 100,
      reason: null as string | null,
    });
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useDataViewsValue(channel, (state) => state.width);
    });
    expect(result.current).toBe(100);
    act(() => channel.set({ width: 100, reason: "failed" }));
    expect(renders).toBe(1);
    act(() => channel.set({ width: 120, reason: "failed" }));
    expect(result.current).toBe(120);
    expect(renders).toBe(2);
  });

  it("does not re-render when a custom equality guard rejects the set", () => {
    const channel = createFakeChannel(
      { value: 1 },
      (a, b) => a.value === b.value,
    );
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useDataViewsValue(channel);
    });
    expect(renders).toBe(1);
    // Guard-equal write: no notification, no re-render.
    act(() => channel.set({ value: 1 }));
    expect(renders).toBe(1);
    act(() => channel.set({ value: 2 }));
    expect(result.current).toEqual({ value: 2 });
    expect(renders).toBe(2);
  });

  it("re-subscribes when the channel instance changes", () => {
    const first = createFakeChannel(0);
    const second = createFakeChannel(100);
    const { result, rerender } = renderHook(
      ({ channel }) => useDataViewsValue(channel),
      { initialProps: { channel: first } },
    );
    expect(result.current).toBe(0);
    rerender({ channel: second });
    expect(result.current).toBe(100);
    // The stale channel's publication must not leak through.
    act(() => first.set(5));
    expect(result.current).toBe(100);
    act(() => second.set(200));
    expect(result.current).toBe(200);
  });

  it("unsubscribes on unmount", () => {
    const channel = createFakeChannel(0);
    let observed = 0;
    channel.subscribe(() => {
      observed += 1;
    });
    const { unmount } = renderHook(() => useDataViewsValue(channel));
    unmount();
    act(() => channel.set(1));
    // Only the surviving subscriber observed it.
    expect(observed).toBe(1);
  });

  describe("a selector that builds its value", () => {
    it("re-renders once per publication when it has no isEqual", () => {
      const failure = vi.spyOn(console, "error").mockImplementation(() => {});
      const channel = createFakeChannel(createListing());
      let renders = 0;
      const { result } = renderHook(() => {
        renders += 1;
        return useDataViewsValue(channel, listIds);
      });
      expect(result.current).toEqual([1, 2]);
      expect(renders).toBe(1);
      act(() => channel.set(createListing({ page: 2 })));
      expect(result.current).toEqual([1, 2]);
      expect(renders).toBe(2);
      expect(failure).not.toHaveBeenCalled();
      failure.mockRestore();
    });

    it("does not run select again for an unchanged snapshot", () => {
      const channel = createFakeChannel(createListing());
      const select = vi.fn(selectIds);
      const { result, rerender } = renderHook(() =>
        useDataViewsValue(channel, select, areIdListsEqual),
      );
      const first = result.current;
      const calls = select.mock.calls.length;
      rerender();
      rerender();
      expect(select).toHaveBeenCalledTimes(calls);
      expect(result.current).toBe(first);
    });

    it("hydrates the server's markup without a mismatch or a comparison", async () => {
      const channel = createFakeChannel(createListing());
      const isEqual = vi.fn(areIdListsEqual);
      const Probe = () => (
        <output>
          {useDataViewsValue(channel, listIds, isEqual).join(",")}
        </output>
      );
      const container = document.createElement("div");
      container.innerHTML = renderToString(<Probe />);
      const recoverable = vi.fn();
      const failure = vi.spyOn(console, "error").mockImplementation(() => {});
      let root: Root | null = null;
      await act(async () => {
        root = hydrateRoot(container, <Probe />, {
          onRecoverableError: recoverable,
        });
      });
      expect(container.textContent).toBe("1,2");
      expect(recoverable).not.toHaveBeenCalled();
      expect(failure).not.toHaveBeenCalled();
      expect(isEqual).not.toHaveBeenCalled();
      act(() => {
        root?.unmount();
      });
      failure.mockRestore();
    });
  });

  describe("isEqual", () => {
    it("returns the first selection without consulting isEqual", () => {
      const channel = createFakeChannel(createListing());
      const isEqual = vi.fn(areIdListsEqual);
      const { result } = renderHook(() =>
        useDataViewsValue(channel, selectIds, isEqual),
      );
      expect(result.current).toEqual([1, 2]);
      expect(isEqual).not.toHaveBeenCalled();
    });

    it("returns the held value while isEqual says the next one is the same", () => {
      const channel = createFakeChannel(createListing());
      let renders = 0;
      const { result } = renderHook(() => {
        renders += 1;
        return useDataViewsValue(channel, selectIds, areIdListsEqual);
      });
      const first = result.current;
      act(() => channel.set(createListing({ page: 2 })));
      expect(result.current).toBe(first);
      expect(renders).toBe(1);
    });

    it("returns the next value once isEqual says it differs", () => {
      const channel = createFakeChannel(createListing());
      let renders = 0;
      const { result } = renderHook(() => {
        renders += 1;
        return useDataViewsValue(channel, selectIds, areIdListsEqual);
      });
      const first = result.current;
      act(() => channel.set(createListing({ ids: [1, 3] })));
      expect(result.current).not.toBe(first);
      expect(result.current).toEqual([1, 3]);
      expect(renders).toBe(2);
    });

    it("keeps the held value across a new select that reads an equal value", () => {
      const channel = createFakeChannel(createListing({ other: [1, 2] }));
      const { result, rerender } = renderHook(
        ({ select }) => useDataViewsValue(channel, select, areIdListsEqual),
        { initialProps: { select: selectIds } },
      );
      const first = result.current;
      rerender({ select: selectOther });
      expect(result.current).toBe(first);
    });

    it("reads through a new select in the render that passes it", () => {
      const channel = createFakeChannel(createListing());
      const { result, rerender } = renderHook(
        ({ select }) => useDataViewsValue(channel, select, areIdListsEqual),
        { initialProps: { select: selectIds } },
      );
      expect(result.current).toEqual([1, 2]);
      rerender({ select: selectOther });
      expect(result.current).toEqual([9]);
    });

    it("decides by a new isEqual against the held value", () => {
      const channel = createFakeChannel(createListing());
      const { result, rerender } = renderHook(
        ({ isEqual }) => useDataViewsValue(channel, selectIds, isEqual),
        { initialProps: { isEqual: (): boolean => true } },
      );
      act(() => channel.set(createListing({ ids: [4] })));
      expect(result.current).toEqual([1, 2]);
      rerender({ isEqual: () => false });
      expect(result.current).toEqual([4]);
    });

    it("keeps the held value across a new channel whose selection is equal", () => {
      const first = createFakeChannel(createListing());
      const second = createFakeChannel(createListing({ page: 7 }));
      const { result, rerender } = renderHook(
        ({ channel }) => useDataViewsValue(channel, selectIds, areIdListsEqual),
        { initialProps: { channel: first } },
      );
      const held = result.current;
      rerender({ channel: second });
      expect(result.current).toBe(held);
    });

    it("reads the new channel at once and ignores the old channel's publications, with an isEqual", () => {
      const first = createFakeChannel(createListing());
      const second = createFakeChannel(createListing({ ids: [5] }));
      const { result, rerender } = renderHook(
        ({ channel }) => useDataViewsValue(channel, selectIds, areIdListsEqual),
        { initialProps: { channel: first } },
      );
      expect(result.current).toEqual([1, 2]);
      rerender({ channel: second });
      expect(result.current).toEqual([5]);
      act(() => first.set(createListing({ ids: [6] })));
      expect(result.current).toEqual([5]);
      act(() => second.set(createListing({ ids: [7] })));
      expect(result.current).toEqual([7]);
    });

    it("keeps the first value when an equal publication lands before it is held", () => {
      const channel = createFakeChannel(createListing());
      const seen: (readonly number[])[] = [];
      const Probe = (): null => {
        seen.push(useDataViewsValue(channel, selectIds, areIdListsEqual));
        return null;
      };
      // Publishes after the commit and before the probe's passive effects,
      // so nothing is held yet when the probe subscribes and reads it.
      const Publisher = (): null => {
        useLayoutEffect(() => {
          channel.set(createListing({ page: 2 }));
        }, []);
        return null;
      };
      render(
        <>
          <Probe />
          <Publisher />
        </>,
      );
      expect(seen).toHaveLength(1);
      expect(seen.at(0)).toEqual([1, 2]);
    });

    it("holds one value through StrictMode's double render and effects", () => {
      const channel = createFakeChannel(createListing());
      const isEqual = vi.fn(areIdListsEqual);
      const committed = new Set<readonly number[]>();
      const { result } = renderHook(
        () => {
          const value = useDataViewsValue(channel, selectIds, isEqual);
          useEffect(() => {
            committed.add(value);
          }, [value]);
          return value;
        },
        { wrapper: StrictMode },
      );
      const first = result.current;
      act(() => channel.set(createListing({ page: 2 })));
      expect(result.current).toBe(first);
      expect(isEqual).toHaveBeenCalled();
      expect(
        isEqual.mock.calls.every(([previous]) => committed.has(previous)),
      ).toBe(true);
    });

    it("never compares with a value from a render React discarded", async () => {
      const channel = createFakeChannel(createListing());
      const isEqual = vi.fn(areIdListsEqual);
      const other = vi.fn(selectOther);
      const committed = new Set<readonly number[]>();
      let shown: readonly number[] | null = null;
      const never = new Promise<never>(() => {});
      const Suspends = (): null => use(never);
      const Probe = ({
        select,
      }: {
        readonly select: (snapshot: Listing) => readonly number[];
      }): null => {
        const value = useDataViewsValue(channel, select, isEqual);
        useEffect(() => {
          committed.add(value);
          shown = value;
        }, [value]);
        return null;
      };
      let showOther = (): void => {};
      const Root = () => {
        const [switched, setSwitched] = useState(false);
        showOther = () => {
          startTransition(() => {
            setSwitched(true);
          });
        };
        return (
          <Suspense fallback={null}>
            <Probe select={switched ? other : selectIds} />
            {switched ? <Suspends /> : null}
          </Suspense>
        );
      };
      render(<Root />);
      const first = shown;
      expect(first).toEqual([1, 2]);
      // The transition reads [9] beside a sibling that never resolves, so
      // it never commits and the screen keeps [1, 2].
      await act(async () => {
        showOther();
      });
      expect(other).toHaveBeenCalled();
      expect(isEqual).toHaveBeenCalledWith(first, [9]);
      expect(shown).toBe(first);
      act(() => channel.set(createListing({ page: 2 })));
      expect(shown).toBe(first);
      expect(
        isEqual.mock.calls.every(([previous]) => committed.has(previous)),
      ).toBe(true);
    });

    it("never commits two readers holding different values when a publication lands between their reads", async () => {
      // A publication during render notifies its readers mid-render, which
      // React reports; that report is the point of the row, not a failure.
      const failure = vi.spyOn(console, "error").mockImplementation(() => {});
      onTestFinished(() => {
        failure.mockRestore();
      });
      const channel = createFakeChannel(createListing());
      const latest = new Map<string, readonly number[]>();
      const commits: (readonly (readonly number[] | undefined)[])[] = [];
      let published = false;
      const Probe = ({ name }: { readonly name: string }): null => {
        const value = useDataViewsValue(channel, selectIds, areIdListsEqual);
        useLayoutEffect(() => {
          latest.set(name, value);
        });
        return null;
      };
      // Renders after the first reader has read and before the second does.
      const Publisher = ({ tick }: { readonly tick: number }): null => {
        if (tick > 0 && !published) {
          published = true;
          channel.set(createListing({ ids: [3] }));
        }
        return null;
      };
      let advance = (): void => {};
      const Root = () => {
        const [tick, setTick] = useState(0);
        advance = () => {
          startTransition(() => {
            setTick(1);
          });
        };
        // Runs after the readers' own layout effects in every commit, so it
        // records the pair that commit shows.
        useLayoutEffect(() => {
          commits.push([latest.get("first"), latest.get("second")]);
        });
        return (
          <>
            <Probe name="first" />
            <Publisher tick={tick} />
            <Probe name="second" />
          </>
        );
      };
      render(<Root />);
      await act(async () => {
        advance();
      });
      expect(published).toBe(true);
      expect(commits.length).toBeGreaterThan(1);
      expect(
        commits.filter(
          ([first = [], second = []]) => !areIdListsEqual(first, second),
        ),
      ).toEqual([]);
      expect(commits.at(-1)).toEqual([[3], [3]]);
      expect(failure).toHaveBeenCalled();
      expect(
        failure.mock.calls.every(([message]) =>
          String(message).startsWith("Cannot update a component"),
        ),
      ).toBe(true);
    });

    it("types isEqual on the selected value", () => {
      const channel: ReadonlyChannel<Listing> = createFakeChannel(
        createListing(),
      );
      const { result } = renderHook(() =>
        useDataViewsValue(
          channel,
          (snapshot) => snapshot.page,
          (previous, next) => {
            expectTypeOf(previous).toEqualTypeOf<number>();
            expectTypeOf(next).toEqualTypeOf<number>();
            return previous === next;
          },
        ),
      );
      expectTypeOf(result.current).toEqualTypeOf<number>();
    });

    it("takes isEqual only with select", () => {
      const channel: ReadonlyChannel<Listing> = createFakeChannel(
        createListing(),
      );
      const { result } = renderHook(() => useDataViewsValue(channel));
      expectTypeOf(result.current).toEqualTypeOf<Listing>();
      const { result: whole } = renderHook(() =>
        // @ts-expect-error isEqual is taken only with a selector.
        useDataViewsValue(channel, undefined, () => true),
      );
      expect(whole.current).toBe(channel.get());
    });
  });
});
