import { Button, Icon, Spinner } from "@canonical/react-ds-global";
import type React from "react";
import useObjectUrl from "../../hooks/useObjectUrl.js";
import type { FileMessage } from "../../types.js";
import { Thumbnail } from "../Thumbnail/index.js";
import type { FileItemProps } from "./types.js";

/**
 * One chosen file: its tile (thumbnail, name, size, upload status, retry and
 * remove) and the warning or error message under it. The message comes from
 * the file's validation or its failed upload; an `accept`, `maxSize` or
 * `validateFile` error wins, then an upload failure, then a warning.
 *
 * The tile carries the message's Criticality class (`warning` or `error`), so
 * its surface, text, icons and action buttons read the matching colour
 * channels.
 */
const FileItem = ({
  file,
  messageId,
  validation,
  live,
  upload,
  showFileSize,
  messages,
  onRemove,
  onRetry,
}: FileItemProps): React.ReactElement => {
  const isUploading = upload?.status === "uploading";
  const isFailed = upload?.status === "failed";
  const isImage = file.type.startsWith("image/");
  // Created here, not in the thumbnail, so the thumbnail and its preview share
  // one URL.
  const imageUrl = useObjectUrl(isImage ? file : undefined);

  const uploadMessage: FileMessage | undefined = isFailed
    ? { level: "error", message: messages.uploadFailed(file, upload.reason) }
    : undefined;
  const message =
    validation?.level === "error" ? validation : (uploadMessage ?? validation);
  const describedBy = message ? messageId : undefined;

  // The status holds the progress and one glyph: the spinner while the file
  // uploads, then the result icon until the result stops showing.
  let status: React.ReactNode = null;
  if (upload?.status === "uploading") {
    status = (
      <>
        <span className="upload-progress">
          {messages.progress(upload.progress)}
        </span>
        <Spinner aria-label={messages.statusUploading(file.name)} />
      </>
    );
  } else if (upload?.showResult) {
    let icon: "success-fill" | "warning-fill" | "error-fill" = "success-fill";
    let label = messages.statusUploaded(file.name);
    if (upload.status === "failed") {
      icon = "error-fill";
      label = messages.statusFailed(file.name);
    } else if (message?.level === "warning") {
      icon = "warning-fill";
      label = messages.statusUploadedWithWarning(file.name);
    }
    status = (
      <>
        <span className="upload-progress">
          {messages.progress(upload.status === "failed" ? upload.progress : 1)}
        </span>
        <Icon icon={icon} aria-label={label} />
      </>
    );
  }

  return (
    <li
      className={["file-item", message?.level].filter(Boolean).join(" ")}
      aria-describedby={describedBy}
    >
      <div className="tile">
        {isImage && <Thumbnail url={imageUrl} />}
        <div className="tile-details">
          <div className="file-info">
            <span className="file-name" title={file.name}>
              {file.name}
            </span>
            {showFileSize && (
              <span className="file-size">{messages.fileSize(file.size)}</span>
            )}
          </div>
          <div className="status-and-actions">
            {/* Polite: progress and the upload result are announced without
                interrupting. Rendered for every live tile, so the region
                exists before its content changes. */}
            {live && (
              <span className="file-status" aria-live="polite">
                {status}
              </span>
            )}
            <div className="file-actions">
              {isFailed && (
                <Button
                  type="button"
                  importance="tertiary"
                  icon="change-version"
                  className="file-action"
                  aria-label={messages.retryUpload(file.name)}
                  aria-describedby={describedBy}
                  onClick={() => onRetry(file)}
                />
              )}
              {/* Cancelling a running upload removes the file: removing it
                  from the value aborts the upload. */}
              <Button
                type="button"
                importance="tertiary"
                icon="close"
                className="file-action"
                aria-label={
                  isUploading
                    ? messages.cancelUpload(file.name)
                    : messages.remove(file.name)
                }
                aria-describedby={describedBy}
                onClick={() => onRemove(file)}
              />
            </div>
          </div>
        </div>
      </div>
      {message && (
        <p className="file-message" id={messageId}>
          <Icon
            icon={message.level === "error" ? "error" : "warning"}
            aria-label={messages.messageLevel(message.level)}
          />
          <span className="message-text">{message.message}</span>
        </p>
      )}
    </li>
  );
};

export default FileItem;
