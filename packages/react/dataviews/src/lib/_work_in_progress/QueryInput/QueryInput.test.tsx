import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { createRef, useState } from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import installPopoverStandIn from "../../../../testing/installPopoverStandIn.js";
import { useQueryEntry } from "../../common/QueryEntry/index.js";
import { useRovingItem } from "../../common/Roving/index.js";
import QueryInput from "./QueryInput.js";
import type { QueryInputOption, QueryInputProps } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());
afterEach(() => vi.restoreAllMocks());

const OPTIONS: QueryInputOption[] = [
  { id: "status", label: "status", group: "fields" },
  { id: "owner", label: "owner", disabled: true, group: "fields" },
  { id: "pool", label: "pool", current: true, group: "fields" },
  { id: "deployed", label: "deployed", hint: "12 machines", group: "values" },
  {
    id: "gte",
    label: "≥",
    name: "at least",
    hint: "operator",
    group: "values",
  },
];

const DEPLOYED = /^deployed,\s?12 machines$/;

/** A roving item standing for a chip, as QueryChip registers one. */
const ChipItem = ({
  id,
  disabled,
}: {
  id: string;
  disabled?: boolean;
}): ReactElement => {
  const item = useRovingItem<HTMLButtonElement>({ id });
  return (
    <button type="button" disabled={disabled} {...item}>
      {id}
    </button>
  );
};

/** A chip's entry, which borrows QueryInput's combobox, as QueryChip.Entry does. */
const ChipEntry = (): ReactElement => {
  const combobox = useQueryEntry();
  const [value, setValue] = useState("");
  const props = {
    "aria-label": "Value for status",
    value,
    onChange: (event: { target: { value: string } }) =>
      setValue(event.target.value),
  };
  return <input {...(combobox ? combobox.getInputProps(props) : props)} />;
};

/** A chips' list, as QueryChips renders it. */
const Chips = ({ children }: { children: ReactNode }): ReactElement => (
  // biome-ignore lint/a11y/noRedundantRoles: QueryChips sets the list role explicitly
  <ul role="list" aria-label="Filters">
    {children}
  </ul>
);

/** A chips' list holding one chip item for each id. */
const renderChips = (ids: string[]): ReactElement => (
  <Chips>
    {ids.map((id) => (
      <li key={id}>
        <span className="ds query-chip">
          <ChipItem id={id} />
        </span>
      </li>
    ))}
  </Chips>
);

const base = {
  label: "Filter machines",
  value: "",
  onValueChange: () => {},
  hiddenLabel: (count: number) => `+${count} more`,
};

const setup = (props: Partial<QueryInputProps> = {}) => {
  const onValueChange = vi.fn();
  const view = render(
    <QueryInput
      {...base}
      onValueChange={onValueChange}
      {...(props as Record<string, unknown>)}
    />,
  );
  const entry = screen.getByRole("combobox", { name: "Filter machines" });
  const popover = view.container.querySelector(
    ".query-input-suggestions",
  ) as HTMLElement;
  return { ...view, entry, popover, onValueChange };
};

const findOption = (name: string | RegExp) =>
  screen.getByRole("option", { hidden: true, name });

/** No option is the active descendant: downshift writes an empty value. */
const expectNoActiveOption = (entry: HTMLElement) =>
  expect(entry).not.toHaveAttribute(
    "aria-activedescendant",
    expect.stringMatching(/./),
  );

