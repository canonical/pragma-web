/**
 * A field's two bounds as one chip: what it reads from the query state,
 * and what it hands the bar.
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  createMachineProvider,
  installPopoverStandIn,
} from "../../../../../../../../../testing/index.js";
import { QueryInput } from "../../../../../../../component/QueryInput/index.js";
import { QueryChips } from "../../../../../../../group/QueryChips/index.js";
import DataViews from "../../../../../Provider.js";
import useQueryGroup from "../../hooks/useQueryGroup.js";
import type { QueryRangeClause } from "../../types.js";
import RangeChip from "./RangeChip.js";
import type { RangeChipProps } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const lower = { field: "cores", operator: "gte", operands: [2] } as const;
const upper = { field: "cores", operator: "lte", operands: [8] } as const;
const cores: QueryRangeClause = {
  kind: "range",
  id: "cores__range",
  field: "cores",
  refs: [
    { field: "cores", operator: "gte", nth: 0 },
    { field: "cores", operator: "lte", nth: 0 },
  ],
  lower,
  upper,
  condition: "range",
};

/** The chip over a provider standing on a query, inside a field. */
const mount = (props: Partial<RangeChipProps> = {}) => {
  const handlers = {
    onActivate: vi.fn(),
    onRemove: vi.fn(),
    onTypedChange: vi.fn(),
    onEntryKeyDown: vi.fn(),
  };
  const fixture = createMachineProvider({
    snapshot: { query: "cores__gte=2&cores__lte=8", presentation: {} },
  });
  const Chip = (extra: Partial<RangeChipProps>) => {
    const group = useQueryGroup({ provider: fixture.provider as never });
    return (
      <QueryInput
        label="Filter"
        value=""
        onValueChange={() => undefined}
        hiddenLabel={String}
      >
        <QueryChips label="Applied filters">
          <RangeChip
            clause={cores}
            group={group}
            edit={null}
            {...handlers}
            {...props}
            {...extra}
          />
        </QueryChips>
      </QueryInput>
    );
  };
  const view = render(
    <DataViews provider={fixture.provider}>
      <Chip />
    </DataViews>,
  );
  const rerender = (extra: Partial<RangeChipProps>) =>
    view.rerender(
      <DataViews provider={fixture.provider}>
        <Chip {...extra} />
      </DataViews>,
    );
  return { ...fixture, handlers, rerender };
};

describe("RangeChip", () => {
  it("shows both bounds in one chip, and hands each bound to the bar", () => {
    const { handlers } = mount();
    expect(
      screen.getByRole("group", { name: "cores at least 2 and at most 8" }),
    ).toBeInTheDocument();
    const upperBound = screen.getByRole("button", { name: "at most 8" });
    expect(upperBound).toHaveTextContent("≤ 8");
    expect(upperBound).toHaveAttribute("data-condition", "range");
    fireEvent.click(upperBound);
    expect(handlers.onActivate).toHaveBeenCalledWith(
      {
        kind: "predicate",
        origin: { id: "cores__range", ref: cores.refs[1], held: upper },
        field: "cores",
        operator: "lte",
        operands: [8],
      },
      "value",
    );
    fireEvent.click(screen.getByRole("button", { name: "at least 2" }));
    expect(handlers.onActivate).toHaveBeenLastCalledWith(
      expect.objectContaining({ operator: "gte" }),
      "value",
    );
    // The field edits the range from its lower bound.
    fireEvent.click(screen.getByRole("button", { name: "cores" }));
    expect(handlers.onActivate).toHaveBeenLastCalledWith(
      expect.objectContaining({ operator: "gte" }),
      "value",
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove cores at least 2 and at most 8",
      }),
    );
    expect(handlers.onRemove).toHaveBeenCalledWith(cores);
  });

  it("takes an Entry named for its bound where the edited bound stands", () => {
    const { rerender } = mount();
    const edit = {
      draft: {
        kind: "predicate",
        origin: { id: "cores__range", ref: cores.refs[1], held: upper },
        field: "cores",
        operator: "lte",
        operands: [8],
      },
      part: "value",
      typed: "8",
      invalid: "no",
    } as const;
    rerender({ edit });
    const entry = screen.getByRole("combobox", {
      name: "Upper bound for cores",
    });
    expect(entry).toHaveValue("8");
    expect(entry).toHaveAttribute("aria-invalid", "true");
    rerender({ edit: { ...edit, invalid: null } });
    expect(
      screen.getByRole("combobox", { name: "Upper bound for cores" }),
    ).not.toHaveAttribute("aria-invalid");
    // Each bound is a value part, told apart by its operator.
    rerender({ edit: null });
    for (const [name, operator] of [
      ["at least 2", "gte"],
      ["at most 8", "lte"],
    ] as const) {
      const segment = screen.getByRole("button", { name });
      expect(segment).toHaveAttribute("data-part", "value");
      expect(segment).toHaveAttribute("data-operator", operator);
    }
  });

  it("follows its bounds, and shows nothing once either is gone", () => {
    const { provider } = mount();
    act(() => {
      provider.setSearch("alpha");
    });
    expect(screen.getByRole("group")).toBeInTheDocument();
    act(() => {
      provider.clear(["filter"]);
    });
    expect(screen.queryByRole("group")).toBeNull();
  });
});
