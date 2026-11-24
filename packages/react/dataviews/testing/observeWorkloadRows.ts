import {
  createRowScopes,
  readProviderHost,
} from "@canonical/dataviews-core/bindings";
import { act } from "@testing-library/react";
import { onTestFinished } from "vitest";
import createWorkloadProvider from "./createWorkloadProvider.js";
import type { Workload } from "./types.js";

/**
 * A workload provider observed with its rows' scopes over name, image and
 * cores, released when the test finishes, and a way to replace its rows.
 *
 * @param rows The workloads the source holds; one of each type by default.
 * @note Impure: observes the provider and its row scopes.
 */
export default function observeWorkloadRows(rows?: readonly Workload[]) {
  const { provider, source } = createWorkloadProvider(rows);
  onTestFinished(provider.observe());
  const scopes = createRowScopes({
    rows: provider.rows,
    selection: provider.selection,
    fields: ["name", "image", "cores"],
  });
  onTestFinished(scopes.observe());
  const replace = (next: readonly Workload[]): void =>
    act(() => {
      source.setRows(next);
      provider.refresh();
    });
  return {
    provider,
    scopes,
    readApplicability: readProviderHost(provider).readApplicability,
    replace,
  };
}
