/**
 * One applied clause's chip: what it reads from the query state, and what
 * it hands the bar.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../../../testing/createMachineProvider.js";
import installPopoverStandIn from "../../../../../../../../testing/installPopoverStandIn.js";
import { QueryChips } from "../../../../../QueryChips/index.js";
import { QueryInput } from "../../../../../QueryInput/index.js";
import DataViews from "../../../../Provider.js";
import useQueryGroup from "../../hooks/useQueryGroup.js";
import type { QueryPredicateClause, QuerySearchClause } from "../../types.js";
import QueryBarChip from "./QueryBarChip.js";
import type { QueryBarChipProps } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const running: QueryPredicateClause = {
  kind: "predicate",
  id: "status__isAny__0",
  refs: [{ field: "status", operator: "isAny", nth: 0 }],
  predicate: { field: "status", operator: "isAny", operands: ["running"] },
  condition: "inclusion",
};

const search: QuerySearchClause = {
  kind: "search",
  id: "search",
  refs: [],
  search: "web",
};

/** The chip over a provider standing on a query, inside a field. */
const mount = (
  clause: QueryPredicateClause | QuerySearchClause,
  query: string,
  props: Partial<QueryBarChipProps> = {},
) => {
  const handlers = {
    onActivate: vi.fn(),
    onRemove: vi.fn(),
    onTypedChange: vi.fn(),
    onEntryKeyDown: vi.fn(),
  };
  const fixture = createMachineProvider({
    snapshot: { query, presentation: {} },
  });
  const Chip = () => {
    const group = useQueryGroup({ provider: fixture.provider as never });
    return (
      <QueryInput
        label="Filter"
        value=""
        onValueChange={() => undefined}
        hiddenLabel={String}
      >
        <QueryChips label="Applied filters">
          <QueryBarChip
            clause={clause}
            group={group}
            edit={null}
            {...handlers}
            {...props}
          />
        </QueryChips>
      </QueryInput>
    );
  };
  render(
    <DataViews provider={fixture.provider}>
      <Chip />
    </DataViews>,
  );
  return { ...fixture, handlers };
};

describe("QueryBarChip", () => {
  it("shows its conjunct as it applies, and hands it to the bar", () => {
    const { handlers } = mount(running, "status=running");
    expect(
      screen.getByRole("group", { name: "status is running" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "running" }));
    const applied = {
      kind: "predicate",
      origin: {
        id: "status__isAny__0",
        ref: running.refs[0],
        held: running.predicate,
      },
      field: "status",
      operator: "isAny",
      operands: ["running"],
    };
    expect(handlers.onActivate).toHaveBeenCalledWith(applied, "value");
    fireEvent.click(
      screen.getByRole("button", { name: "Remove status is running" }),
    );
    expect(handlers.onRemove).toHaveBeenCalledWith(applied);
  });

  it("follows its conjunct, and shows nothing once it is gone", () => {
    const { provider } = mount(running, "status=running");
    act(() => {
      provider.setSearch("alpha");
    });
    expect(
      screen.getByRole("group", { name: "status is running" }),
    ).toBeInTheDocument();
    act(() => {
      provider.clear(["filter"]);
    });
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("shows the search as it applies, and follows it", () => {
    const { provider } = mount(search, "q=web");
    expect(
      screen.getByRole("group", { name: "Search for web" }),
    ).toBeInTheDocument();
    act(() => {
      provider.setSearch("db");
    });
    expect(
      screen.getByRole("group", { name: "Search for db" }),
    ).toBeInTheDocument();
    act(() => {
      provider.setSearch("");
    });
    expect(
      screen.getByRole("group", { name: "Search for" }),
    ).toBeInTheDocument();
  });

  it("shows the edit standing in it in place of what applies", () => {
    mount(running, "status=running", {
      edit: {
        draft: {
          kind: "predicate",
          origin: {
            id: running.id,
            ref: running.refs[0],
            held: running.predicate,
          },
          field: "status",
          operator: "isAny",
          operands: ["running", "failed"],
        },
        part: "value",
        typed: "x",
        invalid: null,
      },
    });
    expect(
      screen.getByRole("combobox", { name: "Value for status" }),
    ).toHaveValue("x");
    expect(
      screen.getByRole("button", { name: "running, failed" }),
    ).toBeInTheDocument();
  });
});
