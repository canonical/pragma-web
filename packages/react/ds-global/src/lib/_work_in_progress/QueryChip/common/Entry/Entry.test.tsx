import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryEntryProvider } from "../../../../common/QueryEntry/index.js";
import { RovingProvider } from "../../../../common/Roving/index.js";
import Context from "../Context.js";
import type { QueryChipContextValue } from "../types.js";
import Entry from "./Entry.js";

/** A chip in a roving toolbar whose stop is on the entry. */
const inToolbar = (
  children: ReactNode,
  chip: Partial<QueryChipContextValue> = {},
) => (
  <RovingProvider activeItem="chip:entry" onActiveItemChange={vi.fn()}>
    <Context.Provider
      value={{ id: "chip", isMounted: true, disabled: false, ...chip }}
    >
      {children}
    </Context.Provider>
  </RovingProvider>
);

describe("Entry", () => {
  it("is a plain text input named by its label without a combobox", () => {
    const onValueChange = vi.fn();
    render(
      <Entry
        value="dep"
        onValueChange={onValueChange}
        label="Value for status"
        placeholder="Type a value"
      />,
    );
    const input = screen.getByRole("textbox", { name: "Value for status" });
    expect(input).toHaveValue("dep");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Type a value");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("tabindex");
    fireEvent.change(input, { target: { value: "deployed" } });
    expect(onValueChange).toHaveBeenCalledWith("deployed");
  });

  it("passes its input's props through the combobox host", () => {
    const getInputProps = vi.fn((props) => ({
      ...props,
      role: "combobox",
      "aria-expanded": false,
    }));
    render(
      <QueryEntryProvider getInputProps={getInputProps}>
        <Entry value="" onValueChange={vi.fn()} label="Value" />
      </QueryEntryProvider>,
    );
    expect(screen.getByRole("combobox", { name: "Value" })).toBeInTheDocument();
    expect(getInputProps).toHaveBeenCalledWith(
      expect.objectContaining({ "aria-label": "Value", value: "" }),
    );
  });

  it("is the chip's roving item, as <id>:entry", () => {
    render(inToolbar(<Entry value="" onValueChange={vi.fn()} label="Value" />));
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-roving-item", "chip:entry");
    expect(input).toHaveAttribute("tabindex", "0");
  });

  it("stays in the tab order before scripts run", () => {
    render(
      inToolbar(<Entry value="" onValueChange={vi.fn()} label="Value" />, {
        isMounted: false,
      }),
    );
    expect(screen.getByRole("textbox")).not.toHaveAttribute("tabindex");
  });

  it("is disabled in a disabled chip", () => {
    render(
      inToolbar(<Entry value="" onValueChange={vi.fn()} label="Value" />, {
        disabled: true,
      }),
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("carries its fault, with its suffix, in its description", () => {
    const { container } = render(
      <Entry
        value="4x"
        onValueChange={vi.fn()}
        label="Memory"
        suffix="GiB"
        invalid
        description="Invalid: not a number"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("GiB Invalid: not a number");
    expect(container.firstElementChild).toHaveAttribute("data-invalid", "true");
  });

  it("shows a template as a hint hidden from assistive technology", () => {
    render(
      <Entry
        value=""
        onValueChange={vi.fn()}
        label="Range"
        template="from – to"
      />,
    );
    expect(screen.getByText("from – to")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
