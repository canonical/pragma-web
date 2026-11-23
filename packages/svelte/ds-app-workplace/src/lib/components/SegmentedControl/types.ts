import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = Omit<SvelteHTMLElements["div"], "children">;

/** An individual view available in the segmented control. */
export interface SegmentedControlItem {
  /** Text shown in the segment. */
  label: string;
  /** Stable, unique value used to identify the segment. */
  value: string;
  /** Whether the segment cannot be selected. */
  disabled?: boolean;
  /** ID of the associated tab panel. The consumer must render that panel. */
  ariaControls?: string;
  /** ID of the tab, usable as the associated panel's `aria-labelledby`. Generated when omitted. */
  id?: string;
}

/** Props for the `SegmentedControl` view switcher. Native div attributes are forwarded to the root. */
export interface SegmentedControlProps extends BaseProps {
  /** Accessible name for the group of segments. */
  "aria-label": string;
  /** Segments in visual order. Each value must be unique; disabled segments are skipped by keyboard navigation. */
  items: readonly SegmentedControlItem[];
  /** Selected value. Supports `bind:value`; the first enabled segment is displayed as selected if no enabled value matches. */
  value?: string;
  /** Called after selection changes by click or keyboard. Arrow keys, Home and End activate the focused segment immediately. */
  onValueChange?: (value: string, item: SegmentedControlItem) => void;
}
