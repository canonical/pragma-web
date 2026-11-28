import type { Attachment } from "svelte/attachments";
import { createAttachmentKey } from "svelte/attachments";
import type { Option } from "../../../subcomponent/types.js";

/** What a multiple selection is built from. */
export type MultipleSelectionOptions = {
  /** The selected items, in order. Read on every use, so it can be derived. */
  getSelectedItems: () => readonly Option[];
  /** Called with the new selection when the user adds or removes an item. */
  onSelectedItemsChange: (selectedItems: Option[]) => void;
  /**
   * Whether the dropdown leaves its keys and clicks alone, as downshift's
   * `preventKeyAction`: a multiple combobox passes it while its list is open.
   */
  isKeyActionPrevented?: () => boolean;
};

/**
 * Whether a key pressed in the dropdown may act on the selection: no modifier
 * is held, and the text input is empty or its caret is at the start.
 */
const isKeyActionPermitted = (event: KeyboardEvent): boolean => {
  if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey)
    return false;
  const element = event.target;
  return !(
    element instanceof HTMLInputElement &&
    element.value !== "" &&
    (element.selectionStart !== 0 || element.selectionEnd !== 0)
  );
};

/**
 * The state and markup of the selected items of a multiple combobox, after
 * downshift's `useMultipleSelection`: the selected items are chips with a
 * roving `tabindex`, ArrowLeft and ArrowRight move between them and back to
 * the dropdown (the text input), and Backspace or Delete removes one. Focus
 * follows the active chip. The selection itself is held by the caller.
 */
export class MultipleSelection {
  /** The index of the chip that holds focus, or -1 for the dropdown. */
  activeIndex = $state(-1);

  readonly #options: MultipleSelectionOptions;
  readonly #selectedItemElements = new Map<number, HTMLElement>();
  // One attachment per index, so a re-read getter keeps its attachment. The
  // chips are not keyed, so a chip keeps its index for as long as it lives.
  readonly #selectedItemAttachments = new Map<
    number,
    Attachment<HTMLElement>
  >();
  readonly #selectedItemKey = createAttachmentKey();
  readonly #dropdownKey = createAttachmentKey();

  constructor(options: MultipleSelectionOptions) {
    this.#options = options;
  }

  get #selectedItems(): readonly Option[] {
    return this.#options.getSelectedItems();
  }

  /**
   * Attributes for the dropdown, the text input of the combobox. Its handlers
   * are left out while key actions are prevented; a caller that has its own
   * calls these first.
   */
  get dropdown() {
    return {
      ...(!this.#options.isKeyActionPrevented?.() && {
        onkeydown: this.#handleDropdownKeyDown,
        onclick: this.#handleDropdownClick,
      }),
      [this.#dropdownKey]: this.#attachDropdown,
    };
  }

  /** Attributes for the chip of the selected item at `index`. */
  getSelectedItem(index: number) {
    return {
      tabindex: index === this.activeIndex ? 0 : -1,
      onkeydown: this.#handleSelectedItemKeyDown,
      [this.#selectedItemKey]: this.#attachSelectedItem(index),
    };
  }

  /** Adds an item to the end of the selection. */
  addSelectedItem(item: Option): void {
    this.#options.onSelectedItemsChange([...this.#selectedItems, item]);
  }

  /** Removes an item from the selection, keeping the active chip in range. */
  removeSelectedItem(item: Option): void {
    const index = this.#selectedItems.indexOf(item);
    if (index < 0) return;
    this.#removeAt(index);
  }

  /**
   * Removes the item at `index`. The active chip moves back when it was the
   * last one, and to the dropdown when no chip is left.
   */
  #removeAt(index: number): void {
    const items = this.#selectedItems;
    if (items.length === 1) this.activeIndex = -1;
    else if (index === items.length - 1) this.activeIndex = items.length - 2;
    this.#options.onSelectedItemsChange([
      ...items.slice(0, index),
      ...items.slice(index + 1),
    ]);
  }

  #handleSelectedItemKeyDown = (event: KeyboardEvent): void => {
    const count = this.#selectedItems.length;
    switch (event.key) {
      case "ArrowLeft":
        this.activeIndex = Math.max(this.activeIndex - 1, 0);
        return;
      case "ArrowRight":
        this.activeIndex =
          this.activeIndex + 1 >= count ? -1 : this.activeIndex + 1;
        return;
      case "Backspace":
      case "Delete":
        if (this.activeIndex >= 0) this.#removeAt(this.activeIndex);
        return;
    }
  };

  #handleDropdownKeyDown = (event: KeyboardEvent): void => {
    if (!isKeyActionPermitted(event)) return;
    const items = this.#selectedItems;
    if (event.key === "ArrowLeft") this.activeIndex = items.length - 1;
    else if (event.key === "Backspace" && items.length > 0)
      this.#options.onSelectedItemsChange(items.slice(0, -1));
  };

  #handleDropdownClick = (): void => {
    this.activeIndex = -1;
  };

  #attachDropdown = (node: HTMLElement) => {
    // Focus follows the active chip once it changes, and returns to the
    // dropdown when no chip is active.
    let isFirstRun = true;
    $effect(() => {
      const index = this.activeIndex;
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }
      if (index === -1) node.focus();
      else this.#selectedItemElements.get(index)?.focus();
    });
  };

  #attachSelectedItem(index: number): Attachment<HTMLElement> {
    const existing = this.#selectedItemAttachments.get(index);
    if (existing) return existing;
    const attachment: Attachment<HTMLElement> = (node) => {
      this.#selectedItemElements.set(index, node);
      return () => {
        this.#selectedItemElements.delete(index);
      };
    };
    this.#selectedItemAttachments.set(index, attachment);
    return attachment;
  }
}

/** Creates the state and markup of the selected items of a multiple combobox. */
export default function createMultipleSelection(
  options: MultipleSelectionOptions,
): MultipleSelection {
  return new MultipleSelection(options);
}
