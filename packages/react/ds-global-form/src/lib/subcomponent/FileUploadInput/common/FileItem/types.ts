import type {
  FileMessage,
  FileUploadMessages,
  UploadState,
} from "../../types.js";

/** Props for one file's tile in the file list. */
export type FileItemProps = {
  /** The chosen file. */
  file: File;
  /** The id of the message under the tile, which the tile references. */
  messageId: string;
  /** The `accept`, `maxSize` or `validateFile` message for the file. */
  validation?: FileMessage;
  /** Whether the input uploads files live, so the tile shows a status. */
  live: boolean;
  /** The file's live upload state, once it has been sent. */
  upload?: UploadState;
  /** Show the file size. */
  showFileSize: boolean;
  /** The texts the tile renders. */
  messages: FileUploadMessages;
  /** Removes the file from the selection. */
  onRemove: (file: File) => void;
  /** Aborts the file's running upload. */
  onCancel: (file: File) => void;
  /** Sends the file again. */
  onRetry: (file: File) => void;
};
