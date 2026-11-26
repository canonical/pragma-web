import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import {
  FormProvider,
  type RegisterOptions,
  useForm,
  useFormContext,
} from "react-hook-form";
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

/** Sets an error on a field when it mounts, as a form rule would. */
const ErrorSetter = ({ name, message }: { name: string; message: string }) => {
  const { setError } = useFormContext();
  useEffect(() => {
    setError(name, { type: "required", message });
  }, [name, message, setError]);
  return null;
};

const renderTextWithError = (
  middleware: ReturnType<typeof addRESTFieldValidation>,
) =>
  renderWithForm(
    <>
      <TextField name="username" label="Username" middleware={[middleware]} />
      <ErrorSetter name="username" message="Pick a username" />
    </>,
  );

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

    it("leaves an error it did not set in place when the value is accepted", async () => {
      renderTextWithError(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 200);
      expect(screen.getByRole("alert")).toHaveTextContent("Pick a username");
    });

    it("leaves an error it did not set in place when the value is too short", async () => {
      renderTextWithError(addRESTFieldValidation("/api/validate"));
      await typeValue("al");
      await advanceTime(300);
      expect(screen.getByRole("alert")).toHaveTextContent("Pick a username");
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

  describe("previous message", () => {
    it("keeps the previous message when a request fails to complete", async () => {
      renderText(addRESTFieldValidation("/api/validate"));
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      await typeValue("alice2");
      await advanceTime(300);
      await settleRequest(() =>
        getRequest(1).reject(new TypeError("Network down")),
      );
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });
  });

  describe("submitting", () => {
    const onSubmit = vi.fn();

    afterEach(() => {
      onSubmit.mockClear();
    });

    /** A form that records its submissions. */
    const SubmitForm = ({
      middleware,
      registerProps,
    }: {
      middleware: ReturnType<typeof addRESTFieldValidation>;
      registerProps?: RegisterOptions;
    }) => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <form
            aria-label="Account"
            onSubmit={methods.handleSubmit((values) => onSubmit(values))}
          >
            <TextField
              name="username"
              label="Username"
              isOptional
              registerProps={registerProps}
              middleware={[middleware]}
            />
          </form>
        </FormProvider>
      );
    };

    const submit = () =>
      act(async () => {
        fireEvent.submit(screen.getByRole("form", { name: "Account" }));
        await vi.advanceTimersByTimeAsync(0);
      });

    it("blocks the submit of a value the endpoint rejected", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      await submit();
      await advanceTime(300);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("checks a value submitted before the debounce ends", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await submit();
      await advanceTime(300);
      expect(fetchMock).toHaveBeenCalledOnce();
      await respondWith(0, 409);
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("submits a value the endpoint accepted", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 200);
      await submit();
      expect(onSubmit).toHaveBeenCalledWith({ username: "alice" });
    });

    it("submits a value too short to check", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("al");
      await submit();
      expect(onSubmit).toHaveBeenCalledWith({ username: "al" });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("submits when the check fails to complete and no message was set", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await submit();
      await advanceTime(300);
      await settleRequest(() =>
        getRequest(0).reject(new TypeError("Network down")),
      );
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it("keeps blocking with the previous message when the check fails", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await advanceTime(300);
      await respondWith(0, 400);
      await typeValue("alice2");
      await submit();
      await advanceTime(300);
      await settleRequest(() =>
        getRequest(1).reject(new TypeError("Network down")),
      );
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("asks again on submit after a check failed to complete", async () => {
      render(
        <SubmitForm middleware={addRESTFieldValidation("/api/validate")} />,
      );
      await typeValue("alice");
      await advanceTime(300);
      await settleRequest(() =>
        getRequest(0).reject(new TypeError("Network down")),
      );
      await submit();
      await advanceTime(300);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      await respondWith(1, 400);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("keeps the field's own validate function", async () => {
      render(
        <SubmitForm
          middleware={addRESTFieldValidation("/api/validate")}
          registerProps={{
            validate: (value) => value !== "admin" || "Reserved name",
          }}
        />,
      );
      await typeValue("admin");
      await advanceTime(300);
      await respondWith(0, 200);
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Reserved name");
    });

    it("keeps the field's own validate rules", async () => {
      render(
        <SubmitForm
          middleware={addRESTFieldValidation("/api/validate")}
          registerProps={{
            validate: {
              reserved: (value) => value !== "admin" || "Reserved name",
            },
          }}
        />,
      );
      await typeValue("admin");
      await advanceTime(300);
      await respondWith(0, 200);
      await submit();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Reserved name");
    });
  });

  describe("inline middleware", () => {
    /** A form that builds the middleware inline and re-renders on demand. */
    const InlineForm = ({ url }: { url: string }) => {
      const methods = useForm();
      const [renders, setRenders] = useState(0);
      return (
        <FormProvider {...methods}>
          <button type="button" onClick={() => setRenders(renders + 1)}>
            Re-render
          </button>
          <TextField
            name="username"
            label="Username"
            middleware={[addRESTFieldValidation(url)]}
          />
        </FormProvider>
      );
    };

    const reRender = () =>
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Re-render" }));
      });

    it("sends once and keeps the field mounted across re-renders", async () => {
      render(<InlineForm url="/api/validate" />);
      const textbox = screen.getByRole("textbox");
      await typeValue("alice");
      await reRender();
      await advanceTime(300);
      await reRender();
      await respondWith(0, 400);
      await reRender();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(screen.getByRole("textbox")).toBe(textbox);
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed");
    });

    it("checks the value again when the URL changes", async () => {
      const { rerender } = render(<InlineForm url="/api/a" />);
      await typeValue("alice");
      await advanceTime(300);
      rerender(<InlineForm url="/api/b" />);
      await advanceTime(300);
      expect(requests.map((request) => request.url)).toEqual([
        "/api/a",
        "/api/b",
      ]);
      expect(getRequest(0).init.signal?.aborted).toBe(true);
      await respondWith(1, 200);
      await respondWith(0, 400);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
