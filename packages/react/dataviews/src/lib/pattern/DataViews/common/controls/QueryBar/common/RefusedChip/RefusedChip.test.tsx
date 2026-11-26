/**
 * A refused filter or search as a read-only chip in the error tone, which
 * reads its own refusal from the query state.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  createMachineProvider,
  installPopoverStandIn,
} from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../_work_in_progress/DataViews/Provider.js";
import { QueryChips } from "../../../../../../../_work_in_progress/QueryChips/index.js";
import { QueryInput } from "../../../../../../../_work_in_progress/QueryInput/index.js";
import useQueryGroup from "../../hooks/useQueryGroup.js";
import type { QueryRefusedClause } from "../../types.js";
import RefusedChip from "./RefusedChip.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

/** The clause of a refused `status`, as the bar lists it. */
const status: QueryRefusedClause = {
  kind: "refused",
  id: "refused__status",
  refs: [],
  issue: { parameter: "status", field: "status", code: "invalid", reason: "" },
};

/** The chip over a provider at an address, or in memory, inside a field. */
const mount = (config: { readonly href?: string; readonly query?: string }) => {
  const onClear = vi.fn();
  const location =
    config.href === undefined
      ? undefined
      : createMemoryLocation({ href: config.href });
  const { provider } = createMachineProvider({
    ...(location === undefined ? {} : { location }),
    ...(config.query === undefined
      ? {}
      : { snapshot: { query: config.query, presentation: {} } }),
  });
  const Chip = () => {
    const group = useQueryGroup({ provider: provider as never });
    return (
      <QueryInput
        label="Filter"
        value=""
        onValueChange={() => undefined}
        hiddenLabel={String}
      >
        <QueryChips label="Applied filters">
          <RefusedChip clause={status} group={group} onClear={onClear} />
        </QueryChips>
      </QueryInput>
    );
  };
  render(
    <DataViews provider={provider}>
      <Chip />
    </DataViews>,
  );
  return { onClear, location };
};

describe("RefusedChip", () => {
  it("names a refused filter by its field, describes why, and clears it", () => {
    const { onClear } = mount({ href: "/m?status=melted" });
    expect(document.querySelector(".ds.query-chip")).toHaveClass("error");
    const clear = screen.getByRole("button", { name: "Clear status" });
    expect(clear).toHaveAccessibleDescription(/^status: .*melted/);
    fireEvent.click(clear);
    expect(onClear).toHaveBeenCalledWith(status);
  });

  it("reads its own refusal, so another link's reason shows", () => {
    const { location } = mount({ href: "/m?status=melted" });
    act(() => {
      location?.write(new URLSearchParams("status=frozen"));
    });
    expect(
      screen.getByRole("button", { name: "Clear status" }),
    ).toHaveAccessibleDescription(/frozen/);
    // Once the refusal is gone, the chip shows nothing.
    act(() => {
      location?.write(new URLSearchParams(""));
    });
    expect(document.querySelector(".ds.query-chip")).toBeNull();
  });

  it("offers no clear without a location, its reason read inline", () => {
    mount({ query: "status=melted" });
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText(/^status: .*melted/)).toBeInTheDocument();
  });
});
