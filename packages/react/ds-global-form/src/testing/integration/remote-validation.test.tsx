import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { FormProvider, type UseFormReturn, useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TextField } from "../../lib/component/TextField/index.js";
import addRESTValidation from "../../lib/utils/middleware/addRESTValidation.js";

const middleware = [addRESTValidation("/validate", { debounceWait: 0 })];

function createDeferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

afterEach(() => vi.unstubAllGlobals());

describe("Remote field validation", () => {
  it("cancels stale requests and never overwrites an independent error", async () => {
    const first = createDeferred<Response>();
    const second = createDeferred<Response>();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    vi.stubGlobal("fetch", fetchMock);
    let methods: UseFormReturn<{ email: string }>;
    function App() {
      methods = useForm({ defaultValues: { email: "" } });
      return (
        <FormProvider {...methods}>
          <TextField name="email" label="Email" middleware={middleware} />
        </FormProvider>
      );
    }
    render(<App />);
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "first" } });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const signal = fetchMock.mock.calls.at(0)?.at(1)?.signal as AbortSignal;
    fireEvent.change(input, { target: { value: "second" } });
    expect(signal.aborted).toBe(true);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    act(() =>
      methods.setError("email", { type: "server", message: "Independent" }),
    );
    await act(async () => second.resolve({ ok: false } as Response));
    await act(async () => first.resolve({ ok: true } as Response));
    expect(screen.getByRole("alert")).toHaveTextContent("Independent");
  });

  it("clears its own stale error on a new value and aborts on unmount", async () => {
    const pending = createDeferred<Response>();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockReturnValueOnce(pending.promise);
    vi.stubGlobal("fetch", fetchMock);
    function App() {
      const methods = useForm({ defaultValues: { email: "" } });
      return (
        <FormProvider {...methods}>
          <TextField name="email" label="Email" middleware={middleware} />
        </FormProvider>
      );
    }
    const { unmount } = render(<App />);
    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "first" } });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Validation failed",
    );
    fireEvent.change(input, { target: { value: "second" } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const signal = fetchMock.mock.calls.at(1)?.at(1)?.signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve({ ok: false } as Response));
  });

  it("is advisory even when a remote rejection completed before submit", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const submitted = vi.fn();
    function App() {
      const methods = useForm({ defaultValues: { email: "valid" } });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitted)}>
            <TextField name="email" middleware={middleware} />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    }
    render(<App />);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
  });
});
