import type { FileMessage, FileUploadMessages } from "../types.js";
import matchesAccept from "./matchesAccept.js";

export type FileRules = {
  accept?: string;
  maxSize?: number;
  validateFile?: (file: File) => FileMessage | undefined;
};

/**
 * The message for one chosen file: an error when `accept` or `maxSize` rejects
 * it, otherwise whatever `validateFile` returns. The input shows it under the
 * file's tile, and the field turns an error into an invalid field.
 * @note Pure when `validateFile` is.
 */
export default function getFileMessage(
  file: File,
  { accept, maxSize, validateFile }: FileRules,
  messages: Pick<
    FileUploadMessages,
    "fileSize" | "fileTooLarge" | "fileTypeNotAccepted"
  >,
): FileMessage | undefined {
  if (accept && !matchesAccept(file, accept)) {
    return { level: "error", message: messages.fileTypeNotAccepted(accept) };
  }
  if (typeof maxSize === "number" && file.size > maxSize) {
    return {
      level: "error",
      message: messages.fileTooLarge(messages.fileSize(maxSize)),
    };
  }
  return validateFile?.(file);
}
