import type { ComponentProps, MouseEvent, ReactNode } from "react";
import type { QueryInputOption } from "./common/types.js";

export type { QueryInputOption } from "./common/types.js";

/** The clear control: absent, or named by `clearLabel` on either route. */
type ClearProps =
  | {
      /** Called by the clear control. */
      onClear?: undefined;
      /** Makes the clear control a link to this address. */
      clearHref?: undefined;
      /** The clear control's accessible name. */
      clearLabel?: undefined;
    }
  | {
      /**
       * Called with the clear control's click. Passing it shows the control.
       * With `clearHref`, `preventDefault()` keeps the link from navigating.
       */
      onClear: (
        event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
      ) => void;
      /**
       * Makes the clear control a link to this address, so that clearing
       * works before scripts run; a click still calls `onClear`.
       */
      clearHref?: string | undefined;
      /** The clear control's accessible name, such as "Clear filters and search". */
      clearLabel: string;
    }
  | {
      /**
       * Called with the clear control's click, when given; `preventDefault()`
       * keeps the link from navigating.
       */
      onClear?:
        | ((event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void)
        | undefined;
      /**
       * Makes the clear control a link to this address, so that clearing
       * works before scripts run. Passing it shows the control.
       */
      clearHref: string;
      /** The clear control's accessible name, such as "Clear filters and search". */
      clearLabel: string;
    };

/** The loading state, and the words the status region announces for it. */
type LoadingProps =
  | {
      /** Shows the spinner in the suggestions. */
      loading?: false | undefined;
      /** The words announced while the suggestions load. */
      loadingLabel?: string | undefined;
    }
  | {
      /** Shows the spinner in the suggestions. */
      loading: true;
      /** The words announced while the suggestions load, such as "Loading suggestions". */
      loadingLabel: string;
    };

/** QueryInput's own props. */
type OwnProps = {
  /** The accessible name of the entry and of the toolbar. */
  label: string;
  /** The toolbar's accessible description: the keys its host handles. */
  description?: string | undefined;
  /** One QueryChips group, shown before the entry. */
  children?: ReactNode | undefined;
  /** The typed text. */
  value: string;
  /** Called with the typed text after each input. */
  onValueChange: (value: string) => void;
  /** Shown while nothing is typed and no chip is held. */
  placeholder?: string | undefined;
  /** The suggestions, in order. */
  options?: QueryInputOption[] | undefined;
  /** Called with an option's id when it is chosen. */
  onOptionSelect?: ((optionId: string) => void) | undefined;
  /**
   * Called with the highlighted option's id as the highlight moves, and with
   * undefined once nothing is highlighted, so a host can commit it on Tab or
   * blur.
   */
  onHighlightChange?: ((optionId: string | undefined) => void) | undefined;
  /** Shown in the suggestions when there are no options. */
  emptyText?: string | undefined;
  /** A hint at the foot of the suggestions. */
  footer?: string | undefined;
  /** Disables the field. */
  disabled?: boolean | undefined;
  /** The roving item that holds the toolbar's tab stop. Left out, QueryInput keeps it. */
  activeItem?: string | undefined;
  /** Called with the item id when the tab stop moves. */
  onActiveItemChange?: ((itemId: string) => void) | undefined;
  /**
   * Called with the number of chips the unfocused field hides; returns their
   * words, such as "+3 more", from the host's messages. Required with chips.
   */
  hiddenLabel?: ((count: number) => string) | undefined;
} & ClearProps &
  LoadingProps;

/**
 * QueryInput's props. As with the package's other inputs, `id`, `className`
 * and `style` reach the root, and the remaining props reach the entry
 * `<input>`, such as `name`, which renders the baseline before scripts run.
 * `onValueChange` reports typing and `label` names the entry, so the native
 * `onChange`, `aria-label` and `aria-labelledby` are not taken. QueryInput owns the entry's
 * value, its tab stop and its combobox state, so `defaultValue`, `tabIndex`,
 * `autoComplete` and the combobox's ARIA are not taken either.
 *
 * @experimental Its block is a draft; the props may change.
 */
export type QueryInputProps = OwnProps &
  Omit<
    ComponentProps<"input">,
    | keyof OwnProps
    | "type"
    | "role"
    | "onChange"
    | "defaultValue"
    | "tabIndex"
    | "autoComplete"
    | "aria-label"
    | "aria-labelledby"
    | "aria-expanded"
    | "aria-controls"
    | "aria-activedescendant"
    | "aria-autocomplete"
  >;
