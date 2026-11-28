import { flushSync } from "svelte";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import type { UploadFunction } from "../types.js";
import useFileUploads from "./useFileUploads.svelte.js";

const file = new File(["x"], "a.txt");
const pending = () => new Promise<void>(() => {});

/** Runs the uploads in an effect root, with the files and upload it is given. */
function runUploads(initial: {
  files: readonly File[];
  upload?: UploadFunction;
}) {
  const options = $state(initial);
  let uploads!: ReturnType<typeof useFileUploads>;
  const destroy = $effect.root(() => {
    uploads = useFileUploads({
      get files() {
        return options.files;
      },
      get upload() {
        return options.upload;
      },
      canUpload: () => true,
      onsummarychange: () => {},
    });
  });
  onTestFinished(destroy);
  flushSync();
  return { options, uploads };
}

describe("useFileUploads", () => {
  it("ignores a retry for a file it is not uploading", () => {
    const upload = vi.fn(pending);
    const { uploads } = runUploads({ files: [], upload });
    uploads.retry(file);
    expect(upload).not.toHaveBeenCalled();
    expect(uploads.states.size).toBe(0);
  });

  it("does nothing without an upload function", () => {
    const { uploads } = runUploads({ files: [file] });
    uploads.retry(file);
    expect(uploads.states.size).toBe(0);
  });

  it("ignores a retry once the upload function is gone", async () => {
    const upload = vi.fn(() => Promise.reject(new Error("no")));
    const { options, uploads } = runUploads({ files: [file], upload });
    await vi.waitFor(() =>
      expect(uploads.states.get(file)?.status).toBe("failed"),
    );
    options.upload = undefined;
    flushSync();
    uploads.retry(file);
    expect(upload).toHaveBeenCalledTimes(1);
  });
});
