import { createAttachmentKey } from "svelte/attachments";
import type { Option } from "../../../subcomponent/types.js";
import getHighlightedIndex from "./utils/getHighlightedIndex.js";

/** Reads and writes one piece of combobox state held outside the builder. */
export type StateAccessor<T> = {
  get: () => T;
  set: (next: T) => void;
};

/** What a combobox is built from. */
export type ComboboxOptions = {
  /** Base of every element ID, as downshift's `downshift-<id>`. */
  id: string;
  /** The items currently listed. Read on every use, so it can be derived. */
  getItems: () => readonly Option[];
  /** The text shown for an item, in the list and in the input once picked. */
  convertItemToString: (item: Option | null) => string;
  /** The item selected at creation; its text fills the input. */
  initialSelectedItem?: Option | null;
  /**
   * Holds the typed text outside the builder, for example in a bindable prop.
   * Without it the builder keeps the text in its own state.
   */
  inputValue?: StateAccessor<string>;
  /**
   * Holds the selected item outside the builder. A selection a multiple
   * combobox keeps elsewhere pins it to `null`, as React pins downshift's
   * `selectedItem`, so picking the same item again is still a change.
   */
  selectedItem?: StateAccessor<Option | null>;
  /** Called when the user changes the selection, not when `selectItem` does. */
  onSelectedItemChange?: (item: Option | null) => void;
  /** Called whenever the typed text changes, whatever changed it. */
  onInputValueChange?: (inputValue: string) => void;
};

type Changes = {
  isOpen?: boolean;
  highlightedIndex?: number;
  selectedItem?: Option | null;
  inputValue?: string;
};

type Tracker = {
  isMouseDown: boolean;
  isTouchMove: boolean;
  isTouchEnd: boolean;
};

const PAGE_SIZE = 10;

/** Whether `node` is, or is inside, one of the elements. */
const isWithin = (
  node: unknown,
  elements: readonly (HTMLElement | undefined)[],
): boolean =>
  node instanceof Node &&
  elements.some((element) => element?.contains(node) ?? false);

/**
 * The state and markup of a single-selection combobox, after downshift's
 * `useCombobox`: the getters return attribute objects, handlers included, to
 * spread onto the input, the menu, its items, a toggle button and a label.
 * Keyboard and pointer behaviour follow downshift's state reducer, which
 * follows the WAI-ARIA "combobox with list autocomplete" pattern.
 */
export class Combobox {
  isOpen = $state(false);
  highlightedIndex = $state(-1);
  // Raw, so the item keeps its identity and is found among the items.
  #selectedItem: Option | null = $state.raw(null);
  #inputValue = $state("");

