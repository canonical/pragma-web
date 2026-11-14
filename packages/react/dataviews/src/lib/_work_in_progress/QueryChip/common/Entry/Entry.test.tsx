import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { QueryEntryProvider } from "../../../../common/QueryEntry/index.js";
import { RovingProvider } from "../../../../common/Roving/index.js";
import QueryChip from "../../QueryChip.js";
import Entry from "./Entry.js";
import type { EntryProps } from "./types.js";

/** A roving toolbar whose stop is elsewhere, where interactive chips live. */
const Toolbar = ({ children }: { children: ReactNode }) => (
  <RovingProvider activeItem="other" onActiveItemChange={vi.fn()}>
    {children}
  </RovingProvider>
);

/** An Entry in a mounted chip. */
const renderEntry = (props: Partial<EntryProps> = {}) =>
  render(
    <Toolbar>
      <QueryChip id="chip" label="status">
        <QueryChip.Segment onActivate={vi.fn()}>status</QueryChip.Segment>
        <Entry
          value="dep"
          onValueChange={vi.fn()}
          label="Value for status"
          {...(props as object)}
        />
      </QueryChip>
    </Toolbar>,
  );

describe("Entry", () => {
  it("renders nothing before scripts run", () => {
    expect(
      renderToString(<Entry value="" onValueChange={vi.fn()} label="Value" />),
    ).toBe("");
  });

  it("is a text input named by its label without a combobox", () => {
    const onValueChange = vi.fn();
    renderEntry({ onValueChange, placeholder: "Type a value" });
    const input = screen.getByRole("textbox", { name: "Value for status" });
    expect(input).toHaveValue("dep");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Type a value");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).toHaveAttribute("tabindex", "-1");
    fireEvent.change(input, { target: { value: "deployed" } });
    expect(onValueChange).toHaveBeenCalledWith("deployed");
  });

  it("passes its remaining props to the input", () => {
    renderEntry({ autoComplete: "off", className: "mine", name: "value" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("name", "value");
    expect(input).toHaveClass("input", "mine");
  });

  it("keeps the host's ref, handlers and description on the toolbar item", () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    const onClick = vi.fn();
    const onActiveItemChange = vi.fn();
    render(
      <>
        <span id="hint">Press Enter to apply</span>
        <RovingProvider
          activeItem="other"
          onActiveItemChange={onActiveItemChange}
        >
          <QueryChip id="chip" label="status">
            <QueryChip.Segment onActivate={vi.fn()}>status</QueryChip.Segment>
            <Entry
              value=""
              onValueChange={vi.fn()}
              label="Value"
              ref={ref}
              onFocus={onFocus}
              onClick={onClick}
              aria-describedby="hint"
              invalid
              description="Invalid: empty"
            />
          </QueryChip>
        </RovingProvider>
      </>,
    );
    const input = screen.getByRole("textbox");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("data-roving-item", "chip:entry");
    expect(input).toHaveAccessibleDescription(
      "Invalid: empty Press Enter to apply",
    );
    fireEvent.focus(input);
    fireEvent.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onActiveItemChange).toHaveBeenCalledWith("chip:entry");
  });

  it("passes its input's props through the combobox host", () => {
    const getInputProps = vi.fn((props) => ({
      ...props,
      role: "combobox",
      "aria-expanded": false,
    }));
    render(
      <QueryEntryProvider getInputProps={getInputProps}>
        <Toolbar>
          <QueryChip id="chip" label="status">
            <QueryChip.Segment onActivate={vi.fn()}>status</QueryChip.Segment>
            <Entry value="" onValueChange={vi.fn()} label="Value" />
          </QueryChip>
        </Toolbar>
      </QueryEntryProvider>,
    );
    expect(screen.getByRole("combobox", { name: "Value" })).toBeInTheDocument();
    expect(getInputProps).toHaveBeenCalledWith(
      expect.objectContaining({ "aria-label": "Value", value: "" }),
    );
  });

  it("is described by its format, then its fault while invalid", () => {
    const { container } = renderEntry({
      value: "2026-13",
      template: "YYYY-MM-DD",
      formatDescription: "Date, format YYYY-MM-DD",
      invalid: true,
      description: "Invalid: no such month",
    });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Date, format YYYY-MM-DD Invalid: no such month",
    );
    expect(container.querySelector(".ds.query-chip-entry")).toHaveAttribute(
      "data-invalid",
      "true",
    );
  });

  it("is described by its format alone while valid", () => {
    renderEntry({
      value: "",
      template: "YYYY-MM-DD",
      formatDescription: "Date, format YYYY-MM-DD",
    });
    expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
      "Date, format YYYY-MM-DD",
    );
  });

  it("shows the rest of its template behind the typed text, hidden", () => {
    const { container } = renderEntry({
      value: "2026",
      template: "YYYY-MM-DD",
      formatDescription: "Date, format YYYY-MM-DD",
    });
    const template = container.querySelector(".template");
    expect(template).toHaveAttribute("aria-hidden", "true");
    expect(template?.querySelector(".typed")).toHaveTextContent("2026");
    expect(template).toHaveTextContent("2026-MM-DD");
  });

  it("shows its suffix after the typed text", () => {
    renderEntry({ suffix: "GiB" });
    expect(screen.getByText("GiB")).toHaveClass("suffix");
  });

  it("is disabled in a disabled chip", () => {
    render(
      <Toolbar>
        <QueryChip id="chip" label="status" disabled>
          <QueryChip.Segment onActivate={vi.fn()}>status</QueryChip.Segment>
          <Entry value="" onValueChange={vi.fn()} label="Value" />
        </QueryChip>
      </Toolbar>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
