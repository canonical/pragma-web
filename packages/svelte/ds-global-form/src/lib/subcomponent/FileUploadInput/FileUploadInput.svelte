<script lang="ts">
  import { Button, Icon } from "@canonical/svelte-ds-global";
  import { FileItem } from "./common/FileItem/index.js";
  import useFileUploads from "./hooks/useFileUploads.svelte.js";
  import defaultMessages from "./messages.js";
  import type { FileUploadInputProps } from "./types.js";
  import { getFileMessage } from "./utils/index.js";
  import "./styles.css";

  const componentCssClassName = "ds input file-upload";

  let {
    id,
    class: className,
    files = $bindable(),
    accept,
    maxSize,
    // The field reads `maxFiles` as a validation rule; the input does not drop
    // files over the limit. Destructured so it is not spread onto the root.
    maxFiles: _maxFiles,
    multiple = false,
    disabled = false,
    name,
    required,
    upload,
    validateFile,
    showFileSize = true,
    showDropArea = true,
    showFileList = true,
    error,
    onuploadstatuschange,
    messages: messageOverrides,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-errormessage": ariaErrorMessage,
    ...rest
  }: FileUploadInputProps = $props();

  let fileInput: HTMLInputElement | undefined = $state();
  let isDragOver = $state(false);
  const baseId = $props.id();
  const buttonId = `${baseId}-choose`;

  const selected = $derived(files ?? []);
  const messages = $derived({ ...defaultMessages, ...messageOverrides });

  // A stable key per File object, for list keys and message ids, so the same
  // file name chosen twice still gets two distinct tiles.
  const fileKeys = { next: 0, keys: new WeakMap<File, number>() };
  const keyOf = (file: File): number => {
    let key = fileKeys.keys.get(file);
    if (key === undefined) {
      key = fileKeys.next++;
      fileKeys.keys.set(file, key);
    }
    return key;
  };
  // The same File object listed twice gets a key per position, so the keyed
  // list never sees a duplicate.
  const entries = $derived.by(() => {
    const seen = new Set<File>();
    return selected.map((file, index) => {
      const key = seen.has(file) ? `${keyOf(file)}-${index}` : `${keyOf(file)}`;
      seen.add(file);
      return { file, key };
    });
  });

  const validationOf = (file: File) =>
    getFileMessage(file, { accept, maxSize, validateFile }, messages);

  const uploads = useFileUploads({
    get files() {
      return selected;
    },
    get upload() {
      return upload;
    },
    canUpload: (file) => validationOf(file)?.level !== "error",
    onsummarychange: (summary) => onuploadstatuschange?.(summary),
  });

  /**
   * Mirrors the bound files into the native input, so a plain submission posts
   * them and `required` sees them, however they were added. Reruns whenever
   * the selection changes.
   */
  const mirrorFiles = (input: HTMLInputElement) => {
    if (typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    for (const file of selected) transfer.items.add(file);
    input.files = transfer.files;
  };

  function addFiles(incoming: FileList) {
    const added = Array.from(incoming);
    files = multiple ? [...selected, ...added] : added.slice(0, 1);
  }

  function removeFile(file: File) {
    files = selected.filter((chosen) => chosen !== file);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) isDragOver = true;
  }

  function handleDragLeave(
    event: DragEvent & { currentTarget: HTMLDivElement },
  ) {
    // Moving onto a child (the text or the button) is not leaving the area.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    isDragOver = false;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    const dropped = event.dataTransfer?.files;
    if (!disabled && dropped && dropped.length > 0) addFiles(dropped);
  }

  function handleInputChange(
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    const chosen = event.currentTarget.files;
    if (chosen && chosen.length > 0) {
      addFiles(chosen);
      event.currentTarget.value = "";
    }
  }

  // A disabled input draws no file list.
  const fileListShown = $derived(
    showFileList && !disabled && selected.length > 0,
  );
  // In single-file mode the drop area hides once a file is chosen and returns
  // when the file is removed. It stays when the file list is not drawn, since
  // nothing else could then remove the file.
  const dropAreaShown = $derived(
    showDropArea && (multiple || selected.length === 0 || !fileListShown),
  );
  // The group holds the drop area and the field error, and shows while either
  // does: the error stays when the drop area is off or hidden.
  const groupShown = $derived(dropAreaShown || Boolean(error));
  // Without the Choose file button, the file actions carry the field's
  // description and error, so the button that takes focus announces them.
  const fieldDescribedBy = $derived(
    dropAreaShown ? undefined : ariaDescribedBy,
  );
  const isInvalid = $derived(
    Boolean(error) || ariaInvalid === true || ariaInvalid === "true",
  );
</script>

<div {...rest} class={[componentCssClassName, disabled && "disabled", className]}>{#if groupShown}<div class="drop-area-group">{#if dropAreaShown}<!-- Drag and drop is a pointer shortcut: the button is the keyboard and assistive-technology path to the same file picker. --><!-- svelte-ignore a11y_no_static_element_interactions --><div class={["drop-area", isDragOver && "drag-over", isInvalid && "error"]} ondragover={handleDragOver} ondragleave={handleDragLeave} ondrop={handleDrop}><span class="drop-area-text">{messages.dropAreaText()}</span><!-- The field's invalid state and message reach the button, as in React. --><Button type="button" id={buttonId} importance="secondary" {disabled} onclick={() => fileInput?.click()} aria-labelledby={ariaLabelledBy ? `${ariaLabelledBy} ${buttonId}` : undefined} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid} aria-errormessage={ariaErrorMessage}>{#snippet icon()}<Icon icon="upload" />{/snippet}{messages.chooseFile(multiple)}</Button></div>{/if}{@render error?.()}</div>{/if}<input bind:this={fileInput} {@attach mirrorFiles} {id} type="file" {name} {required} {accept} {multiple} {disabled} onchange={handleInputChange} tabindex="-1" aria-hidden="true" />{#if fileListShown}<ul class="file-list">{#each entries as { file, key } (key)}<FileItem {file} messageId={`${baseId}-file-${key}-message`} {fieldDescribedBy} validation={validationOf(file)} live={Boolean(upload)} upload={uploads.states.get(file)} {showFileSize} {messages} onremove={removeFile} onretry={uploads.retry} />{/each}</ul>{/if}</div>

<!-- @component
Presentational file upload input: a drop area, with a button that opens the
file picker, and the list of chosen files. Bind `files` for two-way binding.

Each file's tile shows its name, optional size and an image thumbnail, and any
warning or error under it: `accept` and `maxSize` violations, the
`validateFile` result, and a failed upload. With an `upload` function the input
is live: it sends each valid file as soon as it is chosen and shows its
progress, then its result for a moment. Closing a running upload cancels it and
removes the file; a failed upload can be retried. Without `upload` it only
lists the files.

`showDropArea` and `showFileList` turn the two halves off. The field-level
`error` shows whether or not the drop area does. While `error` is set or
`aria-invalid` is true, the drop area carries the `error` Criticality class, so
its border and fill read the error colours. Without the drop area, the file
actions carry the field's `aria-describedby`.

The native file `<input>` sits beside the drop area, not inside it, and carries
the `id`, `name` and `required`, so a `<label for>` reaches it and the
selection posts without JavaScript. Its files are kept in step with `files`,
including files added by drag and drop. A plain HTML submission only sends
file contents when the form has `enctype="multipart/form-data"`. Live upload
needs JavaScript; without it the files post with the form.

`import { FileUploadInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.file_upload_input
-->
