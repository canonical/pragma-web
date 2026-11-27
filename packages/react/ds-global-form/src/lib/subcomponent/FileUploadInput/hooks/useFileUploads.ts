import { useCallback, useEffect, useRef, useState } from "react";
import { RESULT_DISPLAY_DURATION } from "../constants.js";
import type { UploadFunction, UploadState, UploadSummary } from "../types.js";

type UseFileUploadsOptions = {
  /** The upload function; the input is live only when it is set. */
  upload?: UploadFunction;
  /** Whether a chosen file may be uploaded (a file with an error may not). */
  canUpload: (file: File) => boolean;
  /** Called when the count of running or failed uploads changes. */
  onSummaryChange?: (summary: UploadSummary) => void;
};

type FileUploads = {
  /** The upload state of each chosen file that has been sent. */
  states: ReadonlyMap<File, UploadState>;
  /** Aborts a running upload; the file stays, marked as cancelled. */
  cancel: (file: File) => void;
  /** Sends a file again after a failed or cancelled upload. */
  retry: (file: File) => void;
};

const clamp = (fraction: number): number =>
  Math.min(1, Math.max(0, Number.isFinite(fraction) ? fraction : 0));

const summarise = (states: ReadonlyMap<File, UploadState>): UploadSummary => {
  let uploading = 0;
  let failed = 0;
  for (const state of states.values()) {
    if (state.status === "uploading") uploading += 1;
    if (state.status === "failed" || state.status === "cancelled") failed += 1;
  }
  return { uploading, failed };
};

/**
 * Runs the live uploads of the chosen files. Each new file that may be
 * uploaded is sent once with its own abort signal; a file that leaves the
 * selection has its upload aborted and its state dropped. Upload state lives
 * here, keyed by the `File` object, and never in the form value.
 *
 * Every upload promise is settled here, so neither a rejection nor an abort
 * escapes as an unhandled rejection. A result from an upload that has since
 * been cancelled, retried or removed is ignored.
 */
export default function useFileUploads(
  files: readonly File[],
  { upload, canUpload, onSummaryChange }: UseFileUploadsOptions,
): FileUploads {
  const [states, setStates] = useState<ReadonlyMap<File, UploadState>>(
    () => new Map(),
  );
  const controllers = useRef(new Map<File, AbortController>());
  const timers = useRef(new Map<File, ReturnType<typeof setTimeout>>());
  const tracked = useRef(new Set<File>());
  const latest = useRef({ upload, canUpload, onSummaryChange });
  latest.current = { upload, canUpload, onSummaryChange };
  const reported = useRef<UploadSummary>({ uploading: 0, failed: 0 });

  const update = useCallback(
    (file: File, next: (current?: UploadState) => UploadState | undefined) => {
      setStates((previous) => {
        const current = previous.get(file);
        const state = next(current);
        if (state === current) return previous;
        const map = new Map(previous);
        if (state) map.set(file, state);
        else map.delete(file);
        return map;
      });
    },
    [],
  );

  const stop = useCallback((file: File) => {
    controllers.current.get(file)?.abort();
    controllers.current.delete(file);
    clearTimeout(timers.current.get(file));
    timers.current.delete(file);
  }, []);

  const start = useCallback(
    (file: File, send: UploadFunction) => {
      stop(file);
      const controller = new AbortController();
      controllers.current.set(file, controller);
      const isCurrent = () => controllers.current.get(file) === controller;
      update(file, () => ({ status: "uploading", progress: 0 }));

      const onProgress = (fraction: number) => {
        if (!isCurrent()) return;
        const progress = clamp(fraction);
        update(file, (current) =>
          current?.status === "uploading" &&
          Math.round(current.progress * 100) === Math.round(progress * 100)
            ? current
            : { status: "uploading", progress },
        );
      };

      new Promise<void>((resolve) => {
        resolve(send(file, { signal: controller.signal, onProgress }));
      }).then(
        () => {
          if (!isCurrent()) return;
          controllers.current.delete(file);
          update(file, () => ({ status: "finished" }));
          timers.current.set(
            file,
            setTimeout(() => {
              timers.current.delete(file);
              update(file, () => ({ status: "done" }));
            }, RESULT_DISPLAY_DURATION),
          );
        },
        (reason: unknown) => {
          if (!isCurrent()) return;
          controllers.current.delete(file);
          update(file, () => ({ status: "failed", reason }));
        },
      );
    },
    [stop, update],
  );

  const live = Boolean(upload);

  useEffect(() => {
    const present = new Set(files);
    for (const file of tracked.current) {
      if (present.has(file) && live) continue;
      stop(file);
      tracked.current.delete(file);
      update(file, () => undefined);
    }
    const send = latest.current.upload;
    if (!send) return;
    for (const file of files) {
      if (tracked.current.has(file) || !latest.current.canUpload(file)) {
        continue;
      }
      tracked.current.add(file);
      start(file, send);
    }
  }, [files, live, start, stop, update]);

  useEffect(
    () => () => {
      for (const file of tracked.current) stop(file);
      tracked.current.clear();
    },
    [stop],
  );

  useEffect(() => {
    const summary = summarise(states);
    const previous = reported.current;
    if (
      summary.uploading === previous.uploading &&
      summary.failed === previous.failed
    ) {
      return;
    }
    reported.current = summary;
    latest.current.onSummaryChange?.(summary);
  }, [states]);

  const cancel = useCallback(
    (file: File) => {
      if (!controllers.current.has(file)) return;
      stop(file);
      update(file, () => ({ status: "cancelled" }));
    },
    [stop, update],
  );

  const retry = useCallback(
    (file: File) => {
      const send = latest.current.upload;
      if (!send || !tracked.current.has(file)) return;
      start(file, send);
    },
    [start],
  );

  return { states, cancel, retry };
}
