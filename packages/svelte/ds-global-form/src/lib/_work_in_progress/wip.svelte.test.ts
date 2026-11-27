import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import Bound from "../../testing/Bound.fixtures.svelte";
import readBound from "../../testing/readBound.js";
import { ColorField } from "./component/ColorField/index.js";
import { ComboboxField } from "./component/ComboboxField/index.js";
import { RatingField } from "./component/RatingField/index.js";
import { ColorInput } from "./subcomponent/ColorInput/index.js";
import {
  List,
  ResetButton,
} from "./subcomponent/ComboboxInput/common/index.js";
import { ComboboxInput } from "./subcomponent/ComboboxInput/index.js";
import { RatingInput } from "./subcomponent/RatingInput/index.js";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("ColorInput", () => {
  it("opens the swatches, picks one and closes", async () => {
    const page = await render(Bound, { of: ColorInput, value: "#ffffff" });
    const trigger = page.container.querySelector(
      ".color-trigger",
    ) as HTMLButtonElement;
    await userEvent.click(trigger);
    const popover = page.container.querySelector(
      ".color-popover",
    ) as HTMLElement;
    await expect.poll(() => popover.matches(":popover-open")).toBe(true);
    await page.getByRole("option", { name: "#ef4444" }).click();
    await expect.poll(() => readBound(page.container)).toBe("#ef4444");
    await expect.poll(() => popover.matches(":popover-open")).toBe(false);
  });

  it("closes on an outside click and keeps it open on an inside click", async () => {
    const page = await render(ColorInput, {});
    await userEvent.click(
      page.container.querySelector(".color-trigger") as HTMLElement,
    );
    const popover = page.container.querySelector(
      ".color-popover",
    ) as HTMLElement;
    await expect.poll(() => popover.matches(":popover-open")).toBe(true);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    popover.click();
    expect(popover.matches(":popover-open")).toBe(true);
    document.body.click();
    await expect.poll(() => popover.matches(":popover-open")).toBe(false);
  });

  it("accepts a hex value in an allowed format only", async () => {
    const page = await render(Bound, {
      of: ColorInput,
      hexFormats: ["hex3", "hex8"],
    });
    const hex = page.getByRole("textbox", { name: "Hex color value" });
    expect(hex.element().getAttribute("maxlength")).toBe("8");
    await userEvent.fill(hex, "12");
    await expect.poll(() => readBound(page.container)).toBeNull();
    await userEvent.fill(hex, "abc");
    await expect.poll(() => readBound(page.container)).toBe("#abc");
  });

  it("renders the hex input inline without swatches, and can hide parts", async () => {
    const inline = await render(ColorInput, { swatches: [], name: "c" });
    expect(
      inline.container.querySelector(".ds.input.color.inline .no-separator"),
    ).not.toBeNull();
    const plain = await render(ColorInput, {
      swatches: [],
      showCurrentColor: false,
    });
    expect(plain.container.querySelector(".hex-input")).not.toBeNull();
    expect(plain.container.querySelector(".color-preview")).toBeNull();
    const bare = await render(ColorInput, {
      showHexInput: false,
      showCurrentColor: false,
    });
    expect(bare.container.querySelector(".hex-input")).toBeNull();
    expect(bare.container.querySelector(".color-preview")).toBeNull();
  });

  it("survives a browser without the popover API", async () => {
    const show = HTMLElement.prototype.showPopover;
    // @ts-expect-error simulating a browser without the popover API
    HTMLElement.prototype.showPopover = undefined;
    const page = await render(ColorInput, {});
    await userEvent.click(
      page.container.querySelector(".color-trigger") as HTMLElement,
    );
    HTMLElement.prototype.showPopover = show;
    expect(page.container.querySelector(".color-popover")).not.toBeNull();
  });

  it("starts the field at black", async () => {
    const page = await render(ColorField, { name: "brand", label: "Brand" });
    expect(page.container.querySelector(".color-value")?.textContent).toBe(
      "#000000",
    );
  });
});

