import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FileUploadInputProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds input file-upload";

/**
 * Presentational file upload input with drag-and-drop zone, file list, and
 * image preview. Controlled via `value`/`onChange` (no react-hook-form). The
 * field tier supplies the binding.
 *
 * The native file `<input>` sits beside the drop-zone `<button>`, not inside it,
 * and carries the `id`, `name` and `required`, so a `<label for>` reaches it
 * and the selection posts without scripting. Its files are kept in step with
 * `value`, including files added by drag and drop. A plain HTML submission
 * only sends files when the form has `enctype="multipart/form-data"`.
 * @returns {React.ReactElement} - Rendered FileUploadInput
 *
 * `import { FileUploadInput } from "@canonical/react-ds-global-form";`
 *
 * @implements ds:global.subcomponent.file_upload_input
 */
export const FileUploadInput = ({
  id,
  className,
  style,
  value,
  onChange,
  accept,
  // Destructured out of `otherProps` so they are NOT spread onto the drop-zone
  // <button> as invalid DOM attributes. The FIELD reads them (as RHF validation
  // rules); the presentational input does not enforce them.
  maxSize,
  maxFiles,
  multiple = false,
  disabled = false,
  name,
  required,
  ...otherProps
}: FileUploadInputProps): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const files: File[] = Array.isArray(value) ? value : [];

  // Mirror the controlled files into the native input, so a plain submission
  // posts them and `required` sees them, whichever way they were added.
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof DataTransfer === "undefined") return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files]);

  /* Presentational only: report the chosen files up via `onChange`. Constraint
   * validation (maxFiles/maxSize) lives on the FIELD as a react-hook-form
   * `validate` rule so violations surface through the standard FieldError,
   * rather than being enforced (and silently dropped) here. `maxFiles`/`maxSize`
   * are still accepted for the field to read and for the native `accept` hint. */
  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles = Array.from(incoming);
      const merged = multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);
      onChange?.(merged);
    },
    [files, multiple, onChange],
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = files.filter((_, i) => i !== index);
      onChange?.(next);
    },
    [files, onChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [disabled, addFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      style={style}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className={["drop-zone", isDragOver && "drag-over"]
          .filter(Boolean)
          .join(" ")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...otherProps}
      >
        <span className="drop-zone-text p">
          {isDragOver
            ? "Drop files here"
            : "Drop files here or click to browse"}
        </span>
      </button>
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

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.lastModified}`} className="file-item">
              {file.type.startsWith("image/") && (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview of ${file.name}`}
                  className="file-preview"
                />
              )}
              <span className="file-name p">{file.name}</span>
              <span className="file-size p">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="file-remove"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
              >
                <span className="p">&times;</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/** Format bytes into a human-readable string. */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default FileUploadInput;
