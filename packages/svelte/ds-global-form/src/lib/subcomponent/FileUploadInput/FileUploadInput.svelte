<script lang="ts">
  import formatFileSize from "./formatFileSize.js";
  import type { FileUploadInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input file-upload";

  let {
    id,
    class: className,
    style,
    files = $bindable(),
    accept,
    // Read by the field as validation limits, so they are not spread onto the
    // drop-zone button as invalid attributes.
    maxSize: _maxSize,
    maxFiles: _maxFiles,
    multiple = false,
    disabled = false,
    name,
    required,
    ...rest
  }: FileUploadInputProps = $props();

  let fileInputRef: HTMLInputElement | undefined = $state();
  let isDragOver = $state(false);
  const selected = $derived(files ?? []);

  /**
   * Mirrors the bound files into the native input, so a plain submission posts
   * them and `required` sees them, however they were added. Reruns whenever
   * the selection changes.
   */
  const mirrorFiles = (input: HTMLInputElement) => {
    const transfer = new DataTransfer();
    for (const file of selected) transfer.items.add(file);
    input.files = transfer.files;
  };

  /** Reports the chosen files; constraints are validated by the field. */
  function addFiles(incoming: FileList) {
    const added = Array.from(incoming);
    files = multiple ? [...selected, ...added] : added.slice(0, 1);
  }

  function removeFile(index: number) {
    files = selected.filter((_, i) => i !== index);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) isDragOver = true;
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    const dropped = event.dataTransfer?.files;
    if (!disabled && dropped && dropped.length > 0) addFiles(dropped);
  }

  function handleClick() {
    if (!disabled) fileInputRef?.click();
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

  /**
   * Shows an image file in its preview element through an object URL, and
   * revokes the URL when the preview is removed or shows another file.
   */
  const showFilePreview = (file: File) => (image: HTMLImageElement) => {
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  };

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  }
</script>

<div {style} class={[componentCssClassName, className]}><button
    type="button"
    class={["drop-zone", isDragOver && "drag-over"]}
    ondragover={handleDragOver}
    ondragleave={() => (isDragOver = false)}
    ondrop={handleDrop}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    {disabled}
    {...rest}
  ><span class="drop-zone-text p">{isDragOver ? "Drop files here" : "Drop files here or click to browse"}</span></button><input
    bind:this={fileInputRef}
    {@attach mirrorFiles}
    {id}
    type="file"
    {name}
    {required}
    {accept}
    {multiple}
    {disabled}
    onchange={handleInputChange}
    tabindex="-1"
    aria-hidden="true"
  />{#if selected.length > 0}<ul class="file-list"><!-- Unkeyed: the same file may be added twice. -->{#each selected as file, index}<li class="file-item"
          >{#if file.type.startsWith("image/")}<img {@attach showFilePreview(file)} alt={`Preview of ${file.name}`} class="file-preview" 
          />{/if}<span class="file-name p">{file.name}</span
          ><span class="file-size p">{formatFileSize(file.size)}</span
          ><button
            type="button"
            class="file-remove"
            onclick={() => removeFile(index)}
            aria-label={`Remove ${file.name}`}
            {disabled}
          
            ><span class="p">&times;</span
          ></button
        ></li
      >{/each}</ul
  >{/if}</div>

<!-- @component
Presentational file upload with a drag-and-drop zone, file list and image
preview. Bind `files` for two-way binding.

The native file `<input>` sits beside the drop-zone `<button>`, not inside it,
and carries the `id`, `name` and `required`, so a `<label for>` reaches it and
the selection posts without JavaScript. Its files are kept in step with
`files`, including files added by drag and drop. A plain HTML submission only
sends file contents when the form has `enctype="multipart/form-data"`.

`import { FileUploadInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.file_upload_input
-->