  readonly #options: ComboboxOptions;
  readonly #tracker: Tracker = {
    isMouseDown: false,
    isTouchMove: false,
    isTouchEnd: false,
  };
  /** Off while the mouse moves the highlight, so the list does not scroll. */
  #shouldScroll = true;
  #inputElement: HTMLInputElement | undefined;
  #menuElement: HTMLElement | undefined;
  #toggleButtonElement: HTMLElement | undefined;
  // One key per element, so a re-read getter keeps its attachment instead of
  // attaching it again.
  readonly #inputKey = createAttachmentKey();
  readonly #menuKey = createAttachmentKey();
  readonly #toggleButtonKey = createAttachmentKey();

  constructor(options: ComboboxOptions) {
    this.#options = options;
    const selected = options.initialSelectedItem ?? null;
    this.selectedItem = selected;
    if (selected) this.inputValue = options.convertItemToString(selected);
  }

  /** The selected item. */
  get selectedItem(): Option | null {
    const accessor = this.#options.selectedItem;
    return accessor ? accessor.get() : this.#selectedItem;
  }

  set selectedItem(next: Option | null) {
    if (this.#options.selectedItem) this.#options.selectedItem.set(next);
    else this.#selectedItem = next;
  }

  /** The typed text. */
  get inputValue(): string {
    return this.#options.inputValue?.get() ?? this.#inputValue;
  }

  set inputValue(next: string) {
    if (this.#options.inputValue) this.#options.inputValue.set(next);
    else this.#inputValue = next;
  }

  get labelId(): string {
    return `${this.#options.id}-label`;
  }

  get menuId(): string {
    return `${this.#options.id}-menu`;
  }

  get inputId(): string {
    return `${this.#options.id}-input`;
  }

  get toggleButtonId(): string {
    return `${this.#options.id}-toggle-button`;
  }

  /** The ID of the item at `index`. */
  getItemId(index: number): string {
    return `${this.#options.id}-item-${index}`;
  }

  get #items(): readonly Option[] {
    return this.#options.getItems();
  }

  /** Attributes for the text input. */
  get input() {
    return {
      "aria-activedescendant":
        this.isOpen && this.highlightedIndex > -1
          ? this.getItemId(this.highlightedIndex)
          : "",
      "aria-autocomplete": "list" as const,
      "aria-controls": this.menuId,
      "aria-expanded": this.isOpen,
      "aria-labelledby": this.labelId,
      autocomplete: "off" as const,
      id: this.inputId,
      role: "combobox" as const,
      value: this.inputValue,
      oninput: this.#handleInput,
      onkeydown: this.#handleKeyDown,
      onblur: this.#handleBlur,
      onclick: this.#handleInputClick,
      [this.#inputKey]: this.#attachInput,
    };
  }

  /** Attributes for the listbox. */
  get menu() {
    return {
      id: this.menuId,
      role: "listbox" as const,
      "aria-labelledby": this.labelId,
      onmouseleave: this.#handleMenuMouseLeave,
      [this.#menuKey]: this.#attachMenu,
    };
  }

  /** Attributes for a button that opens and closes the list. */
  get toggleButton() {
    return {
      "aria-controls": this.menuId,
      "aria-expanded": this.isOpen,
      id: this.toggleButtonId,
      tabindex: -1,
      onclick: this.#handleToggleButtonClick,
      [this.#toggleButtonKey]: this.#attachToggleButton,
    };
  }

  /** Attributes for the label of the input. */
  get label() {
    return { id: this.labelId, for: this.inputId };
  }

  /** Attributes for the option at `index`. */
  getItem(index: number) {
    return {
      "aria-disabled": false,
      "aria-selected": index === this.highlightedIndex,
      id: this.getItemId(index),
      role: "option" as const,
      onclick: () => this.#selectAt(index),
      onmousemove: () => this.#handleItemMouseMove(index),
      // Keeps focus on the input when an item is clicked.
      onmousedown: (event: MouseEvent) => event.preventDefault(),
    };
  }

  /** Opens the list, highlighting the selected item if it is listed. */
  openMenu(): void {
    this.#apply({ isOpen: true, highlightedIndex: this.#indexOnOpen(0) });
  }

  /**
   * Selects an item and shows its text, without reporting a change: the
   * caller reflects a value it already knows.
   */
  selectItem(item: Option | null): void {
    this.#apply(
      {
        selectedItem: item,
        inputValue: this.#options.convertItemToString(item),
      },
      false,
    );
  }

  /**
   * Applies a state change, then reports what changed. A change to the
   * selection is reported only when `isUserChange`, against the selection
   * before the change, so a pinned selection still reports each pick.
   */
  #apply(changes: Changes, isUserChange = true): void {
    const previousItem = this.selectedItem;
    const { selectedItem } = changes;
    const previousInputValue = this.inputValue;
    if (changes.isOpen !== undefined) this.isOpen = changes.isOpen;
    if (changes.highlightedIndex !== undefined)
      this.highlightedIndex = changes.highlightedIndex;
    if (changes.selectedItem !== undefined)
      this.selectedItem = changes.selectedItem;
    if (changes.inputValue !== undefined) this.inputValue = changes.inputValue;
    if (
      isUserChange &&
      selectedItem !== undefined &&
      selectedItem !== previousItem
    )
      this.#options.onSelectedItemChange?.(selectedItem);
    if (this.inputValue !== previousInputValue)
      this.#options.onInputValueChange?.(this.inputValue);
  }

  /** The highlight when the list opens: the selected item, else an end. */
  #indexOnOpen(offset: number): number {
    const items = this.#items;
    if (items.length === 0) return -1;
    if (this.selectedItem) return items.indexOf(this.selectedItem);
    if (offset < 0) return items.length - 1;
    if (offset > 0) return 0;
    return -1;
  }

  #move(offset: number): void {
    this.#apply({
      highlightedIndex: getHighlightedIndex(
        this.highlightedIndex,
        offset,
        this.#items.length,
      ),
    });
  }

  /** Selects the item at `index`, if any, then closes the list. */
  #selectAt(index: number): void {
    const item = this.#items[index];
    if (!item) {
      this.#apply({ isOpen: false, highlightedIndex: -1 });
      return;
    }
    this.#apply({
      isOpen: false,
      highlightedIndex: -1,
      selectedItem: item,
      inputValue: this.#options.convertItemToString(item),
    });
  }

  #handleInput = (event: Event): void => {
    this.#apply({
      isOpen: true,
      highlightedIndex: -1,
      inputValue: (event.currentTarget as HTMLInputElement).value,
    });
  };

  #handleInputClick = (): void => {
    this.#toggle();
  };

  #handleToggleButtonClick = (): void => {
    this.#toggle();
  };

  #toggle(): void {
    this.#apply({
      isOpen: !this.isOpen,
      highlightedIndex: this.isOpen ? -1 : this.#indexOnOpen(0),
    });
  }

  #handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (this.isOpen) this.#move(1);
        else
          this.#apply({
            isOpen: true,
            highlightedIndex:
              event.altKey && this.selectedItem === null
                ? -1
                : this.#indexOnOpen(1),
          });
        return;
      case "ArrowUp":
        event.preventDefault();
        if (!this.isOpen)
          this.#apply({
            isOpen: true,
            highlightedIndex: this.#indexOnOpen(-1),
          });
        else if (event.altKey) this.#selectAt(this.highlightedIndex);
        else this.#move(-1);
        return;
      case "Home":
      case "End":
        if (!this.isOpen) return;
        event.preventDefault();
        this.#apply({
          highlightedIndex:
            event.key === "Home"
              ? Math.min(0, this.#items.length - 1)
              : this.#items.length - 1,
        });
        return;
      case "PageUp":
      case "PageDown":
        if (!this.isOpen) return;
        event.preventDefault();
        this.#move(event.key === "PageUp" ? -PAGE_SIZE : PAGE_SIZE);
        return;
      case "Enter":
        // While an input method composes text, Enter confirms the text.
        if (!this.isOpen || event.isComposing) return;
        event.preventDefault();
        this.#selectAt(this.highlightedIndex);
        return;
      case "Escape":
        this.#handleEscape(event);
        return;
    }
  };

  /** Closes the list; on a closed list, clears the selection and the text. */
  #handleEscape(event: KeyboardEvent): void {
    if (!this.isOpen && !this.inputValue && !this.selectedItem) return;
    event.preventDefault();
    this.#apply({
      isOpen: false,
      highlightedIndex: -1,
      ...(this.isOpen ? {} : { selectedItem: null, inputValue: "" }),
    });
  }

  #handleBlur = (event: FocusEvent): void => {
    if (!this.isOpen || this.#tracker.isMouseDown) return;
    // Focus leaving the window is not a Tab to another control: nothing is
    // picked then.
    const isWindowBlur =
      event.relatedTarget === null && document.activeElement !== document.body;
    this.#closeOnBlur(!isWindowBlur);
  };

  /** Closes the list; with `isTab`, picks the highlighted item first. */
  #closeOnBlur(isTab: boolean): void {
    const item = isTab ? this.#items[this.highlightedIndex] : undefined;
    this.#apply({
      isOpen: false,
      highlightedIndex: -1,
      ...(item && {
        selectedItem: item,
        inputValue: this.#options.convertItemToString(item),
      }),
    });
  }

  #handleItemMouseMove(index: number): void {
    if (this.#tracker.isTouchEnd || index === this.highlightedIndex) return;
    this.#shouldScroll = false;
    this.#apply({ highlightedIndex: index });
  }

  #handleMenuMouseLeave = (): void => {
    this.#apply({ highlightedIndex: -1 });
  };

  get #elements(): (HTMLElement | undefined)[] {
    return [this.#menuElement, this.#toggleButtonElement, this.#inputElement];
  }

  #attachInput = (node: HTMLInputElement) => {
    this.#inputElement = node;
    // Opening the list brings focus to the input, as downshift does.
    $effect(() => {
      if (this.isOpen && document.activeElement !== node) node.focus();
    });
    // Pointer presses outside the combobox close the list, without picking.
    const tracker = this.#tracker;
    const closeOutside = (target: EventTarget | null, isTouch: boolean) => {
      const isInside =
        isWithin(target, this.#elements) ||
        (!isTouch && isWithin(document.activeElement, this.#elements));
      if (!isInside && this.isOpen) this.#closeOnBlur(false);
    };
    const listeners: Record<string, (event: Event) => void> = {
      mousedown: () => {
        tracker.isTouchEnd = false;
        tracker.isMouseDown = true;
      },
      mouseup: (event) => {
        tracker.isMouseDown = false;
        closeOutside(event.target, false);
      },
      touchstart: () => {
        tracker.isTouchEnd = false;
        tracker.isTouchMove = false;
      },
      touchmove: () => {
        tracker.isTouchMove = true;
      },
      touchend: (event) => {
        tracker.isTouchEnd = true;
        if (!tracker.isTouchMove) closeOutside(event.target, true);
      },
    };
    for (const [type, listener] of Object.entries(listeners))
      window.addEventListener(type, listener);
    return () => {
      for (const [type, listener] of Object.entries(listeners))
        window.removeEventListener(type, listener);
      this.#inputElement = undefined;
    };
  };

  #attachMenu = (node: HTMLElement) => {
    this.#menuElement = node;
    // Scrolls a highlight moved by the keyboard into view.
    $effect(() => {
      const index = this.highlightedIndex;
      if (index < 0 || !this.isOpen) return;
      if (!this.#shouldScroll) {
        this.#shouldScroll = true;
        return;
      }
      node.ownerDocument
        .getElementById(this.getItemId(index))
        ?.scrollIntoView({ block: "nearest" });
    });
    return () => {
      this.#menuElement = undefined;
    };
  };

  #attachToggleButton = (node: HTMLElement) => {
    this.#toggleButtonElement = node;
    return () => {
      this.#toggleButtonElement = undefined;
    };
  };
}

/** Creates the state and markup of a single-selection combobox. */
export default function createCombobox(options: ComboboxOptions): Combobox {
  return new Combobox(options);
}
