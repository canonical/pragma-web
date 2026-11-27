import type { FileUploadMessages } from "./types.js";
import { formatFileSize } from "./utils/index.js";

const percent = new Intl.NumberFormat("en", { style: "percent" });

const messages: FileUploadMessages = {
  dropAreaText: () => "Drag and drop or",
  chooseFile: (multiple) => (multiple ? "Choose files" : "Choose file"),
  fileSize: (bytes) => formatFileSize(bytes),
  progress: (fraction) => percent.format(fraction),
  statusUploading: (fileName) => `Uploading ${fileName}`,
  statusUploaded: (fileName) => `${fileName} uploaded`,
  statusUploadedWithWarning: (fileName) =>
    `${fileName} uploaded with a warning`,
  statusFailed: (fileName) => `${fileName} failed to upload`,
  remove: (fileName) => `Remove ${fileName}`,
  cancelUpload: (fileName) => `Cancel upload of ${fileName}`,
  retryUpload: (fileName) => `Retry upload of ${fileName}`,
  messageLevel: (level) => (level === "error" ? "Error:" : "Warning:"),
  uploadFailed: () => "File failed to upload.",
  fileTooLarge: (maxSize) => `File size exceeds ${maxSize}.`,
  fileTypeNotAccepted: () => "File type is not accepted.",
  tooManyFiles: (maxFiles) =>
    `You can upload at most ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`,
  filesHaveErrors: () => "Remove the files that have errors.",
  uploadsPending: () => "Wait for the uploads to finish.",
  uploadsFailed: () => "Retry or remove the files that failed to upload.",
};

export default messages;
