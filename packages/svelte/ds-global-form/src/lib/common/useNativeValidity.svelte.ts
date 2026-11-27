import type { Attachment } from "svelte/attachments";
import { VALIDITY_EVENT } from "./constants.js";

/** Events after which an invalid field reads its controls' validity again. */
const REREAD_EVENTS = ["input", "change", "focusout", VALIDITY_EVENT] as const;

/** The form-associated controls whose validity a field shows. */
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/**
 * Reads the first validation message among a field's controls.
 * @note Impure: reads the DOM.
 */
function readValidationMessage(root: HTMLElement): string | undefined {
  for (const control of root.querySelectorAll<Control>(
    "input, select, textarea",
  )) {
    if (control.willValidate && control.validationMessage) {
      return control.validationMessage;
    }
  }
  return undefined;
}

/**
 * Follows the native validity of a field's controls, for the field to show
 * when it is given no `error`. Like the browser, which reports a message when
 * a submit fails, the field starts showing messages at its controls' first
 * `invalid` event: a submit, `checkValidity()`, `reportValidity()`, or a
 * `validateRemotely` answer. From then on it reads the message again on
 * every `input`, `change`, `focusout` and `ds:validity`, so a fixed value
 * clears it, as react-hook-form re-validates on change after a submit. A
 * reset of the enclosing form, or hiding the field, stops it again.
 * @note Impure: creates state; call during component initialisation.
 */
export default function useNativeValidity(): {
  /** The message to show, once a control was invalid. */
  readonly message: string | undefined;
  /** Attach to the field root, around its controls. */
  readonly follow: Attachment<HTMLElement>;
} {
  let message = $state<string>();

  const follow: Attachment<HTMLElement> = (root) => {
    let isFollowing = false;
    const start = () => {
      isFollowing = true;
      message = readValidationMessage(root);
    };
    // A control can fire `focusout` while Svelte updates the DOM, where state
    // must not change, so the message is read again once the update is done.
    const reread = () => {
      queueMicrotask(() => {
        if (isFollowing) message = readValidationMessage(root);
      });
    };
    const stop = () => {
      isFollowing = false;
      message = undefined;
    };
    const form = root.closest("form");
    root.addEventListener("invalid", start, true);
    for (const type of REREAD_EVENTS) root.addEventListener(type, reread);
    form?.addEventListener("reset", stop);
    return () => {
      root.removeEventListener("invalid", start, true);
      for (const type of REREAD_EVENTS) root.removeEventListener(type, reread);
      form?.removeEventListener("reset", stop);
      stop();
    };
  };

  return {
    get message() {
      return message;
    },
    follow,
  };
}
