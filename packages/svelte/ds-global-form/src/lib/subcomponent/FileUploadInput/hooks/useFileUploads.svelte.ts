import { untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";
import { RESULT_DISPLAY_DURATION } from "../constants.js";
import type { UploadFunction, UploadState, UploadSummary } from "../types.js";

/** What the uploads read from the input. Each getter is read when needed. */
type UseFileUploadsOptions = {
  /** The chosen files. */
  readonly files: readonly File[];
  /** The upload function; the input is live only when it is set. */
  readonly upload: UploadFunction | undefined;
  /** Whether a chosen file may be uploaded (a file with an error may not). */
  canUpload(file: File): boolean;
  /** Called when the count of running or failed uploads changes. */
  onsummarychange(summary: UploadSummary): void;
};

type FileUploads = {
  /** The upload state of each chosen file that has been sent. */
  readonly states: ReadonlyMap<File, UploadState>;
  /** Sends a file again after a failed upload. */
  retry(file: File): void;
};

const clamp = (fraction: number): number =>
  Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0));

const summarise = (states: ReadonlyMap<File, UploadState>): UploadSummary => {
  let uploading = 0;
  let failed = 0;
  for (const state of states.values()) {
    if (state.status === "uploading") uploading += 1;
    if (state.status === "failed") failed += 1;
  }
  return { uploading, failed };
};

/**
 * Runs the live uploads of the chosen files. Each new file that may be
 * uploaded is sent once with its own abort signal; a file that leaves the
 * selection has its upload aborted and its state dropped. Upload state lives
 * here, keyed by the `File` object, and never in the bound files.
 *
 * Cancelling an upload is removing its file: the consumer drops it from the
 * files, and the upload is aborted with it. Once an upload ends, success or
 * failure, its result shows for `RESULT_DISPLAY_DURATION`; a failed upload
 * then stays failed until it is retried or removed.
 *
 * Every upload promise is settled here, so neither a rejection nor an abort
 * escapes as an unhandled rejection. A result from an upload that has since
 * been retried or removed is ignored. Nothing is sent during server
 * rendering.
 * @note Impure: creates state and effects; call during component
 * initialisation.
 */
export default function useFileUploads(
  options: UseFileUploadsOptions,
): FileUploads {
  const states = new SvelteMap<File, UploadState>();
  const controllers = new Map<File, AbortController>();
  const timers = new Map<File, ReturnType<typeof setTimeout>>();
  const tracked = new Set<File>();
  let reported: UploadSummary = { uploading: 0, failed: 0 };

  function stop(file: File): void {
    controllers.get(file)?.abort();
    controllers.delete(file);
    clearTimeout(timers.get(file));
    timers.delete(file);
  }

  /**
   * Records how an upload ended and shows its result, then hides the result
   * after `RESULT_DISPLAY_DURATION`, keeping the outcome.
   */
  function end(
    file: File,
    outcome: Exclude<UploadState, { status: "uploading" }>,
  ): void {
    controllers.delete(file);
    states.set(file, outcome);
    // A retry or a removal stops this timer, so the outcome is still current
    // when it fires.
    timers.set(
      file,
      setTimeout(() => {
        timers.delete(file);
        states.set(file, { ...outcome, showResult: false });
      }, RESULT_DISPLAY_DURATION),
    );
  }

  function start(file: File, send: UploadFunction): void {
    stop(file);
    const controller = new AbortController();
    controllers.set(file, controller);
    const isCurrent = () => controllers.get(file) === controller;
    // The share sent so far; only the current upload of the file reports it.
    let progress = 0;
    states.set(file, { status: "uploading", progress });

    const onProgress = (fraction: number) => {
      if (!isCurrent()) return;
      const next = clamp(fraction);
      // A report within the same whole percent changes nothing on screen.
      if (Math.round(next * 100) === Math.round(progress * 100)) return;
      progress = next;
      states.set(file, { status: "uploading", progress });
    };

    new Promise<void>((resolve) => {
      resolve(send(file, { signal: controller.signal, onProgress }));
    }).then(
      () => {
        if (!isCurrent()) return;
        end(file, { status: "uploaded", showResult: true });
      },
      (reason: unknown) => {
        if (!isCurrent()) return;
        end(file, { status: "failed", reason, progress, showResult: true });
      },
    );
  }

  // Follows the files and whether the input is live; everything else is read
  // without tracking, so a new `validateFile` does not restart uploads.
  $effect(() => {
    const files = options.files;
    const send = options.upload;
    untrack(() => {
      const present = new Set(files);
      for (const file of tracked) {
        if (present.has(file) && send) continue;
        stop(file);
        tracked.delete(file);
        states.delete(file);
      }
      if (!send) return;
      for (const file of files) {
        if (tracked.has(file) || !options.canUpload(file)) continue;
        tracked.add(file);
        start(file, send);
      }
    });
  });

  $effect(() => () => {
    for (const file of tracked) stop(file);
    tracked.clear();
  });

  $effect(() => {
    const summary = summarise(states);
    if (
      summary.uploading === reported.uploading &&
      summary.failed === reported.failed
    ) {
      return;
    }
    reported = summary;
    untrack(() => options.onsummarychange(summary));
  });

  return {
    get states() {
      return states;
    },
    retry(file) {
      const send = untrack(() => options.upload);
      if (!send || !tracked.has(file)) return;
      start(file, send);
    },
  };
}
