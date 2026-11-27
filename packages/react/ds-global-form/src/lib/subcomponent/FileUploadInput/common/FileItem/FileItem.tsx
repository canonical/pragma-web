import { Button, Icon, Spinner } from "@canonical/react-ds-global";
import type React from "react";
import useObjectUrl from "../../hooks/useObjectUrl.js";
import type { FileMessage } from "../../types.js";
import type { FileItemProps } from "./types.js";

/** The image preview of a file, filling the 60×36 thumbnail box. */
const Thumbnail = ({ file }: { file: File }): React.ReactElement => {
  const url = useObjectUrl(file);
  // Decorative: the file name beside it already names the file.
  return <span className="thumbnail">{url && <img src={url} alt="" />}</span>;
};

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
  onCancel,
  onRetry,
}: FileItemProps): React.ReactElement => {
  const isUploading = upload?.status === "uploading";
  const isRetryable =
    upload?.status === "failed" || upload?.status === "cancelled";

  let uploadMessage: FileMessage | undefined;
  if (upload?.status === "failed") {
    uploadMessage = {
      level: "error",
      message: messages.uploadFailed(file, upload.reason),
    };
  } else if (upload?.status === "cancelled") {
    uploadMessage = { level: "error", message: messages.uploadCancelled(file) };
  }
  const message =
    validation?.level === "error" ? validation : (uploadMessage ?? validation);
  const describedBy = message ? messageId : undefined;

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
  } else if (upload?.status === "finished") {
    const warned = message?.level === "warning";
    status = (
      <>
        <span className="upload-progress">{messages.progress(1)}</span>
        <Icon
          icon={warned ? "warning-fill" : "success-fill"}
          className={warned ? "status-warning" : "status-success"}
          aria-label={
            warned
              ? messages.statusUploadedWithWarning(file.name)
              : messages.statusUploaded(file.name)
          }
        />
      </>
    );
  } else if (isRetryable) {
    status = (
      <Icon
        icon="error-fill"
        className="status-error"
        aria-label={messages.statusFailed(file.name)}
      />
    );
  }

  return (
    <li
      className={["file-item", message?.level].filter(Boolean).join(" ")}
      aria-describedby={describedBy}
    >
      <div className="tile">
        {file.type.startsWith("image/") && <Thumbnail file={file} />}
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
              {isRetryable && (
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
                onClick={() => (isUploading ? onCancel(file) : onRemove(file))}
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
