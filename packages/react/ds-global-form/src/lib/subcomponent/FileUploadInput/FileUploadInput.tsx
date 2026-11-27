import { Button } from "@canonical/react-ds-global";
import type React from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { FileItem } from "./common/FileItem/index.js";
import { useFileUploads } from "./hooks/index.js";
import defaultMessages from "./messages.js";
import type { FileUploadInputProps } from "./types.js";
import { getFileMessage } from "./utils/index.js";
import "./styles.css";

const componentCssClassName = "ds input file-upload";

const EMPTY: File[] = [];

/**
 * Presentational file upload input: a drop area, with a button that opens the
 * file picker, and the list of chosen files. Controlled via `value`/`onChange`
 * (no react-hook-form); the field tier supplies the binding.
 *
 * Each file's tile shows its name, optional size and an image thumbnail, and
 * any warning or error under it: `accept` and `maxSize` violations, the
 * `validateFile` result, and a failed upload. With an `upload` function the
 * input is live: it sends each valid file as soon as it is chosen and shows
 * its progress, then its result for a moment. Closing a running upload cancels
 * it and removes the file; a failed upload can be retried. Without `upload` it
 * only lists the files. An image's thumbnail shows the whole image on hover.
 *
 * `showDropArea` and `showFileList` turn the two halves off. While `error` is
 * set or `aria-invalid` is true, the drop area carries the `error`
 * Criticality class, so its border and fill read the error colours.
 *
 * The native file `<input>` sits beside the drop area, not inside it, and
 * carries the `id`, `name` and `required`, so a `<label for>` reaches it and
 * the selection posts without scripting. Its files are kept in step with
 * `value`, including files added by drag and drop. A plain HTML submission
 * only sends files when the form has `enctype="multipart/form-data"`. Live
 * upload needs scripting; without it the files post with the form.
 * @returns {React.ReactElement} - Rendered FileUploadInput
 *
 * `import { FileUploadInput } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.subcomponent.file_upload_input
 */
export const FileUploadInput = ({
  id,
  className,
  value,
  onChange,
  accept,
  maxSize,
  // The field reads `maxFiles` as a validation rule; the input does not drop
  // files over the limit. Destructured so it is not spread onto the root.
  maxFiles,
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
  onUploadStatusChange,
  messages: messageOverrides,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-errormessage": ariaErrorMessage,
  ...otherProps
}: FileUploadInputProps): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const baseId = useId();
  const buttonId = `${baseId}-choose`;

  const files = Array.isArray(value) ? value : EMPTY;
  const messages = useMemo(
    () => ({ ...defaultMessages, ...messageOverrides }),
    [messageOverrides],
  );

  // A stable key per File object, for list keys and message ids, so the same
  // file name chosen twice still gets two distinct tiles.
  const fileKeys = useRef({ next: 0, keys: new WeakMap<File, number>() });
  const keyOf = (file: File): number => {
    const { keys } = fileKeys.current;
    let key = keys.get(file);
    if (key === undefined) {
      key = fileKeys.current.next++;
      keys.set(file, key);
    }
    return key;
  };

  const validationOf = useCallback(
    (file: File) =>
      getFileMessage(file, { accept, maxSize, validateFile }, messages),
    [accept, maxSize, validateFile, messages],
  );

  const uploads = useFileUploads(files, {
    upload,
    canUpload: (file) => validationOf(file)?.level !== "error",
    onSummaryChange: onUploadStatusChange,
  });

  // Mirror the controlled files into the native input, so a plain submission
  // posts them and `required` sees them, whichever way they were added.
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files]);

  const addFiles = (incoming: FileList) => {
    const added = Array.from(incoming);
    onChange?.(multiple ? [...files, ...added] : added.slice(0, 1));
  };

  const removeFile = (file: File) => {
    onChange?.(files.filter((chosen) => chosen !== file));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Moving onto a child (the text or the button) is not leaving the area.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (!disabled && event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  };

  // A disabled input draws no file list.
  const fileListShown = showFileList && !disabled && files.length > 0;
  // In single-file mode the drop area, and the field error with it, hides
  // once a file is chosen and returns when the file is removed. It stays when
  // the file list is not drawn, since nothing else could then remove the file.
  const dropAreaShown =
    showDropArea && (multiple || files.length === 0 || !fileListShown);
  const isInvalid =
    Boolean(error) || ariaInvalid === true || ariaInvalid === "true";

  return (
    <div
      {...otherProps}
      className={[componentCssClassName, disabled && "disabled", className]
        .filter(Boolean)
        .join(" ")}
    >
      {dropAreaShown && (
        <div className="drop-area-group">
          {/* Drag and drop is a pointer shortcut: the button is the keyboard
              and assistive-technology path to the same file picker. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: the drop target is a pointer-only shortcut for the button inside it */}
          <div
            className={[
              "drop-area",
              isDragOver && "drag-over",
              isInvalid && "error",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className="drop-area-text">{messages.dropAreaText()}</span>
            <Button
              type="button"
              id={buttonId}
              importance="secondary"
              icon="upload"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              aria-labelledby={
                ariaLabelledBy ? `${ariaLabelledBy} ${buttonId}` : undefined
              }
              aria-describedby={ariaDescribedBy}
              aria-invalid={ariaInvalid}
              aria-errormessage={ariaErrorMessage}
            >
              {messages.chooseFile(multiple)}
            </Button>
          </div>
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        name={name}
        required={required}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
      />
      {fileListShown && (
        <ul className="file-list">
          {files.map((file) => {
            const key = keyOf(file);
            return (
              <FileItem
                key={key}
                file={file}
                messageId={`${baseId}-file-${key}-message`}
                validation={validationOf(file)}
                live={Boolean(upload)}
                upload={uploads.states.get(file)}
                showFileSize={showFileSize}
                messages={messages}
                onRemove={removeFile}
                onRetry={uploads.retry}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploadInput;
