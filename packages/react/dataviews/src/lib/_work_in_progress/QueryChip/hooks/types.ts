import type { FocusEvent, ReactNode, Ref } from "react";
import type { QueryChipPartContextValue } from "../common/types.js";
import type { QueryChipCriticality, QueryChipRemoveEvent } from "../types.js";

/** The chip's props the hook works from. */
export type UseQueryChipProps = {
  /** The chip's parts. */
  children: ReactNode;
  /** The chip's id, which names its toolbar item. */
  id?: string | undefined;
  /** The whole clause, spoken. */
  label?: string | undefined;
  /** The chip's Criticality value. */
  criticality?: QueryChipCriticality | undefined;
  /** Whether the chip is disabled. */
  disabled: boolean;
  /** Called by the remove control. */
  onRemove?: ((event: QueryChipRemoveEvent) => void) | undefined;
  /** The remove link's address. */
  removeHref?: string | undefined;
  /** The remove control's accessible name. */
  removeLabel?: string | undefined;
  /** The host's ref to the chip's root. */
  ref?: Ref<HTMLSpanElement> | undefined;
};

/** One part, with what the chip tells it. */
export type UseQueryChipPart = {
  /** Stable across renders. */
  key: string;
  /** The part as the host gave it. */
  node: ReactNode;
  /** What the part reads from the chip. */
  context: QueryChipPartContextValue;
};

/** A plain-text Segment's description, which the chip renders. */
export type UseQueryChipDescription = {
  /** Stable across renders. */
  key: string;
  /** The id description references point at. */
  id: string;
  /** The description. */
  text: string;
  /** Whether a description reference speaks it, so it renders hidden. */
  isReferenced: boolean;
};

/** What QueryChip renders. */
export type UseQueryChipResult = {
  /** The parts, in order. */
  parts: UseQueryChipPart[];
  /** The plain-text Segments' descriptions, rendered after the last part. */
  descriptions: UseQueryChipDescription[];
  /** The body's group role, name and focus claim, while a part is interactive. */
  groupProps: {
    role?: "group";
    "aria-label"?: string | undefined;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
  };
  /** The chip's root ref: the host's, and the chip's place in the composite. */
  rootRef: (node: HTMLSpanElement) => () => void;
  /** The remove control's props, shared by its link and button forms. */
  removeProps: {
    className: string;
    "aria-label": string | undefined;
    "aria-describedby": string | undefined;
    tabIndex: 0 | -1 | undefined;
    "data-roving-item"?: string;
    ref?: (node: HTMLElement | null) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onClick: (event: QueryChipRemoveEvent) => void;
  };
  /** Whether the remove control is a link: an address, and enabled. */
  isRemoveLink: boolean;
  /** Whether the remove button is inert: disabled, or before scripts run. */
  isRemoveInert: boolean;
};
