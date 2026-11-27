import type { RegisterOptions, Validate } from "react-hook-form";
import type {
  FileUploadMessages,
  UploadSummary,
} from "../../subcomponent/FileUploadInput/index.js";
import {
  type FileRules,
  getFileMessage,
} from "../../subcomponent/FileUploadInput/utils/index.js";

type FileUploadRuleProps = FileRules & { maxFiles?: number };

const asFiles = (value: unknown): File[] =>
  Array.isArray(value) ? (value as File[]) : [];

/**
 * The react-hook-form `validate` rules of a file upload field, run in order:
 *
 * - `maxFiles` — more files than `maxFiles` are chosen;
 * - `files` — a chosen file has an `accept`, `maxSize` or `validateFile`
 *   error (a warning does not invalidate the field);
 * - `uploads` — a live upload is still running, or failed or was cancelled.
 *
 * The per-file messages render under each file's tile; these rules only make
 * the field invalid and give it one field-level message, so a submit waits for
 * every file to be valid and uploaded.
 *
 * A consumer `validate` from `registerProps` runs after these: a function is
 * added as `custom`, an object is merged in.
 */
export default function fileUploadRules(
  { maxFiles, ...fileRules }: FileUploadRuleProps,
  messages: FileUploadMessages,
  getUploadSummary: () => UploadSummary,
  registerProps: RegisterOptions = {},
): RegisterOptions {
  const { validate: consumerValidate, ...consumerRules } = registerProps;
  const validate: Record<string, Validate<unknown, unknown>> = {
    maxFiles: (value) =>
      typeof maxFiles !== "number" ||
      asFiles(value).length <= maxFiles ||
      messages.tooManyFiles(maxFiles),
    files: (value) =>
      asFiles(value).every(
        (file) => getFileMessage(file, fileRules, messages)?.level !== "error",
      ) || messages.filesHaveErrors(),
    uploads: () => {
      const { uploading, failed } = getUploadSummary();
      if (uploading > 0) return messages.uploadsPending();
      if (failed > 0) return messages.uploadsFailed();
      return true;
    },
    ...(typeof consumerValidate === "function"
      ? { custom: consumerValidate }
      : consumerValidate),
  };
  return { ...consumerRules, validate };
}