describe("QueryInput", () => {
  describe("the entry", () => {
    it("calls onValueChange as text is typed, and keeps its name", () => {
      const { entry, onValueChange } = setup({ name: "q" });
      fireEvent.change(entry, { target: { value: "stat" } });
      expect(onValueChange).toHaveBeenCalledWith("stat");
      expect(entry).toHaveAttribute("type", "text");
      expect(entry).toHaveAttribute("name", "q");
    });

    it("passes the root props to the root and the rest to the input", () => {
      const { container, entry } = setup({
        id: "query",
        className: "extra",
        style: { color: "red" },
        placeholder: "Search",
        "aria-describedby": "hint",
      });
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveAttribute("id", "query");
      expect(root).toHaveClass("ds", "query-input", "extra");
      expect(root.style.color).toBe("red");
      expect(entry).toHaveAttribute("placeholder", "Search");
      expect(entry).toHaveAttribute("aria-describedby", "hint");
    });

    it("hides the placeholder while a chip is held", () => {
      render(
        <QueryInput {...base} placeholder="Search">
          {renderChips(["status"])}
        </QueryInput>,
      );
      expect(screen.getByRole("combobox")).not.toHaveAttribute("placeholder");
    });

    it("refuses chips without words for the hidden ones", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() =>
        render(
          <QueryInput label="Filter machines" value="" onValueChange={() => {}}>
            {renderChips(["status"])}
          </QueryInput>,
        ),
      ).toThrow("`hiddenLabel` is required with chips.");
    });

    it("counts no chips in a list whose children are empty", () => {
      render(
        <QueryInput
          label="Filter machines"
          value=""
          onValueChange={() => {}}
          placeholder="Search"
        >
          <Chips>
            {false}
            {null}
          </Chips>
        </QueryInput>,
      );
      expect(screen.getByRole("combobox")).toHaveAttribute(
        "placeholder",
        "Search",
      );
    });

    it("composes the host's focus and click handlers with the roving item", () => {
      const onFocus = vi.fn();
      const onClick = vi.fn();
      const { entry } = setup({ onFocus, onClick });
      fireEvent.focus(entry);
      fireEvent.click(entry);
      expect(onFocus).toHaveBeenCalledOnce();
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("disables the field", () => {
      const { container, entry } = setup({ disabled: true });
      expect(entry).toBeDisabled();
      expect(container.firstElementChild).toHaveAttribute("data-disabled");
    });
  });

  describe("the toolbar", () => {
    it("is named by the label and described by the description", () => {
      setup({ description: "Use the arrow keys to move between chips." });
      const toolbar = screen.getByRole("toolbar", { name: "Filter machines" });
      expect(toolbar).toHaveAccessibleDescription(
        "Use the arrow keys to move between chips.",
      );
    });

    it("has no description when none is given", () => {
      setup();
      expect(screen.getByRole("toolbar")).not.toHaveAttribute(
        "aria-describedby",
      );
    });

    it("keeps its own tab stop, starting on the entry", () => {
      render(
        <QueryInput {...base}>
          <ChipItem id="status" />
        </QueryInput>,
      );
      const entry = screen.getByRole("combobox");
      const chip = screen.getByRole("button", { name: "status" });
      expect(entry).toHaveAttribute("tabindex", "0");
      expect(entry).toHaveAttribute("data-roving-item", "entry");
      expect(chip).toHaveAttribute("tabindex", "-1");
      fireEvent.focus(chip);
      expect(chip).toHaveAttribute("tabindex", "0");
      expect(entry).toHaveAttribute("tabindex", "-1");
    });

    it("falls back to the entry when the item holding the stop goes", () => {
      const { rerender } = render(
        <QueryInput {...base}>
          <ChipItem id="status" />
        </QueryInput>,
      );
      fireEvent.focus(screen.getByRole("button", { name: "status" }));
      rerender(<QueryInput {...base} />);
      expect(screen.getByRole("combobox")).toHaveAttribute("tabindex", "0");
    });

    it("falls back without taking focus from outside the field", () => {
      const { rerender } = render(
        <>
          <QueryInput {...base}>
            <ChipItem id="status" />
          </QueryInput>
          <button type="button">Elsewhere</button>
        </>,
      );
      act(() => screen.getByRole("button", { name: "status" }).focus());
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      act(() => elsewhere.focus());
      rerender(
        <>
          <QueryInput {...base} />
          <button type="button">Elsewhere</button>
        </>,
      );
      expect(screen.getByRole("combobox")).toHaveAttribute("tabindex", "0");
      expect(elsewhere).toHaveFocus();
    });

    it("tells the host when its item is disabled, and falls back to the entry", () => {
      const onActiveItemChange = vi.fn();
      render(
        <QueryInput
          {...base}
          activeItem="status"
          onActiveItemChange={onActiveItemChange}
        >
          <ChipItem id="status" disabled />
        </QueryInput>,
      );
      expect(onActiveItemChange).toHaveBeenCalledWith("entry");
    });

    it("follows the host's activeItem and tells it of a claim", () => {
      const onActiveItemChange = vi.fn();
      render(
        <QueryInput
          {...base}
          activeItem="status"
          onActiveItemChange={onActiveItemChange}
        >
          <ChipItem id="status" />
        </QueryInput>,
      );
      const entry = screen.getByRole("combobox");
      expect(screen.getByRole("button", { name: "status" })).toHaveAttribute(
        "tabindex",
        "0",
      );
      expect(onActiveItemChange).not.toHaveBeenCalled();
      fireEvent.focus(entry);
      expect(onActiveItemChange).toHaveBeenCalledWith("entry");
      expect(entry).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("the suggestions", () => {
    it("open while the entry has focus and there are options", () => {
      const { entry, popover } = setup({ options: OPTIONS });
      expect(entry).toHaveAttribute("aria-expanded", "false");
      expect(entry).not.toHaveAttribute("aria-controls");
      fireEvent.focus(entry);
      expect(entry).toHaveAttribute("aria-expanded", "true");
      expect(popover.matches(":popover-open")).toBe(true);
      const listbox = screen.getByRole("listbox", {
        hidden: true,
        name: "Filter machines",
      });
      expect(entry).toHaveAttribute("aria-controls", listbox.id);
      expect(entry.style.getPropertyValue("anchor-name")).toMatch(
        /^--query-input-/,
      );
      fireEvent.blur(entry);
      expect(entry).toHaveAttribute("aria-expanded", "false");
      expect(popover.matches(":popover-open")).toBe(false);
    });

    it("stay closed with nothing to show, and leave Down to the host", () => {
      const onKeyDown = vi.fn();
      const { entry } = setup({ onKeyDown });
      fireEvent.focus(entry);
      expect(entry).toHaveAttribute("aria-expanded", "false");
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(onKeyDown).toHaveBeenCalledOnce();
    });

    it("name options by label and hint, or by name", () => {
      setup({ options: OPTIONS });
      expect(findOption(DEPLOYED)).toBeInTheDocument();
      expect(findOption("at least, operator")).toBeInTheDocument();
    });

    it("mark disabled and current options, and divide groups", () => {
      setup({ options: OPTIONS });
      expect(findOption("owner")).toHaveAttribute("aria-disabled", "true");
      expect(findOption("pool")).toHaveAttribute("aria-disabled", "true");
      expect(findOption("pool")).toHaveAttribute("data-current");
      expect(findOption("status")).not.toHaveAttribute("data-group-start");
      expect(findOption(DEPLOYED)).toHaveAttribute("data-group-start");
    });

    it("name each option after its id", () => {
      setup({ options: [{ id: "a b", label: "a b" }] });
      expect(findOption("a b").id).toMatch(/-option-a%20b$/);
    });

    it("move the highlight with the arrows, skipping options that cannot be chosen", () => {
      const onOptionSelect = vi.fn();
      const { entry } = setup({ options: OPTIONS, onOptionSelect });
      fireEvent.focus(entry);

      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        findOption("status").id,
      );
      expect(findOption("status")).toHaveAttribute("aria-selected", "true");
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        findOption(DEPLOYED).id,
      );
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        findOption("status").id,
      );
      fireEvent.keyDown(entry, { key: "ArrowUp" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        findOption("at least, operator").id,
      );
      fireEvent.keyDown(entry, { key: "Enter" });
      expect(onOptionSelect).toHaveBeenCalledWith("gte");
    });

    it("choose by pointer, keeping focus in the entry", () => {
      const onOptionSelect = vi.fn();
      const { entry } = setup({ options: OPTIONS, onOptionSelect });
      entry.focus();
      fireEvent.mouseMove(findOption("status"));
      expect(findOption("status")).toHaveAttribute("aria-selected", "true");
      expect(fireEvent.mouseDown(findOption("status"))).toBe(false);
      fireEvent.click(findOption("status"));
      expect(onOptionSelect).toHaveBeenCalledWith("status");
      expect(entry).toHaveFocus();
    });

    it("keep focus on the entry when the list itself is pressed", () => {
      const { entry, container } = setup({
        emptyText: "No matches",
        footer: "Separate values with commas",
      });
      entry.focus();
      fireEvent.focus(entry);
      for (const selector of [
        ".empty",
        ".footer",
        ".query-input-suggestions",
      ]) {
        const target = container.querySelector(selector) as Element;
        expect(fireEvent.mouseDown(target)).toBe(false);
      }
      expect(entry).toHaveFocus();
      expect(entry).toHaveAttribute("aria-expanded", "true");
    });

    it("choose one option after another", () => {
      const onOptionSelect = vi.fn();
      const { entry } = setup({ options: OPTIONS, onOptionSelect });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      fireEvent.keyDown(entry, { key: "Enter" });
      fireEvent.click(findOption(DEPLOYED));
      expect(onOptionSelect.mock.calls).toEqual([["status"], ["deployed"]]);
      expect(entry).toHaveValue("");
    });

    it("never highlight or choose a disabled or current option", () => {
      const onOptionSelect = vi.fn();
      const { entry } = setup({ options: OPTIONS, onOptionSelect });
      fireEvent.focus(entry);
      for (const name of ["owner", "pool"]) {
        fireEvent.mouseMove(findOption(name));
        fireEvent.click(findOption(name));
        expect(findOption(name)).toHaveAttribute("aria-selected", "false");
      }
      expect(onOptionSelect).not.toHaveBeenCalled();
    });

    it("never choose the highlighted option on blur", () => {
      const onOptionSelect = vi.fn();
      const { entry } = setup({ options: OPTIONS, onOptionSelect });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        expect.stringMatching(/option-status$/),
      );
      fireEvent.blur(entry, { relatedTarget: document.body });
      expect(onOptionSelect).not.toHaveBeenCalled();
      expect(entry).toHaveAttribute("aria-expanded", "false");
    });

    it("open again after a dismissal once focus leaves and returns", () => {
      const { entry } = setup({ options: OPTIONS });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "Escape" });
      expect(entry).toHaveAttribute("aria-expanded", "false");
      fireEvent.blur(entry);
      fireEvent.focus(entry);
      expect(entry).toHaveAttribute("aria-expanded", "true");
    });

    it("open again after a dismissal when the other entry takes focus, but not on a click", () => {
      render(
        <QueryInput {...base} options={OPTIONS}>
          <ChipEntry />
        </QueryInput>,
      );
      const own = screen.getByRole("combobox", { name: "Filter machines" });
      const chip = screen.getByRole("combobox", { name: "Value for status" });
      fireEvent.focus(own);
      fireEvent.keyDown(own, { key: "Escape" });
      fireEvent.blur(own, { relatedTarget: chip });
      fireEvent.focus(chip);
      expect(chip).toHaveAttribute("aria-expanded", "true");
      fireEvent.keyDown(chip, { key: "Escape" });
      expect(chip).toHaveAttribute("aria-expanded", "false");
      fireEvent.click(chip);
      expect(chip).toHaveAttribute("aria-expanded", "false");
      fireEvent.keyDown(chip, { key: "ArrowDown", altKey: true });
      expect(chip).toHaveAttribute("aria-expanded", "true");
    });

    it("are dismissed by Escape until typing or Down reopens them", () => {
      const onKeyDown = vi.fn();
      const { entry } = setup({ options: OPTIONS, onKeyDown });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "Escape" });
      expect(entry).toHaveAttribute("aria-expanded", "false");
      expect(onKeyDown).not.toHaveBeenCalled();
      fireEvent.keyDown(entry, { key: "Escape" });
      fireEvent.keyDown(entry, { key: "ArrowUp" });
      expect(onKeyDown).toHaveBeenCalledTimes(2);
      expect(entry).toHaveAttribute("aria-expanded", "false");
      fireEvent.change(entry, { target: { value: "s" } });
      expect(entry).toHaveAttribute("aria-expanded", "true");
      fireEvent.keyDown(entry, { key: "Escape" });
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(entry).toHaveAttribute("aria-expanded", "true");
    });

    it("pass the keys they do not handle to the host", () => {
      const onKeyDown = vi.fn();
      const { entry } = setup({ options: OPTIONS, onKeyDown });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "ArrowLeft" });
      fireEvent.keyDown(entry, { key: "Home" });
      fireEvent.keyDown(entry, { key: "Enter" });
      expect(onKeyDown).toHaveBeenCalledTimes(3);
    });

    it("drop a highlight whose option goes away", () => {
      const { entry, rerender } = setup({ options: OPTIONS });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "ArrowUp" });
      expect(entry).toHaveAttribute(
        "aria-activedescendant",
        expect.stringMatching(/option-/),
      );
      rerender(<QueryInput {...base} options={OPTIONS.slice(0, 1)} />);
      expectNoActiveOption(entry);
    });

    it("describe the focused entry with the footer while open", () => {
      const { entry } = setup({
        options: OPTIONS,
        footer: "Separate values with commas",
      });
      expect(entry).not.toHaveAccessibleDescription(
        "Separate values with commas",
      );
      fireEvent.focus(entry);
      expect(entry).toHaveAccessibleDescription("Separate values with commas");
    });

    it("show the spinner and tell the status region while loading", () => {
      const { entry, container } = setup({
        loading: true,
        loadingLabel: "Loading suggestions",
      });
      const status = screen.getByRole("status");
      expect(status).toBeEmptyDOMElement();
      fireEvent.focus(entry);
      expect(entry).toHaveAttribute("aria-expanded", "true");
      expect(status).toHaveTextContent("Loading suggestions");
      expect(container.querySelector(".loading")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("show the empty text and tell the status region when nothing matches", () => {
      const { entry, container } = setup({ emptyText: "No matches" });
      fireEvent.focus(entry);
      expect(screen.getByRole("status")).toHaveTextContent("No matches");
      expect(container.querySelector(".empty")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(
        screen.getByRole("listbox", { hidden: true }),
      ).toBeEmptyDOMElement();
    });

    it("say nothing in the status region while options show", () => {
      const { entry } = setup({ options: OPTIONS, emptyText: "No matches" });
      fireEvent.focus(entry);
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("serve a chip's entry, which takes them over while it has focus", () => {
      const onOptionSelect = vi.fn();
      render(
        <QueryInput {...base} options={OPTIONS} onOptionSelect={onOptionSelect}>
          <ChipEntry />
        </QueryInput>,
      );
      const own = screen.getByRole("combobox", { name: "Filter machines" });
      const chip = screen.getByRole("combobox", { name: "Value for status" });
      expect(chip).toHaveAttribute("aria-expanded", "false");
      fireEvent.focus(chip);
      expect(chip).toHaveAttribute("aria-expanded", "true");
      expect(chip).toHaveAttribute("aria-controls");
      expect(own).toHaveAttribute("aria-expanded", "false");
      expect(own).not.toHaveAttribute("aria-controls");
      fireEvent.change(chip, { target: { value: "dep" } });
      expect(chip).toHaveValue("dep");
      fireEvent.keyDown(chip, { key: "ArrowDown" });
      fireEvent.keyDown(chip, { key: "Enter" });
      expect(onOptionSelect).toHaveBeenCalledWith("status");
    });

    it("close when focus moves from a chip entry to a chip, with no blur", () => {
      const view = render(
        <QueryInput {...base} options={OPTIONS}>
          <ChipItem id="status" />
          <ChipEntry />
        </QueryInput>,
      );
      const own = screen.getByRole("combobox", { name: "Filter machines" });
      fireEvent.focus(
        screen.getByRole("combobox", { name: "Value for status" }),
      );
      expect(
        view.container
          .querySelector(".query-input-suggestions")
          ?.matches(":popover-open"),
      ).toBe(true);
      // Firefox moves focus to a chip without a blur first.
      fireEvent.focus(screen.getByRole("button", { name: "status" }));
      expect(
        view.container
          .querySelector(".query-input-suggestions")
          ?.matches(":popover-open"),
      ).toBe(false);
      expect(own).toHaveAttribute("aria-expanded", "false");
    });

    it("keep focus on the page when the host moves the stop after focus left", async () => {
      const view = render(
        <QueryInput {...base} activeItem="status" onActiveItemChange={() => {}}>
          <ChipItem id="status" />
        </QueryInput>,
      );
      const chip = screen.getByRole("button", { name: "status" });
      act(() => chip.focus());
      act(() => chip.blur());
      await act(() => new Promise((resolve) => setTimeout(resolve)));
      view.rerender(
        <QueryInput {...base} activeItem="entry" onActiveItemChange={() => {}}>
          <ChipItem id="status" />
        </QueryInput>,
      );
      await act(() => new Promise((resolve) => setTimeout(resolve)));
      expect(document.body).toHaveFocus();
      expect(
        screen.getByRole("combobox", { name: "Filter machines" }),
      ).toHaveAttribute("tabindex", "0");
    });

    it("close, and take no choice, once the field is disabled with focus in it", () => {
      const onOptionSelect = vi.fn();
      const view = render(
        <QueryInput
          {...base}
          options={OPTIONS}
          onOptionSelect={onOptionSelect}
        />,
      );
      const entry = screen.getByRole("combobox", { name: "Filter machines" });
      fireEvent.focus(entry);
      const popover = view.container.querySelector(
        ".query-input-suggestions",
      ) as Element;
      expect(popover.matches(":popover-open")).toBe(true);
      view.rerender(
        <QueryInput
          {...base}
          options={OPTIONS}
          onOptionSelect={onOptionSelect}
          disabled
        />,
      );
      expect(popover.matches(":popover-open")).toBe(false);
      fireEvent.click(
        screen.getAllByRole("option", { hidden: true })[0] as Element,
      );
      expect(onOptionSelect).not.toHaveBeenCalled();
    });

    it("stay closed once the field is enabled again, with nothing focused", () => {
      const view = render(
        <QueryInput
          {...base}
          options={OPTIONS}
          loading
          loadingLabel="Loading"
        />,
      );
      const entry = screen.getByRole("combobox", { name: "Filter machines" });
      fireEvent.focus(entry);
      const popover = view.container.querySelector(
        ".query-input-suggestions",
      ) as Element;
      expect(popover.matches(":popover-open")).toBe(true);
      view.rerender(
        <QueryInput
          {...base}
          options={OPTIONS}
          loading
          loadingLabel="Loading"
          disabled
        />,
      );
      // Enabled again, with no focus event, as in Firefox.
      view.rerender(
        <QueryInput
          {...base}
          options={OPTIONS}
          loading
          loadingLabel="Loading"
        />,
      );
      expect(popover.matches(":popover-open")).toBe(false);
      expect(entry).toHaveAttribute("aria-expanded", "false");
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("report the highlighted option as it moves, and undefined once closed", () => {
      const onHighlightChange = vi.fn();
      render(
        <QueryInput
          {...base}
          options={OPTIONS}
          onHighlightChange={onHighlightChange}
        />,
      );
      const entry = screen.getByRole("combobox", { name: "Filter machines" });
      fireEvent.focus(entry);
      fireEvent.keyDown(entry, { key: "ArrowDown" });
      expect(onHighlightChange).toHaveBeenLastCalledWith("status");
      fireEvent.keyDown(entry, { key: "Escape" });
      expect(onHighlightChange).toHaveBeenLastCalledWith(undefined);
    });

    it("close when the focused chip entry goes without a blur", () => {
      const view = render(
        <QueryInput {...base} options={OPTIONS}>
          <ChipEntry />
        </QueryInput>,
      );
      fireEvent.focus(
        screen.getByRole("combobox", { name: "Value for status" }),
      );
      const popover = view.container.querySelector(
        ".query-input-suggestions",
      ) as Element;
      expect(popover.matches(":popover-open")).toBe(true);
      view.rerender(<QueryInput {...base} options={OPTIONS} />);
      expect(popover.matches(":popover-open")).toBe(false);
    });

    it("stay open, saying nothing new, as focus moves between the entries", () => {
      const { container } = render(
        <QueryInput {...base} emptyText="No matches">
          <ChipEntry />
        </QueryInput>,
      );
      const popover = container.querySelector(
        ".query-input-suggestions",
      ) as HTMLElement;
      const hide = vi.spyOn(popover, "hidePopover");
      const own = screen.getByRole("combobox", { name: "Filter machines" });
      const chip = screen.getByRole("combobox", { name: "Value for status" });
      const status = screen.getByRole("status");
      fireEvent.focus(own);
      expect(status).toHaveTextContent("No matches");
      fireEvent.blur(own, { relatedTarget: chip });
      expect(status).toHaveTextContent("No matches");
      fireEvent.focus(chip);
      fireEvent.blur(chip, { relatedTarget: own });
      fireEvent.focus(own);
      expect(hide).not.toHaveBeenCalled();
      expect(status).toHaveTextContent("No matches");
    });
  });

  describe("the hidden chips", () => {
    /** Lays out a 100 px row whose chips are each 60 px wide. */
    const layOut = () =>
      vi
        .spyOn(Element.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: Element) {
          const index = this.parentElement
            ? [...this.parentElement.children].indexOf(this)
            : 0;
          const isChip = this.tagName === "LI";
          const left = isChip ? index * 60 : 0;
          const right = isChip ? left + 60 : 100;
          return { left, right, top: 0, bottom: 24 } as DOMRect;
        });

    it("show the host's words for the chips past the line, and fade it", () => {
      layOut();
      const hiddenLabel = vi.fn((count: number) => `+${count} more`);
      const { container } = render(
        <QueryInput {...base} hiddenLabel={hiddenLabel}>
          {renderChips(["status", "pool", "owner"])}
        </QueryInput>,
      );
      expect(screen.getByText("+2 more")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(hiddenLabel).toHaveBeenLastCalledWith(2);
      expect(container.firstElementChild).toHaveAttribute("data-overflowing");
    });

    it("show nothing while every chip fits", () => {
      layOut();
      const { container } = render(
        <QueryInput {...base} hiddenLabel={(count) => `+${count} more`}>
          {renderChips(["status"])}
        </QueryInput>,
      );
      expect(container.querySelector(".hidden-count")).toBeNull();
      expect(container.firstElementChild).not.toHaveAttribute(
        "data-overflowing",
      );
      expect(container.querySelector("li")).not.toHaveAttribute("data-clipped");
    });
  });

  describe("a press on the field", () => {
    it("focuses the entry and gives it the stop from the icon, the padding or the hidden count", () => {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
        function (this: Element) {
          const index = this.parentElement
            ? [...this.parentElement.children].indexOf(this)
            : 0;
          const left = this.tagName === "LI" ? index * 60 : 0;
          return {
            left,
            right: this.tagName === "LI" ? left + 60 : 100,
            top: 0,
          } as DOMRect;
        },
      );
      const onActiveItemChange = vi.fn();
      const { container } = render(
        <QueryInput
          {...base}
          activeItem="status"
          onActiveItemChange={onActiveItemChange}
          hiddenLabel={(count) => `+${count} more`}
        >
          {renderChips(["status", "pool", "owner"])}
        </QueryInput>,
      );
      const entry = screen.getByRole("combobox");
      for (const selector of [".search-icon", ".field", ".hidden-count"]) {
        onActiveItemChange.mockClear();
        (document.activeElement as HTMLElement | null)?.blur();
        const target = container.querySelector(selector) as Element;
        expect(fireEvent.mouseDown(target)).toBe(false);
        expect(entry).toHaveFocus();
        // Once per press: the entry's focus claims the stop.
        expect(onActiveItemChange).toHaveBeenCalledOnce();
        expect(onActiveItemChange).toHaveBeenCalledWith("entry");
      }
    });

    it("gives the stop to an entry that already has focus, but not the stop", () => {
      const onActiveItemChange = vi.fn();
      const { container } = render(
        <QueryInput
          {...base}
          activeItem="status"
          onActiveItemChange={onActiveItemChange}
        >
          {renderChips(["status"])}
        </QueryInput>,
      );
      const entry = screen.getByRole("combobox");
      act(() => entry.focus());
      onActiveItemChange.mockClear();
      fireEvent.mouseDown(container.querySelector(".search-icon") as Element);
      expect(onActiveItemChange).toHaveBeenCalledOnce();
      expect(onActiveItemChange).toHaveBeenCalledWith("entry");
    });

    it("reports nothing for a press while the entry holds focus and the stop", () => {
      const onActiveItemChange = vi.fn();
      const { container } = render(
        <QueryInput {...base} onActiveItemChange={onActiveItemChange} />,
      );
      act(() => screen.getByRole("combobox").focus());
      onActiveItemChange.mockClear();
      fireEvent.mouseDown(container.querySelector(".search-icon") as Element);
      expect(onActiveItemChange).not.toHaveBeenCalled();
    });

    it("focuses the entry from a gap in the chips' list", () => {
      render(<QueryInput {...base}>{renderChips(["status"])}</QueryInput>);
      expect(fireEvent.mouseDown(screen.getByRole("list"))).toBe(false);
      expect(screen.getByRole("combobox")).toHaveFocus();
    });

    it("leaves a press on the entry alone, and on a chip or the clear control gives it focus", () => {
      const onActiveItemChange = vi.fn();
      render(
        <QueryInput
          {...base}
          onActiveItemChange={onActiveItemChange}
          onClear={() => {}}
          clearLabel="Clear filters and search"
        >
          {renderChips(["status"])}
        </QueryInput>,
      );
      expect(fireEvent.mouseDown(screen.getByRole("combobox"))).toBe(true);
      for (const element of [
        screen.getByRole("button", { name: "status" }),
        screen.getByRole("button", { name: "Clear filters and search" }),
      ]) {
        expect(fireEvent.mouseDown(element)).toBe(false);
        expect(element).toHaveFocus();
      }
      // The focused chip claims the stop, as a click on it would; the entry
      // is never sent it.
      expect(onActiveItemChange).toHaveBeenCalledWith("status");
      expect(onActiveItemChange).not.toHaveBeenCalledWith("entry");
    });

    it("keeps focus where it is on a press on a chip's text or gaps", () => {
      const { container } = render(
        <QueryInput {...base}>
          <Chips>
            <li>
              <span className="ds query-chip">
                <span className="body">status</span>
                <ChipItem id="status" />
              </span>
            </li>
          </Chips>
        </QueryInput>,
      );
      const body = container.querySelector(".body") as Element;
      expect(fireEvent.mouseDown(body)).toBe(false);
      expect(document.body).toHaveFocus();
    });

    it("gives a pressed button or link focus itself, and leaves an input's press alone", () => {
      const { container } = render(
        <QueryInput {...base} onClear={() => {}} clearLabel="Clear">
          <Chips>
            <li>
              <span className="ds query-chip">
                <ChipItem id="status" />
                <input aria-label="Part" />
              </span>
            </li>
          </Chips>
        </QueryInput>,
      );
      const chip = screen.getByRole("button", { name: "status" });
      expect(fireEvent.mouseDown(chip)).toBe(false);
      expect(chip).toHaveFocus();
      const clear = container.querySelector(".clear") as HTMLElement;
      expect(fireEvent.mouseDown(clear)).toBe(false);
      expect(clear).toHaveFocus();
      expect(
        fireEvent.mouseDown(screen.getByRole("textbox", { name: "Part" })),
      ).toBe(true);
    });

    it("does nothing while the field is disabled", () => {
      const { container } = setup({ disabled: true });
      expect(
        fireEvent.mouseDown(container.querySelector(".search-icon") as Element),
      ).toBe(true);
    });

    it("reaches the host's ref to the entry", () => {
      const ref = createRef<HTMLInputElement>();
      setup({ ref });
      expect(ref.current).toBe(screen.getByRole("combobox"));
    });
  });

  describe("the clear control", () => {
    it("is absent without a label", () => {
      setup();
      expect(screen.queryByRole("button")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    });

    it("is a button that calls onClear", () => {
      const onClear = vi.fn();
      setup({ onClear, clearLabel: "Clear filters and search" });
      fireEvent.click(
        screen.getByRole("button", { name: "Clear filters and search" }),
      );
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("is a link with clearHref, whose click still calls onClear", () => {
      const onClear = vi.fn();
      setup({
        onClear,
        clearHref: "?",
        clearLabel: "Clear filters and search",
      });
      const link = screen.getByRole("link", {
        name: "Clear filters and search",
      });
      expect(link).toHaveAttribute("href", "?");
      link.addEventListener("click", (event) => event.preventDefault());
      fireEvent.click(link);
      expect(onClear).toHaveBeenCalledWith(
        expect.objectContaining({ type: "click" }),
      );
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("lets onClear keep the link from navigating", () => {
      setup({
        onClear: (event) => event.preventDefault(),
        clearHref: "?",
        clearLabel: "Clear filters and search",
      });
      expect(
        fireEvent.click(
          screen.getByRole("link", { name: "Clear filters and search" }),
        ),
      ).toBe(false);
    });

    it("is a disabled button while the field is disabled", () => {
      setup({
        clearHref: "?",
        clearLabel: "Clear filters and search",
        disabled: true,
      });
      expect(
        screen.getByRole("button", { name: "Clear filters and search" }),
      ).toBeDisabled();
    });
  });

  it("ends a highlight when focus leaves", () => {
    const { entry } = setup({ options: OPTIONS });
    fireEvent.focus(entry);
    fireEvent.keyDown(entry, { key: "ArrowDown" });
    expect(entry).toHaveAttribute(
      "aria-activedescendant",
      expect.stringMatching(/option-status$/),
    );
    act(() => entry.blur());
    fireEvent.blur(entry);
    fireEvent.focus(entry);
    expectNoActiveOption(entry);
  });
});
