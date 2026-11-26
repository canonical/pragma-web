import type { BaseProps } from "../types.js";

/** Props for the presentational FileUpload input (controlled, no react-hook-form). */
export type FileUploadInputProps = BaseProps & {
  /**
   * Name of the native file input, so the selected files post in a plain HTML
   * submission. The form needs `enctype="multipart/form-data"` for the browser
   * to send file contents.
   */
  name?: string;

  /** Whether a file must be selected. Set on the native file input. */
  required?: boolean;

  /** Selected files (controlled value). */
  value?: File[];

  /** Called with the next file list when files are added or removed. */
  onChange?: (files: File[]) => void;

  /** Accepted MIME types (e.g. "image/*,.pdf") */
  accept?: string;

  /** Maximum file size in bytes */
  maxSize?: number;

  /** Maximum number of files */
  maxFiles?: number;

  /** Allow multiple file selection */
  multiple?: boolean;

  /** Whether the input is disabled */
  disabled?: boolean;
};
