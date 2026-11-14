import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import installPopoverStandIn from "../../../testing/installPopoverStandIn.js";
import QueryBuilder from "./QueryBuilder.js";
import type { Clause } from "./types.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const DEPLOYED: Clause = {
  id: "c1",
  field: "status",
  operator: "is",
  value: "deployed",
};
const GPU: Clause = { id: "c2", field: "pool", operator: "is", value: "gpu" };

const findEntry = () =>
  screen.getByRole<HTMLInputElement>("combobox", { name: "Filter machines" });
const findChip = (name: string) => screen.queryByRole("group", { name });
const findOption = (name: string | RegExp) =>
  screen.getByRole("option", { hidden: true, name });

describe("QueryBuilder", () => {
  it("starts a draft from a field typed exactly and Enter", async () => {
    render(<QueryBuilder />);
    act(() => findEntry().focus());
    fireEvent.change(findEntry(), { target: { value: "status" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Operator for status" }),
      ).toHaveFocus(),
    );
  });

  it("matches a field typed in another case", async () => {
    render(<QueryBuilder />);
    act(() => findEntry().focus());
    fireEvent.change(findEntry(), { target: { value: "Pool" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    expect(
      await screen.findByRole("combobox", { name: "Operator for pool" }),
    ).toBeInTheDocument();
  });

  it("leaves typed text with no exact match as search", () => {
    render(<QueryBuilder />);
    fireEvent.change(findEntry(), { target: { value: "sta" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    expect(screen.queryByRole("group")).toBeNull();
    expect(findEntry()).toHaveValue("sta");
  });

  it("moves from the empty entry to the last chip with Backspace", async () => {
    render(<QueryBuilder initial={[DEPLOYED, GPU]} />);
    act(() => findEntry().focus());
    expect(fireEvent.keyDown(findEntry(), { key: "Backspace" })).toBe(false);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "pool" })).toHaveFocus(),
    );
  });

  it("removes a chip with Delete or Backspace from any of its parts", async () => {
    render(<QueryBuilder initial={[DEPLOYED, GPU]} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "deployed" }), {
      key: "Delete",
    });
    expect(findChip("status is deployed")).toBeNull();
    fireEvent.keyDown(screen.getByRole("button", { name: "pool" }), {
      key: "Backspace",
    });
    expect(findChip("pool is gpu")).toBeNull();
  });

  it("moves the stop with the arrows, but not while the caret has text to cross", () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.change(findEntry(), { target: { value: "ab" } });
    findEntry().setSelectionRange(1, 1);
    expect(fireEvent.keyDown(findEntry(), { key: "ArrowLeft" })).toBe(true);
    expect(fireEvent.keyDown(findEntry(), { key: "ArrowRight" })).toBe(true);
    findEntry().setSelectionRange(0, 0);
    expect(fireEvent.keyDown(findEntry(), { key: "ArrowLeft" })).toBe(false);
    const first = screen.getByRole("button", { name: "status" });
    expect(first).toHaveAttribute("tabindex", "0");
    expect(fireEvent.keyDown(first, { key: "ArrowLeft" })).toBe(true);
    expect(fireEvent.keyDown(first, { key: "ArrowRight" })).toBe(false);
    expect(findEntry()).toHaveAttribute("tabindex", "0");
    expect(fireEvent.keyDown(first, { key: "Home" })).toBe(true);
  });

  it("leaves the arrows to the caret in an open Entry, keeping the draft", async () => {
    render(<QueryBuilder />);
    act(() => findEntry().focus());
    fireEvent.change(findEntry(), { target: { value: "status" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    const operator = await screen.findByRole("combobox", {
      name: "Operator for status",
    });
    expect(fireEvent.keyDown(operator, { key: "ArrowLeft" })).toBe(true);
    expect(fireEvent.keyDown(operator, { key: "ArrowRight" })).toBe(true);
    expect(operator).toBeInTheDocument();
    expect(findChip("status")).toBeInTheDocument();
  });

  it("returns to the entry from a chip on Escape or a typed character", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    const field = screen.getByRole("button", { name: "status" });
    act(() => field.focus());
    expect(fireEvent.keyDown(field, { key: "Escape" })).toBe(false);
    await waitFor(() => expect(findEntry()).toHaveFocus());
    act(() => field.focus());
    expect(fireEvent.keyDown(field, { key: " " })).toBe(true);
    expect(fireEvent.keyDown(field, { key: "c", ctrlKey: true })).toBe(true);
    expect(fireEvent.keyDown(field, { key: "p" })).toBe(false);
    await waitFor(() => expect(findEntry()).toHaveFocus());
    expect(findEntry()).toHaveValue("p");
  });

  it("leaves the stop and an open edit alone for the arrows on the clear control", () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const clear = screen.getByRole("button", {
      name: "Clear filters and search",
    });
    expect(fireEvent.keyDown(clear, { key: "ArrowLeft" })).toBe(true);
    expect(
      screen.getByRole("combobox", { name: "Value for status" }),
    ).toBeInTheDocument();
  });

  it("keeps Tab in a draft's Entry, moving between its parts", async () => {
    render(<QueryBuilder />);
    act(() => findEntry().focus());
    fireEvent.change(findEntry(), { target: { value: "status" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    const operator = await screen.findByRole("combobox", {
      name: "Operator for status",
    });
    expect(fireEvent.keyDown(operator, { key: "Tab" })).toBe(false);
    expect(
      await screen.findByRole("combobox", { name: "Value for status" }),
    ).toBeInTheDocument();
  });

  it("returns focus to the part an edit settled", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = await screen.findByRole("combobox", {
      name: "Value for status",
    });
    act(() => value.focus());
    fireEvent.click(findOption("ready"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "ready" })).toHaveFocus(),
    );
  });

  it("gives the moved Entry focus back after a field change", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "status" }));
    const field = await screen.findByRole("combobox", {
      name: "Field for status",
    });
    act(() => field.focus());
    fireEvent.click(findOption(/^pool/));
    await waitFor(() =>
      expect(
        screen.getByRole("combobox", { name: "Value for pool" }),
      ).toHaveFocus(),
    );
  });

  it("cancels an edit once focus has gone nowhere for a task", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = await screen.findByRole("combobox", {
      name: "Value for status",
    });
    act(() => value.focus());
    act(() => value.blur());
    await waitFor(() =>
      expect(
        screen.queryByRole("combobox", { name: "Value for status" }),
      ).toBeNull(),
    );
  });

  it("leaves focus on the page when it goes there, for a draft or an edit", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = screen.getByRole("combobox", { name: "Value for status" });
    act(() => value.focus());
    act(() => value.blur());
    await waitFor(() =>
      expect(
        screen.queryByRole("combobox", { name: "Value for status" }),
      ).toBeNull(),
    );
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.body).toHaveFocus();
    act(() => findEntry().focus());
    fireEvent.change(findEntry(), { target: { value: "pool" } });
    fireEvent.keyDown(findEntry(), { key: "Enter" });
    const operator = await screen.findByRole("combobox", {
      name: "Operator for pool",
    });
    act(() => operator.blur());
    await waitFor(() => expect(findChip("pool")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.body).toHaveFocus();
    expect(findEntry()).toHaveAttribute("aria-expanded", "false");
  });

  it("cancels an edit at once when focus leaves for another element", () => {
    render(
      <>
        <QueryBuilder initial={[DEPLOYED]} />
        <button type="button">Elsewhere</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = screen.getByRole("combobox", { name: "Value for status" });
    fireEvent.blur(value, {
      relatedTarget: screen.getByRole("button", { name: "Elsewhere" }),
    });
    expect(
      screen.queryByRole("combobox", { name: "Value for status" }),
    ).toBeNull();
  });

  it("holds the cancel during a press in the field, until the press ends", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = screen.getByRole("combobox", { name: "Value for status" });
    act(() => value.focus());
    // A press on a part that takes no focus, as in Safari.
    fireEvent.pointerDown(screen.getByRole("button", { name: "status" }));
    act(() => value.blur());
    await new Promise((resolve) => setTimeout(resolve));
    expect(
      screen.getByRole("combobox", { name: "Value for status" }),
    ).toBeInTheDocument();
    // The press ends with focus back in the field: the edit stays.
    act(() => value.focus());
    fireEvent.pointerUp(document);
    await new Promise((resolve) => setTimeout(resolve));
    expect(
      screen.getByRole("combobox", { name: "Value for status" }),
    ).toBeInTheDocument();
  });

  it("ends a press held by a pointercancel, as a scroll does", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(screen.getByRole("button", { name: "deployed" }));
    const value = screen.getByRole("combobox", { name: "Value for status" });
    act(() => value.focus());
    fireEvent.pointerDown(screen.getByRole("button", { name: "status" }));
    fireEvent.pointerCancel(document);
    await new Promise((resolve) => setTimeout(resolve));
    act(() => value.blur());
    await waitFor(() =>
      expect(
        screen.queryByRole("combobox", { name: "Value for status" }),
      ).toBeNull(),
    );
  });

  it("clears the field and gives the entry focus, then hides the clear control", async () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Clear filters and search" }),
    );
    expect(screen.queryByRole("group")).toBeNull();
    expect(findEntry()).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Clear filters and search" }),
    ).toBeNull();
  });

  it("removes a chip with its remove control", () => {
    render(<QueryBuilder initial={[DEPLOYED]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove status is deployed" }),
    );
    expect(findChip("status is deployed")).toBeNull();
  });

  it("disables the field and every chip", () => {
    render(<QueryBuilder disabled initial={[DEPLOYED]} />);
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
    expect(findEntry()).toBeDisabled();
  });

  it("sets the field's width", () => {
    const { container } = render(<QueryBuilder inlineSize="20rem" />);
    expect((container.firstElementChild as HTMLElement).style.inlineSize).toBe(
      "20rem",
    );
  });
});
