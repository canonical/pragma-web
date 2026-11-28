<script lang="ts">
  import { Button, Icon, Spinner } from "@canonical/svelte-ds-global";
  import useObjectUrl from "../../hooks/useObjectUrl.svelte.js";
  import type { FileMessage } from "../../types.js";
  import { Thumbnail } from "../Thumbnail/index.js";
  import type { FileItemProps } from "./types.js";

  let {
    file,
    messageId,
    fieldDescribedBy,
    validation,
    live,
    upload,
    showFileSize,
    messages,
    onremove,
    onretry,
  }: FileItemProps = $props();

  const isUploading = $derived(upload?.status === "uploading");
  const isFailed = $derived(upload?.status === "failed");
  const isImage = $derived(file.type.startsWith("image/"));
  // Created here, not in the thumbnail, so the thumbnail and its preview share
  // one URL.
  const image = useObjectUrl(() => (isImage ? file : undefined));

  const uploadMessage: FileMessage | undefined = $derived(
    upload?.status === "failed"
      ? { level: "error", message: messages.uploadFailed(file, upload.reason) }
      : undefined,
  );
  const message = $derived(
    validation?.level === "error" ? validation : (uploadMessage ?? validation),
  );
  const describedBy = $derived(message ? messageId : undefined);
  const actionDescribedBy = $derived(
    [describedBy, fieldDescribedBy].filter(Boolean).join(" ") || undefined,
  );

  /** The result glyph and its text alternative, once an upload has ended. */
  const result = $derived.by(() => {
    if (upload?.status === "failed") {
      return {
        icon: "error-fill" as const,
        label: messages.statusFailed(file.name),
        progress: upload.progress,
      };
    }
    if (message?.level === "warning") {
      return {
        icon: "warning-fill" as const,
        label: messages.statusUploadedWithWarning(file.name),
        progress: 1,
      };
    }
    return {
      icon: "success-fill" as const,
      label: messages.statusUploaded(file.name),
      progress: 1,
    };
  });
</script>

{#snippet action(name: "change-version" | "close", label: string, onclick: () => void)}<Button type="button" importance="tertiary" class="file-action" aria-label={label} aria-describedby={actionDescribedBy} {onclick}>{#snippet icon()}<Icon icon={name} />{/snippet}</Button>{/snippet}

<li class={["file-item", message?.level]} aria-describedby={describedBy}><div class="tile">{#if isImage}<Thumbnail url={image.url} />{/if}<div class="tile-details"><div class="file-info"><span class="file-name" title={file.name}>{file.name}</span>{#if showFileSize}<span class="file-size">{messages.fileSize(file.size)}</span>{/if}</div><div class="status-and-actions"><!-- Polite: progress and the upload result are announced without interrupting. Rendered for every live tile, so the region exists before its content changes. -->{#if live}<span class="file-status" aria-live="polite">{#if upload?.status === "uploading"}<span class="upload-progress">{messages.progress(upload.progress)}</span><Spinner aria-label={messages.statusUploading(file.name)} />{:else if upload?.showResult}<span class="upload-progress">{messages.progress(result.progress)}</span><Icon icon={result.icon} aria-label={result.label} />{/if}</span>{/if}<div class="file-actions">{#if isFailed}{@render action("change-version", messages.retryUpload(file.name), () => onretry(file))}{/if}<!-- Cancelling a running upload removes the file: removing it from the files aborts the upload. -->{@render action("close", isUploading ? messages.cancelUpload(file.name) : messages.remove(file.name), () => onremove(file))}</div></div></div></div>{#if message}<p class="file-message" id={messageId}><Icon icon={message.level === "error" ? "error" : "warning"} aria-label={messages.messageLevel(message.level)} /><span class="message-text">{message.message}</span></p>{/if}</li>

<!-- @component
One chosen file: its tile (thumbnail, name, size, upload status, retry and
remove) and the warning or error message under it. The message comes from the
file's validation or its failed upload; an `accept`, `maxSize` or
`validateFile` error wins, then an upload failure, then a warning.

The tile carries the message's Criticality class (`warning` or `error`), so its
surface, text, icons and action buttons read the matching colour channels.
-->
