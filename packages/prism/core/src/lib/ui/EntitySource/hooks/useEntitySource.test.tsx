import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from "relay-runtime";
import { describe, expect, it, vi } from "vitest";
import useEntitySource from "./useEntitySource.js";

describe("useEntitySource", () => {
  it("asks again, from loading, when the entity changes", async () => {
    const fetchSource = vi.fn((_request, variables) =>
      Observable.from({ data: { source: `# ${String(variables.uri)}` } }),
    );
    const environment = new Environment({
      network: Network.create(fetchSource),
      store: new Store(new RecordSource()),
    });
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <RelayEnvironmentProvider environment={environment}>
        {children}
      </RelayEnvironmentProvider>
    );
    const { result, rerender } = renderHook(({ uri }) => useEntitySource(uri), {
      wrapper,
      initialProps: { uri: "https://a.example/a" },
    });
    await waitFor(() =>
      expect(result.current).toEqual({
        status: "loaded",
        source: "# https://a.example/a",
      }),
    );
    rerender({ uri: "https://a.example/b" });
    await waitFor(() =>
      expect(result.current).toEqual({
        status: "loaded",
        source: "# https://a.example/b",
      }),
    );
    expect(fetchSource).toHaveBeenCalledTimes(2);
  });
});
