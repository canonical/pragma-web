import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";
import type { RequiredIndicator } from "../subcomponent/Field/Label/types.js";

// Field-composition machinery types, shared by `Wrapper`, `ToggleWrapper` and
// every `*Field` component. Kept in `common/` (not a tier) so any tier may
// depend on them downward.

/**
 * Decides whether a field is shown. Inside a `Form` with an owner it receives
 * the owner's values; otherwise it closes over the application's own state and
 * receives an empty object. A hidden field is not rendered, so it is not
 * submitted; when a shown field becomes hidden, its value becomes `undefined`.
 */
export type Condition = (values: Readonly<Record<string, unknown>>) => boolean;

/**
 * The identity and accessibility wiring a field hands to its control. Spread it
 * onto the focusable, named element.
 */
export type ControlProps = {
  id: string;
  "aria-labelledby": string;
  "aria-describedby": string | undefined;
  "aria-errormessage": string | undefined;
  "aria-invalid": boolean;
  "aria-required": true | undefined;
  required: boolean;
};

/** Props of the chrome every visible field renders around its control. */
export type FieldChromeProps = {
  /** ID of the field root. The control gets its own generated ID. */
  id?: string;
  /** Additional CSS classes on the field root. */
  class?: ClassValue;
  /** Inline styles on the field root. */
  style?: string;
  /** Name of the control, used for submission and ID generation. */
  name: string;
  /** The field label. Falls back to `name`. */
  label?: string;
  /** Supporting text shown with the control. */
  description?: string;
  /** Validation message. When set, the field shows its error state. */
  error?: string;
  /** Is the field optional. Fields are required unless optional. */
  isOptional?: boolean;
  /** Which convention marks required/optional fields. Default: "required". */
  requiredIndicator?: RequiredIndicator;
  /** Decides whether the field is shown. */
  condition?: Condition;
};

/** Props the chrome takes from the field it wraps, beyond the field's own. */
export type ChromeCallbackProps = {
  /** Called when a shown field becomes hidden, so the field drops its value. */
  onhide?: () => void;
};

/** Props of the stacked field chrome. */
export type WrapperProps = FieldChromeProps &
  ChromeCallbackProps & {
    /** Where the description sits: above the control (default) or below it. */
    descriptionPosition?: "leading" | "trailing";
    /**
     * Render the label as plain text, not a `<label>`: for a group whose options
     * carry their own labels. The group references it with `aria-labelledby`.
     */
    mockLabel?: boolean;
    /** Renders the control, receiving its identity and accessibility wiring. */
    children: Snippet<[ControlProps]>;
  };

/**
 * At least one of `label`/`controlLabel` — expressed as a union so a
 * label-less toggle is a type error.
 */
export type ToggleLabelProps =
  | { label: string; controlLabel?: string }
  | { label?: string; controlLabel: string };

/** Props shared by the toggle fields (checkbox, switch). */
export type ToggleChromeProps = Omit<FieldChromeProps, "label"> &
  ToggleLabelProps & {
    /**
     * Which side of the control the inline label sits on. "after" (default)
     * follows the checkbox convention; "before" is the switch convention,
     * where a label before the switch names its purpose.
     */
    labelPosition?: "before" | "after";
  };

/** Props of the inline toggle chrome. */
export type ToggleWrapperProps = Omit<FieldChromeProps, "label"> &
  ChromeCallbackProps & {
    label?: string;
    controlLabel?: string;
    labelPosition?: "before" | "after";
    /** Renders the control, receiving its identity and accessibility wiring. */
    children: Snippet<[ControlProps]>;
  };
