import type {
  FileMessage,
  UploadFunction,
} from "../lib/subcomponent/FileUploadInput/index.js";

/**
 * A file of a given size. The content is a single byte; the size is pinned so
 * the tile shows a realistic one without allocating it.
 */
export const sampleFile = (name: string, size: number, type = ""): File => {
  const file = new File(["x"], name, { type, lastModified: 0 });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

/** A small image, so the tile draws a thumbnail. */
export const sampleImage = (name = "landscape.svg"): File =>
  new File(
    [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36"><rect width="60" height="36" fill="#e95420"/><circle cx="30" cy="18" r="10" fill="#fff"/></svg>',
    ],
    name,
    { type: "image/svg+xml", lastModified: 0 },
  );

/**
 * A tall image, which the 5:3 thumbnail crops, so its preview shows more than
 * the thumbnail does.
 */
export const portraitImage = (name = "portrait.svg"): File =>
  new File(
    [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><rect width="120" height="200" fill="#77216f"/><rect y="0" width="120" height="50" fill="#e95420"/><rect y="150" width="120" height="50" fill="#e95420"/><circle cx="60" cy="100" r="30" fill="#fff"/></svg>',
    ],
    name,
    { type: "image/svg+xml", lastModified: 0 },
  );

const MB = 1024 * 1024;

export const reportPdf = (): File =>
  sampleFile("quarterly-report.pdf", 1.2 * MB, "application/pdf");

export const longNamedIso = (): File =>
  sampleFile(
    "ubuntu-24.04-live-server-amd64-with-a-very-long-configuration-name.iso",
    2.5 * 1024 * MB,
    "application/x-iso9660-image",
  );

/**
 * An upload that reports a fixed share and never settles, so a story shows
 * the uploading state without timers.
 */
export const stalledUpload =
  (fraction: number): UploadFunction =>
  (_file, { onProgress }) => {
    onProgress(fraction);
    return new Promise<void>(() => {});
  };

/** An upload that fails at once, so a story shows the failed state. */
export const failingUpload: UploadFunction = () =>
  Promise.reject(new Error("The server is unavailable."));

/**
 * A simulated upload for interactive stories: it reports progress in steps of
 * ten percent and resolves after about two seconds. A file whose name contains
 * "fail" is rejected half-way. It honours the abort signal.
 */
export const simulatedUpload: UploadFunction = (file, { signal, onProgress }) =>
  new Promise<void>((resolve, reject) => {
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      onProgress(step / 10);
      if (file.name.includes("fail") && step === 5) {
        clearInterval(timer);
        reject(new Error("Simulated failure"));
      } else if (step === 10) {
        clearInterval(timer);
        resolve();
      }
    }, 200);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(signal.reason);
    });
  });

/**
 * An upload that fails the first time and succeeds, through the simulated
 * upload, when retried.
 */
export const failOnceUpload = (): UploadFunction => {
  const attempts = new WeakMap<File, number>();
  return (file, options) => {
    const attempt = (attempts.get(file) ?? 0) + 1;
    attempts.set(file, attempt);
    return attempt === 1
      ? failingUpload(file, options)
      : simulatedUpload(file, options);
  };
};

/** Warns about files over 1 MB: they upload, but slowly. */
export const warnOnLargeFiles = (file: File): FileMessage | undefined =>
  file.size > MB
    ? { level: "warning", message: "Large files can take a while to upload." }
    : undefined;
