import type { HTMLButtonAttributes } from "svelte/elements";

/**
 * Props for the presentational FileUpload input. The `id`, `name` and
 * `required` go on the native file input; other native attributes, handlers
 * and attachments are spread onto the drop-zone button.
 */
export type FileUploadInputProps = Omit<
  HTMLButtonAttributes,
  "type" | "value" | "name"
> & {
  /** The selected files. Bindable. */
  files?: File[];
  /** Accepted MIME types (e.g. "image/*,.pdf"). */
  accept?: string;
  /** Maximum file size in bytes; read by the field, not enforced here. */
  maxSize?: number;
  /** Maximum number of files; read by the field, not enforced here. */
  maxFiles?: number;
  /** Allow multiple file selection. */
  multiple?: boolean;
  /** Whether the input is disabled. */
  disabled?: boolean;
  /**
   * Name of the native file input, so the selected files post in a plain HTML
   * submission. The form needs `enctype="multipart/form-data"` for the browser
   * to send file contents.
   */
  name?: string;
  /** Whether a file must be selected. Set on the native file input. */
  required?: boolean;
};
