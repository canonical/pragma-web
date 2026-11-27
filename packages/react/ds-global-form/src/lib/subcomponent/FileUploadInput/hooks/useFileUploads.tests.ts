import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useFileUploads from "./useFileUploads.js";

const file = new File(["x"], "a.txt");
const pending = () => new Promise<void>(() => {});

describe("useFileUploads", () => {
  it("ignores cancel and retry for a file it is not uploading", () => {
    const upload = vi.fn(pending);
    const { result } = renderHook(() =>
      useFileUploads([], { upload, canUpload: () => true }),
    );
    act(() => {
      result.current.cancel(file);
      result.current.retry(file);
    });
    expect(upload).not.toHaveBeenCalled();
    expect(result.current.states.size).toBe(0);
  });

  it("does nothing without an upload function", () => {
    const { result } = renderHook(() =>
      useFileUploads([file], { canUpload: () => true }),
    );
    act(() => result.current.retry(file));
    expect(result.current.states.size).toBe(0);
  });

  it("ignores a retry once the upload function is gone", async () => {
    const upload = vi.fn(() => Promise.reject(new Error("no")));
    const { result, rerender } = renderHook(
      ({ live }) =>
        useFileUploads([file], {
          upload: live ? upload : undefined,
          canUpload: () => true,
        }),
      { initialProps: { live: true } },
    );
    await act(async () => {});
    expect(result.current.states.get(file)?.status).toBe("failed");
    rerender({ live: false });
    act(() => result.current.retry(file));
    expect(upload).toHaveBeenCalledTimes(1);
  });
});
