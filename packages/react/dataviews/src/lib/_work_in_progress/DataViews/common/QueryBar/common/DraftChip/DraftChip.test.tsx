/**
 * The chip a clause is shown, built or edited in: its Segments in order,
 * the Entry where the part being typed stands, and its words.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../../../testing/createMachineProvider.js";
import installPopoverStandIn from "../../../../../../../../testing/installPopoverStandIn.js";
import { QueryChips } from "../../../../../QueryChips/index.js";
import { QueryInput } from "../../../../../QueryInput/index.js";
import DataViews from "../../../../Provider.js";
import type { QueryBarDraft } from "../../types.js";
import DraftChip from "./DraftChip.js";
import type { DraftChipProps } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const running: QueryBarDraft = {
  kind: "predicate",
  origin: null,
  field: "status",
  operator: "isAny",
  operands: ["running", "failed"],
};

/** The chip inside a root and a field, as the bar places it. */
const mount = (
  props: Partial<DraftChipProps>,
  wrap?: (chip: ReactNode) => ReactNode,
) => {
  const handlers = {
    onActivate: vi.fn(),
    onRemove: vi.fn(),
    onTypedChange: vi.fn(),
    onEntryKeyDown: vi.fn(),
  };
  const chip = (
    <DraftChip
      id="draft"
      draft={running}
      part={null}
      typed=""
      invalid={null}
      {...handlers}
      {...props}
    />
  );
  const { provider } = createMachineProvider();
  render(
    <DataViews provider={provider}>
      <QueryInput
        label="Filter"
        value=""
        onValueChange={() => undefined}
        hiddenLabel={String}
      >
        <QueryChips label="Applied filters">
          {wrap ? wrap(chip) : chip}
        </QueryChips>
      </QueryInput>
    </DataViews>,
  );
  return handlers;
};

describe("DraftChip", () => {
  it("shows the field, the operator's symbol spoken in words, and the values", () => {
    const { onActivate, onRemove } = mount({});
    expect(
      screen.getByRole("group", { name: "status is any of running, failed" }),
    ).toBeInTheDocument();
    const operator = screen.getByRole("button", { name: "is any of" });
    expect(operator).toHaveTextContent(":");
    fireEvent.click(screen.getByRole("button", { name: "running, failed" }));
    expect(onActivate).toHaveBeenCalledWith("value");
    fireEvent.click(operator);
    expect(onActivate).toHaveBeenCalledWith("operator");
    fireEvent.click(
      screen.getByRole("button", {
        name: "Remove status is any of running, failed",
      }),
    );
    expect(onRemove).toHaveBeenCalled();
  });

  it("puts the Entry beside a choice's values, and names it by its part", () => {
    const { onTypedChange, onEntryKeyDown } = mount({
      part: "value",
      typed: "pen",
    });
    const entry = screen.getByRole("combobox", { name: "Value for status" });
    expect(entry).toHaveValue("pen");
    expect(
      screen.getByRole("button", { name: "running, failed" }),
    ).toBeInTheDocument();
    fireEvent.change(entry, { target: { value: "pend" } });
    expect(onTypedChange).toHaveBeenCalledWith("pend");
    fireEvent.keyDown(entry, { key: "Enter" });
    expect(onEntryKeyDown).toHaveBeenCalled();
  });

  it("puts the Entry in a typed value's place, invalid with its reason", () => {
    mount({
      draft: { ...running, field: "cores", operator: "gte", operands: [4] },
      part: "value",
      typed: "four",
      invalid: "not a number",
    });
    expect(screen.queryByRole("button", { name: "4" })).toBeNull();
    const entry = screen.getByRole("combobox", { name: "Value for cores" });
    expect(entry).toHaveAttribute("aria-invalid", "true");
    expect(entry).toHaveAccessibleDescription(/Invalid: not a number/);
  });

  it("names the field and operator Entries, and shows a draft's parts as far as chosen", () => {
    mount({
      draft: { ...running, operator: null, operands: [] },
      part: "operator",
    });
    expect(
      screen.getByRole("combobox", { name: "Operator for status" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "status" })).toBeInTheDocument();
  });

  it("shows an operator without its values while the Entry is back on it", () => {
    mount({ draft: { ...running, operands: [] }, part: "field" });
    expect(screen.getByRole("combobox", { name: "Field" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "is any of" }),
    ).toBeInTheDocument();
  });

  it("shows an operator in its words where it has no symbol", () => {
    mount({
      draft: {
        ...running,
        field: "name",
        operator: "contains",
        operands: ["web"],
      },
    });
    const operator = screen.getByRole("button", { name: "contains" });
    expect(operator).toHaveTextContent("contains");
  });

  it("shows the search by its text", () => {
    const { onActivate } = mount({
      id: "search",
      draft: {
        kind: "search",
        origin: { id: "search", ref: null },
        text: "web",
      },
    });
    expect(
      screen.getByRole("group", { name: "Search for web" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "web" }));
    expect(onActivate).toHaveBeenCalledWith("search");
  });
});