describe("RatingInput", () => {
  it("binds the chosen star and labels the group", async () => {
    const page = await render(Bound, { of: RatingInput, name: "stars" });
    expect(
      page.getByRole("radiogroup").element().getAttribute("aria-label"),
    ).toBe("Rating");
    (
      page.getByRole("radio", { name: "3 of 5 stars" }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(page.container)).toBe(3);
  });

  it("offers half stars and custom labels", async () => {
    const page = await render(Bound, {
      of: RatingInput,
      name: "stars",
      id: "r",
      count: 10,
      allowHalf: true,
      "aria-label": "Rate",
      formatStarLabel: (value: number) => `${value} points`,
      value: 2,
    });
    expect(page.container.querySelectorAll("input")).toHaveLength(20);
    (
      page.getByRole("radio", { name: "1.5 points" }).element() as HTMLElement
    ).click();
    await expect.poll(() => readBound(page.container)).toBe(1.5);
    expect(page.container.querySelector("#r-1\\.5")).not.toBeNull();
    expect(
      page.getByRole("radiogroup").element().getAttribute("aria-label"),
    ).toBe("Rate");
  });

  it("names a single star in the singular and defers to a labelling element", async () => {
    const field = await render(RatingField, { name: "stars", label: "Stars" });
    const group = field.getByRole("radiogroup").element();
    expect(group.hasAttribute("aria-label")).toBe(false);
    expect(group.getAttribute("aria-labelledby")).toBe(
      field.container.querySelector("label")?.id,
    );
    const one = await render(RatingInput, { name: "s", count: 1 as never });
    expect(
      one.container.querySelector(".ds-visually-hidden")?.textContent,
    ).toBe("1 of 1 star");
  });
});

describe("ComboboxInput", () => {
  it("filters, highlights and selects one option", async () => {
    const onblur = vi.fn();
    const page = await render(Bound, { of: ComboboxInput, options, onblur });
    const input = page.getByRole("combobox");
    await userEvent.type(input, "an");
    expect(page.container.querySelectorAll("li")).toHaveLength(1);
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}{Enter}");
    await expect.poll(() => readBound(page.container)).toBe("banana");
    expect((input.element() as HTMLInputElement).value).toBe("Banana");
    await userEvent.keyboard("{Escape}");
    await userEvent.tab();
    expect(onblur).toHaveBeenCalled();
  });

  it("adds and removes chips, then resets", async () => {
    const page = await render(Bound, {
      of: ComboboxInput,
      options,
      isMultiple: true,
      openOnReset: true,
    });
    const input = page.getByRole("combobox");
    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}{Enter}");
    (page.container.querySelectorAll("li")[2] as HTMLElement).click();
    (page.container.querySelectorAll("li")[0] as HTMLElement).click();
    await expect
      .poll(() => readBound(page.container))
      .toEqual(["apple", "cherry"]);
    await page.getByRole("button", { name: /Apple/ }).click();
    await expect.poll(() => readBound(page.container)).toEqual(["cherry"]);
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => readBound(page.container)).toEqual([]);
  });

  it("clears a single selection, ignoring Enter on an empty highlight", async () => {
    const page = await render(Bound, {
      of: ComboboxInput,
      options,
      value: "apple",
    });
    await userEvent.click(page.getByRole("combobox"));
    await userEvent.keyboard("{Enter}");
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect.poll(() => readBound(page.container)).toBeNull();
  });

  it("renders a field around the input", async () => {
    const page = await render(ComboboxField, {
      name: "fruit",
      label: "Fruit",
      options,
    });
    expect(
      page.container.querySelector(".ds.field .ds.form-combobox"),
    ).not.toBeNull();
  });
});

describe("List and ResetButton", () => {
  it("marks highlighted and selected items and reports a pick", async () => {
    const onselect = vi.fn();
    const page = await render(List, {
      id: "l",
      items: options,
      highlightedIndex: 1,
      fieldValue: ["apple"],
      isOpen: false,
      onselect,
    });
    const items = page.container.querySelectorAll("li");
    expect(items[0].className).toBe("p selected");
    expect(items[1].className).toBe("p highlighted");
    expect(items[1].id).toBe("l-1");
    (items[2] as HTMLElement).click();
    expect(onselect).toHaveBeenCalledWith(options[2]);
    const bare = await render(List, {
      items: options,
      highlightedIndex: -1,
      fieldValue: undefined,
      isOpen: false,
    });
    (bare.container.querySelector("li") as HTMLElement).click();
    expect(bare.container.querySelector("li")?.hasAttribute("id")).toBe(false);
  });

  it("names the reset button from its messages", async () => {
    const page = await render(ResetButton, {
      onclick: vi.fn(),
      messages: { reset: () => "Reset" },
    });
    await expect
      .element(page.getByRole("button", { name: "Reset" }))
      .toBeInTheDocument();
  });
});
