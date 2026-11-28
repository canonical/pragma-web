<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { VALIDITY_EVENT } from "../../common/constants.js";
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import {
    FileUploadInput,
    type UploadSummary,
  } from "../../subcomponent/FileUploadInput/index.js";
  import defaultMessages from "../../subcomponent/FileUploadInput/messages.js";
  import findFileUploadError from "./findFileUploadError.js";
  import type { FileUploadFieldProps } from "./types.js";
  import "./styles.css";

  let { value = $bindable(), ...props }: FileUploadFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
  // The field's blur is the input's: it fires when focus leaves any of its
  // buttons, as React's bubbling `onBlur` on the input's root does.
  const { onblur, ...inputControl } = $derived(control);

  let uploadSummary = $state<UploadSummary>({ uploading: 0, failed: 0 });
  const messages = $derived({ ...defaultMessages, ...control.messages });
  const ruleMessage = $derived(
    findFileUploadError(value ?? [], control, messages, uploadSummary),
  );

  const handleUploadStatusChange = (summary: UploadSummary) => {
    uploadSummary = summary;
    control.onuploadstatuschange?.(summary);
  };

  /**
   * Holds the field's rules on the native file input as its custom validity,
   * so the browser blocks a submit and the field shows the message, as it
   * shows any native validation message. A form with `novalidate` is stopped
   * here instead. When the message changes, the field reads it again, so the
   * error clears once the uploads settle. An invalid field focuses its first
   * enabled button: Choose file, or a file's action when the drop area is
   * hidden.
   */
  const followRules: Attachment<HTMLDivElement> = (root) => {
    const input = root.querySelector('input[type="file"]') as HTMLInputElement;

    $effect(() => {
      input.setCustomValidity(ruleMessage ?? "");
      input.dispatchEvent(new Event(VALIDITY_EVENT, { bubbles: true }));
    });

    // The native input is visually hidden, so the browser's own report
    // (focus and a bubble on the input) is replaced by focusing the field's
    // button; the field shows the message.
    const focusField = (event: Event) => {
      event.preventDefault();
      root.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    };
    const stopSubmit = (event: SubmitEvent) => {
      const { form } = input;
      if (!form || event.target !== form || !form.noValidate) return;
      // Only the field's own rules: `required` is the owner's business there.
      if (!input.validity.customError) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      input.checkValidity();
    };
    const document = root.ownerDocument;
    input.addEventListener("invalid", focusField);
    document.addEventListener("submit", stopSubmit, true);
    return () => {
      input.removeEventListener("invalid", focusField);
      document.removeEventListener("submit", stopSubmit, true);
    };
  };
</script>

<Wrapper {...chrome} errorSlot="input" onhide={() => (value = undefined)}>{#snippet children(controlProps, error)}{@const { "aria-required": _ariaRequired, ...inputProps } = controlProps}<FileUploadInput {...inputProps} {...inputControl} onfocusout={onblur} required={controlProps.required} name={chrome.name} {error} onuploadstatuschange={handleUploadStatusChange} {@attach followRules} bind:files={value} />{/snippet}</Wrapper>

<!-- @component
FileUploadInput in the field frame: a label, an optional description, and the
input, which renders the field error under its drop area. Bind `value` to the
chosen files; upload state stays in the input.

`maxFiles`, per-file errors and uploads still running or failed make the field
invalid: the message is the native file input's custom validity, so the
browser holds a submit back and the field shows it, as it shows a native
`required` message. In a form with `novalidate` the field stops the submit
itself. An owner's error for the field wins over these messages.

`import { FileUploadField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.file_upload_field
-->
