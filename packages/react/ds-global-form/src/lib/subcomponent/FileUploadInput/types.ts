import type { ComponentProps, ReactNode } from "react";

/** How serious a per-file message is. */
export type FileMessageLevel = "warning" | "error";

/** A message shown under one file's tile. */
export type FileMessage = {
  level: FileMessageLevel;
  message: string;
};

/** What the input hands an `upload` function for each file. */
export type UploadOptions = {
  /** Aborted when the user cancels the upload, which removes the file. */
  signal: AbortSignal;
  /** Report the share of the file sent so far, from 0 to 1. */
  onProgress: (fraction: number) => void;
};

/**
 * Sends one file. Resolve when the file is stored; reject when it is not. A
 * rejection, including one caused by the abort signal, is caught by the input.
 */
export type UploadFunction = (
  file: File,
  options: UploadOptions,
) => Promise<void>;

/**
 * Where one file's live upload stands. Once an upload ends, `showResult` is
 * true while its progress and result icon show, then false.
 */
export type UploadState =
  | { status: "uploading"; progress: number }
  | { status: "uploaded"; showResult: boolean }
  | {
      status: "failed";
      reason: unknown;
      /** The share sent before the upload failed, from 0 to 1. */
      progress: number;
      showResult: boolean;
    };

/** How many live uploads are running, and how many need a retry. */
export type UploadSummary = {
  /** Files still uploading. */
  uploading: number;
  /** Files whose upload failed, and that are still chosen. */
  failed: number;
};

/**
 * Every text the input renders or announces. Pass a subset through the
 * `messages` prop to translate or reword it.
 */
export type FileUploadMessages = {
  /** The text in the drop area, before the button. */
  dropAreaText: () => string;
  /** The label of the button that opens the file picker. */
  chooseFile: (multiple: boolean) => string;
  /** A file size, from bytes. Change it to localise the size format. */
  fileSize: (bytes: number) => string;
  /** The visible upload progress, from 0 to 1. */
  progress: (fraction: number) => string;
  /** The text alternative of the spinner while a file uploads. */
  statusUploading: (fileName: string) => string;
  /** The text alternative of the success icon. */
  statusUploaded: (fileName: string) => string;
  /** The text alternative of the warning icon after an upload. */
  statusUploadedWithWarning: (fileName: string) => string;
  /** The text alternative of the error icon after a failed upload. */
  statusFailed: (fileName: string) => string;
  /** The name of the button that removes a file. */
  remove: (fileName: string) => string;
  /** The name of the button that cancels a running upload and removes the file. */
  cancelUpload: (fileName: string) => string;
  /** The name of the button that retries a failed upload. */
  retryUpload: (fileName: string) => string;
  /** The text alternative of the icon before a per-file message. */
  messageLevel: (level: FileMessageLevel) => string;
  /** The message under a file whose upload failed. */
  uploadFailed: (file: File, reason: unknown) => string;
  /** The message under a file larger than `maxSize`, given as a size text. */
  fileTooLarge: (maxSize: string) => string;
  /** The message under a file that `accept` does not allow. */
  fileTypeNotAccepted: (accept: string) => string;
  /** The field error when more than `maxFiles` files are chosen. */
  tooManyFiles: (maxFiles: number) => string;
  /** The field error while a chosen file has an error. */
  filesHaveErrors: () => string;
  /** The field error while a file is still uploading. */
  uploadsPending: () => string;
  /** The field error while a file's upload failed. */
  uploadsFailed: () => string;
};

type OwnProps = {
  /**
   * The `id` of the native file input, which a field label targets with
   * `for`. Not set on the root element.
   */
  id?: string;

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

  /**
   * Accepted file types, as in the native `accept` attribute (for example
   * `"image/*,.pdf"`). A file that does not match gets an error under its
   * tile.
   */
  accept?: string;

  /** Maximum file size in bytes. A larger file gets an error under its tile. */
  maxSize?: number;

  /**
   * Maximum number of files. The field reports a larger selection as a field
   * error; the input itself does not drop files.
   */
  maxFiles?: number;

  /**
   * Allow multiple files. When `false`, the drop area hides once a file is
   * chosen and returns when the file is removed. It stays while `showFileList`
   * is off, since the file list is then the only way to remove the file.
   */
  multiple?: boolean;

  /** Whether the input is disabled. A disabled input draws no file list. */
  disabled?: boolean;

  /**
   * Upload each file as soon as it is chosen. Without it the input only lists
   * the files, with no status, progress or retry.
   */
  upload?: UploadFunction;

  /**
   * Add a warning or an error to a file. Runs only when `accept` and
   * `maxSize` raise nothing. A file with an error is not uploaded.
   */
  validateFile?: (file: File) => FileMessage | undefined;

  /** Show each file's size on its tile. */
  showFileSize?: boolean;

  /**
   * Show the drop area, with its Choose file button. When off, the field-level
   * `error` under it hides with it, and the files can only be added by the
   * consumer through `value`.
   */
  showDropArea?: boolean;

  /** Show the list of chosen files, with their tiles and messages. */
  showFileList?: boolean;

  /**
   * A field-level message rendered under the drop area. While it is set, the
   * drop area takes the error colours.
   */
  error?: ReactNode;

  /** Called when the number of running or failed uploads changes. */
  onUploadStatusChange?: (summary: UploadSummary) => void;

  /** Replaces some of the default texts. */
  messages?: Partial<FileUploadMessages>;

  /** Labels the button that opens the file picker, with its own text. */
  "aria-labelledby"?: string;

  /** Describes the button that opens the file picker. */
  "aria-describedby"?: string;

  /**
   * Marks the button that opens the file picker as invalid, and gives the drop
   * area the error colours.
   */
  "aria-invalid"?: boolean | "true" | "false";

  /** Points the button that opens the file picker at the field error. */
  "aria-errormessage"?: string;
};

/**
 * Props for the presentational FileUpload input (controlled, no
 * react-hook-form). Renders a `<div class="ds input file-upload">` as its root.
 */
export type FileUploadInputProps = OwnProps &
  Omit<ComponentProps<"div">, keyof OwnProps>;
