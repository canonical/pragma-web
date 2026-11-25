import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import { TextField } from "../../component/TextField/index.js";
import addRESTFieldValidation from "./addRESTValidation.js";

/** A fetch call the test settles by hand. */
type PendingRequest = {
  url: string;
  init: RequestInit;
  resolve: (response: Response) => void;
  reject: (reason: unknown) => void;
};

let requests: PendingRequest[];

const fetchMock = vi.fn(
  (url: string, init: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      requests.push({ url, init, resolve, reject });
    }),
);

const getRequest = (index: number): PendingRequest => {
  const request = requests.at(index);
  if (!request) throw new Error(`No request at index ${index}`);
  return request;
};

const advanceTime = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const settleRequest = async (settle: () => void) => {
  await act(async () => {
    settle();
  });
  await advanceTime(0);
};

const respondWith = (index: number, status: number, body?: unknown) =>
  settleRequest(() =>
    getRequest(index).resolve(
      body === undefined
        ? new Response(null, { status })
        : Response.json(body, { status }),
    ),
  );

const typeValue = (value: string) =>
  act(() => {
    fireEvent.change(screen.getByRole("textbox"), { target: { value } });
  });

const renderText = (
  middleware: ReturnType<typeof addRESTFieldValidation>,
  defaultValues?: Record<string, unknown>,
) =>
  renderWithForm(
    <TextField name="username" label="Username" middleware={[middleware]} />,
    { formProps: { defaultValues } },
  );

beforeEach(() => {
  requests = [];
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockClear();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("addRESTFieldValidation", () => {
  describe("sending", () => {
    it("waits for the debounce before sending the value", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(299);
      expect(fetchMock).not.toHaveBeenCalled();
      await advanceTime(1);
      const { url, init } = getRequest(0);
      expect(url).toBe("/api/validate");
      expect(init.method).toBe("POST");
      expect(init.headers).toEqual({ "Content-Type": "application/json" });
      expect(init.body).toBe(JSON.stringify({ value: "alice" }));
    });

    it("sends only the last of several quick changes", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("ali");
      await advanceTime(200);
      await typeValue("alice");
      await advanceTime(300);
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(getRequest(0).init.body).toBe(JSON.stringify({ value: "alice" }));
    });

    it("uses the given method, headers, body and wait", async () => {
      renderText(
        addRESTFieldValidation("/api/validate", {
          method: "PUT",
          headers: { "X-Test": "1" },
          bodyFormatter: (value) => ({ username: value }),
          debounceWait: 50,
          minLength: 1,
        }),
      );
      await typeValue("a");
      await advanceTime(50);
      const { init } = getRequest(0);
      expect(init.method).toBe("PUT");
      expect(init.headers).toEqual({ "X-Test": "1" });
      expect(init.body).toBe(JSON.stringify({ username: "a" }));
    });

    it("does not send values shorter than minLength", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("al");
      await advanceTime(300);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("does not send values that are not strings", async () => {
      renderText(addRESTFieldValidation("/api/validate"), {
        username: 12345,
      });
      await advanceTime(300);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("sets the field's error when the endpoint rejects the value", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("reads the message with errorExtractor", async () => {
      renderText(
        addRESTFieldValidation("/api/validate", {
          errorExtractor: async (response) => {
            const data = (await response.json()) as { error: string };
            return data.error;
          },
        }),
      );
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 409, { error: "Username taken" });
      expect(screen.getByRole("alert")).toHaveTextContent("Username taken");
    });

    it("falls back to the default message when errorExtractor fails", async () => {
      renderText(
        addRESTFieldValidation("/api/validate", {
          errorExtractor: async (response) => {
            const data = (await response.json()) as { error: string };
            return data.error;
          },
        }),
      );
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("clears the error when the endpoint accepts the value", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      await typeValue("alice2");
      await advanceTime(300);
      await respondWith(1, 200);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears the error when the value becomes too short", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      await typeValue("a");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("leaves the error unchanged when the request fails to complete", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await settleRequest(() =>
        getRequest(0).reject(new TypeError("Network down")),
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("cancellation", () => {
    it("aborts the request in flight when the value changes", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await typeValue("bob");
      expect(getRequest(0).init.signal?.aborted).toBe(true);
    });

    it("ignores a stale answer that arrives after a newer one", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await typeValue("bobby");
      await advanceTime(300);

      await respondWith(1, 200);
      await respondWith(0, 400);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("clears the pending timer when the field unmounts", async () => {
      const { unmount } = renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      unmount();
      await advanceTime(300);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("aborts the request in flight when the field unmounts", async () => {
      const { unmount } = renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      unmount();
      expect(getRequest(0).init.signal?.aborted).toBe(true);
      await respondWith(0, 400);
    });
  });
});
