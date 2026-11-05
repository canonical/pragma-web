import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { FormProvider, type UseFormReturn, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { ChoicesField } from "../../lib/component/ChoicesField/index.js";
import { DateField } from "../../lib/component/DateField/index.js";
import { NumberField } from "../../lib/component/NumberField/index.js";
import { SelectField } from "../../lib/component/SelectField/index.js";
import { TextField } from "../../lib/component/TextField/index.js";

describe("Field runtime", () => {
  it("retains a generated required rule after isOptional changes until explicitly cleared", async () => {
    let methods!: UseFormReturn<{ email: string }>;
    function App({ optional, clear }: { optional: boolean; clear: boolean }) {
      methods = useForm({ defaultValues: { email: "" } });
      return (
        <FormProvider {...methods}>
          <TextField
            name="email"
            isOptional={optional}
            registerProps={clear ? { required: false } : {}}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App optional={false} clear={false} />);
    await act(async () => expect(await methods.trigger("email")).toBe(false));
    rerender(<App optional clear={false} />);
    await act(async () => expect(await methods.trigger("email")).toBe(false));
    rerender(<App optional clear />);
    await act(async () => expect(await methods.trigger("email")).toBe(true));
  });

  it("retains a controlled field's required rule after isOptional changes", async () => {
    let methods!: UseFormReturn<{ color: string }>;
    function App({ optional, clear }: { optional: boolean; clear: boolean }) {
      methods = useForm({ defaultValues: { color: "" } });
      return (
        <FormProvider {...methods}>
          <ChoicesField
            name="color"
            isOptional={optional}
            options={[{ value: "red", label: "Red" }]}
            registerProps={clear ? { required: false } : {}}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App optional={false} clear={false} />);
    await act(async () => expect(await methods.trigger("color")).toBe(false));
    rerender(<App optional clear={false} />);
    await act(async () => expect(await methods.trigger("color")).toBe(false));
    rerender(<App optional clear />);
    await act(async () => expect(await methods.trigger("color")).toBe(true));
  });

  it("updates props, labels and explicitly cleared rules without remounting", async () => {
    let methods: UseFormReturn<{ email: string }>;
    function App({ active }: { active: boolean }) {
      methods = useForm({ defaultValues: { email: "abc" } });
      return (
        <FormProvider {...methods}>
          <TextField
            name="email"
            label={active ? "Email" : "Address"}
            placeholder={active ? "Before" : "After"}
            isOptional
            registerProps={{
              minLength: active
                ? { value: 5, message: "Too short" }
                : undefined,
            }}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App active />);
    const input = screen.getByLabelText("Email");
    await act(async () => expect(await methods.trigger("email")).toBe(false));
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    rerender(<App active={false} />);
    expect(screen.getByLabelText("Address")).toBe(input);
    expect(input).toHaveAttribute("placeholder", "After");
    await act(async () => expect(await methods.trigger("email")).toBe(true));
  });

  it("preserves focus and value when equivalent middleware arrays are recreated", () => {
    const middleware =
      <P extends { name: string }>(Component: React.ComponentType<P>) =>
      (props: P) => <Component {...props} />;
    function App({ label }: { label: string }) {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <TextField name="email" label={label} middleware={[middleware]} />
        </FormProvider>
      );
    }
    const { rerender } = render(<App label="Email" />);
    const input = screen.getByLabelText("Email");
    input.focus();
    fireEvent.change(input, { target: { value: "draft" } });
    rerender(<App label="Address" />);
    expect(screen.getByLabelText("Address")).toBe(input);
    expect(input).toHaveFocus();
    expect(input).toHaveValue("draft");
  });

  it("keeps form-wide disabled controls disabled even when registration changes", async () => {
    const submitted = vi.fn();
    function App({ disabled }: { disabled: boolean }) {
      const methods = useForm({
        disabled: true,
        defaultValues: { email: "secret", color: "red" },
      });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitted)}>
            <TextField
              name="email"
              label="Email"
              isOptional
              registerProps={{ disabled }}
            />
            <ChoicesField
              name="color"
              isOptional
              options={[{ value: "red", label: "Red" }]}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    }
    const { rerender } = render(<App disabled />);
    rerender(<App disabled={false} />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Red")).toBeDisabled();
    fireEvent.submit(
      screen.getByRole("button").closest("form") as HTMLFormElement,
    );
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
    expect(submitted.mock.calls.at(0)?.at(0)).not.toHaveProperty("email");
  });

  it.each(["native", "controlled"] as const)(
    "%s field follows form and field disabled transitions in the DOM and submissions",
    async (kind) => {
      const submitted = vi.fn();
      function App({
        formDisabled,
        fieldDisabled,
        registrationDisabled,
      }: {
        formDisabled: boolean;
        fieldDisabled: boolean;
        registrationDisabled: boolean;
      }) {
        const methods = useForm({
          disabled: formDisabled,
          defaultValues: { value: kind === "native" ? "hello" : "red" },
        });
        return (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitted)}>
              {kind === "native" ? (
                <TextField
                  name="value"
                  label="Value"
                  isOptional
                  disabled={fieldDisabled}
                  registerProps={{ disabled: registrationDisabled }}
                />
              ) : (
                <ChoicesField
                  name="value"
                  isOptional
                  disabled={fieldDisabled}
                  registerProps={{ disabled: registrationDisabled }}
                  options={[{ value: "red", label: "Red" }]}
                />
              )}
              <button type="submit">Submit</button>
            </form>
          </FormProvider>
        );
      }
      const { rerender } = render(
        <App
          formDisabled={false}
          fieldDisabled={false}
          registrationDisabled={false}
        />,
      );
      const input = screen.getByLabelText(kind === "native" ? "Value" : "Red");
      const form = input.closest("form");
      if (!form) throw new Error("Missing form");
      const verify = async (disabled: boolean) => {
        if (disabled) expect(input).toBeDisabled();
        else expect(input).toBeEnabled();
        fireEvent.submit(form);
        await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
        const values = submitted.mock.calls.at(0)?.at(0);
        if (disabled) expect(values).not.toHaveProperty("value");
        else
          expect(values).toEqual({
            value: kind === "native" ? "hello" : "red",
          });
        submitted.mockClear();
      };
      await verify(false);
      rerender(
        <App formDisabled fieldDisabled={false} registrationDisabled={false} />,
      );
      await verify(true);
      rerender(
        <App
          formDisabled={false}
          fieldDisabled={false}
          registrationDisabled={false}
        />,
      );
      await verify(false);
      rerender(
        <App formDisabled={false} fieldDisabled registrationDisabled={false} />,
      );
      await verify(true);
      rerender(<App formDisabled fieldDisabled registrationDisabled={false} />);
      rerender(
        <App formDisabled={false} fieldDisabled registrationDisabled={false} />,
      );
      await verify(true);
      rerender(
        <App formDisabled={false} fieldDisabled={false} registrationDisabled />,
      );
      await verify(true);
      rerender(
        <App formDisabled fieldDisabled={false} registrationDisabled={false} />,
      );
      await verify(true);
      rerender(
        <App
          formDisabled={false}
          fieldDisabled={false}
          registrationDisabled={false}
        />,
      );
      await verify(false);
    },
  );

  it.each(["native", "controlled"] as const)(
    "%s field reenables after form-wide disable without a field disabled rule",
    async (kind) => {
      const submitted = vi.fn();
      function App({ disabled }: { disabled: boolean }) {
        const methods = useForm({
          disabled,
          defaultValues: { value: kind === "native" ? "hello" : "red" },
        });
        return (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitted)}>
              {kind === "native" ? (
                <TextField name="value" label="Value" isOptional />
              ) : (
                <ChoicesField
                  name="value"
                  isOptional
                  options={[{ value: "red", label: "Red" }]}
                />
              )}
            </form>
          </FormProvider>
        );
      }
      const { rerender } = render(<App disabled={false} />);
      const input = screen.getByLabelText(kind === "native" ? "Value" : "Red");
      rerender(<App disabled />);
      expect(input).toBeDisabled();
      rerender(<App disabled={false} />);
      expect(input).toBeEnabled();
      const form = input.closest("form");
      if (!form) throw new Error("Missing form");
      fireEvent.submit(form);
      await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
      expect(submitted.mock.calls.at(0)?.at(0)).toEqual({
        value: kind === "native" ? "hello" : "red",
      });
    },
  );

  it.each(["native", "controlled"] as const)(
    "%s field clears a removed disabled registration",
    async (kind) => {
      const submitted = vi.fn();
      function App({ disabled }: { disabled: boolean }) {
        const methods = useForm({
          defaultValues: { value: kind === "native" ? "hello" : "red" },
        });
        const registerProps = disabled ? { disabled: true } : {};
        return (
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitted)}>
              {kind === "native" ? (
                <TextField
                  name="value"
                  label="Value"
                  isOptional
                  registerProps={registerProps}
                />
              ) : (
                <ChoicesField
                  name="value"
                  isOptional
                  registerProps={registerProps}
                  options={[{ value: "red", label: "Red" }]}
                />
              )}
            </form>
          </FormProvider>
        );
      }
      const { rerender } = render(<App disabled />);
      const input = screen.getByLabelText(kind === "native" ? "Value" : "Red");
      expect(input).toBeDisabled();
      rerender(<App disabled={false} />);
      expect(input).toBeEnabled();
      const form = input.closest("form");
      if (!form) throw new Error("Missing form");
      fireEvent.submit(form);
      await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
      expect(submitted.mock.calls.at(0)?.at(0)).toEqual({
        value: kind === "native" ? "hello" : "red",
      });
    },
  );

  it("warns when native submission falls back while RHF retains an unavailable value", async () => {
    const submitted = vi.fn();
    let methods!: UseFormReturn<{ color: string }>;
    function App({ missing }: { missing: boolean }) {
      methods = useForm({ defaultValues: { color: "blue" } });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitted)}>
            <SelectField
              name="color"
              label="Color"
              isOptional
              options={
                missing
                  ? [{ value: "red", label: "Red" }]
                  : [{ value: "blue", label: "Blue" }]
              }
            />
          </form>
        </FormProvider>
      );
    }
    const { rerender } = render(<App missing={false} />);
    rerender(<App missing />);
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
    expect(methods.getValues("color")).toBe("blue");
    expect(select).toHaveValue("red");
    expect(new FormData(select.form).get("color")).toBe("red");
    fireEvent.submit(select.form);
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
    expect(submitted.mock.calls.at(0)?.at(0)).toEqual({ color: "blue" });
  });

  it("renders native defaults, adopts pre-hydration edits, and resets", async () => {
    let methods!: UseFormReturn<{
      text: string;
      amount: number;
      day: string;
      color: string;
    }>;
    const options = [
      { value: "red", label: "Red" },
      { value: "blue", label: "Blue" },
    ];
    function App() {
      methods = useForm({
        defaultValues: {
          text: "initial",
          amount: 12,
          day: "2026-01-01",
          color: "red",
        },
      });
      return (
        <FormProvider {...methods}>
          <form>
            <TextField name="text" label="Text" />
            <NumberField name="amount" label="Amount" />
            <DateField name="day" label="Day" />
            <SelectField name="color" label="Color" options={options} />
          </form>
        </FormProvider>
      );
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<App />);
    const form = container.querySelector("form");
    const text =
      container.querySelector<HTMLInputElement>('input[name="text"]');
    const amount = container.querySelector<HTMLInputElement>(
      'input[name="amount"]',
    );
    const day = container.querySelector<HTMLInputElement>('input[name="day"]');
    const color = container.querySelector<HTMLSelectElement>("select");
    if (!form || !text || !amount || !day || !color)
      throw new Error("Missing controls");
    expect(Object.fromEntries(new FormData(form))).toEqual({
      text: "initial",
      amount: "12",
      day: "2026-01-01",
      color: "red",
    });
    text.value = "early";
    amount.value = "24";
    day.value = "2026-02-02";
    color.value = "blue";
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    expect(methods.getValues()).toEqual({
      text: "early",
      amount: 24,
      day: "2026-02-02",
      color: "blue",
    });
    expect(methods.getFieldState("text").isDirty).toBe(true);
    await act(async () => methods.reset());
    expect(Object.fromEntries(new FormData(form))).toEqual({
      text: "initial",
      amount: "12",
      day: "2026-01-01",
      color: "red",
    });
    await act(async () => root.unmount());
    container.remove();
  });

  it("keeps the form value when delayed options become available", () => {
    let methods!: UseFormReturn<{ color: string }>;
    function App({ ready }: { ready: boolean }) {
      methods = useForm({ defaultValues: { color: "blue" } });
      return (
        <FormProvider {...methods}>
          <SelectField
            name="color"
            isOptional
            options={ready ? [{ value: "blue", label: "Blue" }] : []}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App ready={false} />);
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
    expect(methods.getValues("color")).toBe("blue");
    rerender(<App ready />);
    expect(screen.getByRole("combobox")).toHaveValue("blue");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
