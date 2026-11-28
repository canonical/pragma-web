import type {
  FileUploadMessages,
  UploadSummary,
} from "../../subcomponent/FileUploadInput/index.js";
import {
  type FileRules,
  getFileMessage,
} from "../../subcomponent/FileUploadInput/utils/index.js";

type FileUploadRules = FileRules & { maxFiles?: number };

/**
 * The field-level message of a file upload field, from the first rule that
 * fails, in order:
 *
 * - more files than `maxFiles` are chosen;
 * - a chosen file has an `accept`, `maxSize` or `validateFile` error (a
 *   warning does not invalidate the field);
 * - a live upload is still running, or failed.
 *
 * The per-file messages render under each file's tile; this message only makes
 * the field invalid, so a submit waits for every file to be valid and
 * uploaded. `undefined` when every rule passes.
 * @note Pure when `validateFile` is.
 */
export default function findFileUploadError(
  files: readonly File[],
  { maxFiles, ...fileRules }: FileUploadRules,
  messages: FileUploadMessages,
  { uploading, failed }: UploadSummary,
): string | undefined {
  if (typeof maxFiles === "number" && files.length > maxFiles) {
    return messages.tooManyFiles(maxFiles);
  }
  if (
    files.some(
      (file) => getFileMessage(file, fileRules, messages)?.level === "error",
    )
  ) {
    return messages.filesHaveErrors();
  }
  if (uploading > 0) return messages.uploadsPending();
  if (failed > 0) return messages.uploadsFailed();
  return undefined;
}
