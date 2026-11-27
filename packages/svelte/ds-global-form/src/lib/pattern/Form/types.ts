import type { Snippet } from "svelte";
import type { HTMLFormAttributes } from "svelte/elements";
import type { FormOwner, FormValues } from "../../utils/owner/types.js";

/**
 * Props for the Form. Native form attributes (`method`, `action`, …),
 * handlers and attachments are passed through to the `<form>`.
 */
export type FormProps<Values extends FormValues = FormValues> =
  HTMLFormAttributes & {
    /**
     * The state the fields read and write by name: their value, error and
     * blur; it also sees each submit first. Without it the form is native:
     * each field holds its own value and the browser posts them. Opt in with
     * `createFormState()`, or adapt a form library with `createBinding`.
     */
    owner?: FormOwner<Values>;
    /** The fields of the form. */
    children?: Snippet;
  };
