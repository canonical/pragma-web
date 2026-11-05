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
import { SelectField } from "../../lib/component/SelectField/index.js";

const choices = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
];

describe("Select defaults", () => {
  it("retains and submits the native first option without form defaults", async () => {
    let methods!: UseFormReturn<{ color?: string }>;
    const submitted = vi.fn();
    function App() {
      methods = useForm<{ color?: string }>({ progressive: true });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitted)}>
            <SelectField name="color" label="Color" options={choices} />
          </form>
        </FormProvider>
      );
    }
    render(<App />);
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(select).toHaveValue("red");
    expect(select.form.checkValidity()).toBe(true);
    expect(methods.getValues("color")).toBe("red");
    expect(new FormData(select.form).get("color")).toBe("red");
    fireEvent.submit(select.form);
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
    expect(submitted.mock.calls.at(0)?.at(0)).toEqual({ color: "red" });
  });

  it("keeps an empty placeholder invalid until a required selection is made", async () => {
    let methods!: UseFormReturn<{ color?: string }>;
    const submitted = vi.fn();
    function App() {
      methods = useForm<{ color?: string }>({ progressive: true });
      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(submitted)}>
            <SelectField
              name="color"
              label="Color"
              options={[{ value: "", label: "Choose" }, ...choices]}
            />
          </form>
        </FormProvider>
      );
    }
    render(<App />);
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(select).toHaveValue("");
    expect(select.form.checkValidity()).toBe(false);
    await act(async () => expect(await methods.trigger("color")).toBe(false));
    fireEvent.change(select, { target: { value: "blue" } });
    expect(select.form.checkValidity()).toBe(true);
    fireEvent.submit(select.form);
    await waitFor(() => expect(submitted).toHaveBeenCalledOnce());
    expect(submitted.mock.calls.at(0)?.at(0)).toEqual({ color: "blue" });
  });

  it("retains user selection when unchanged options rerender", () => {
    let methods!: UseFormReturn<{ color?: string }>;
    function App({ reversed }: { reversed: boolean }) {
      methods = useForm<{ color?: string }>();
      return (
        <FormProvider {...methods}>
          <SelectField
            name="color"
            label="Color"
            options={reversed ? [...choices] : choices}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App reversed={false} />);
    const select = screen.getByLabelText("Color");
    fireEvent.change(select, { target: { value: "blue" } });
    rerender(<App reversed />);
    expect(select).toHaveValue("blue");
    expect(methods.getValues("color")).toBe("blue");
  });

  it("does not replace the form value when delayed options arrive", () => {
    let methods!: UseFormReturn<{ color: string }>;
    function App({ ready }: { ready: boolean }) {
      methods = useForm({ defaultValues: { color: "blue" } });
      return (
        <FormProvider {...methods}>
          <SelectField
            name="color"
            label="Color"
            options={ready ? choices : []}
          />
        </FormProvider>
      );
    }
    const { rerender } = render(<App ready={false} />);
    rerender(<App ready />);
    expect(screen.getByLabelText("Color")).toHaveValue("red");
    expect(methods.getValues("color")).toBe("blue");
  });

  it("does not overwrite an empty owner value when delayed options arrive", () => {
    let methods!: UseFormReturn<{ color?: string }>;
    function App({ ready }: { ready: boolean }) {
      methods = useForm<{ color?: string }>();
      return (
        <FormProvider {...methods}>
          <form>
            <SelectField
              name="color"
              label="Color"
              options={ready ? choices : []}
            />
          </form>
        </FormProvider>
      );
    }
    const { rerender } = render(<App ready={false} />);
    act(() => methods.setValue("color", ""));
    rerender(<App ready />);
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(select).toHaveValue("red");
    expect(methods.getValues("color")).toBe("");
    expect(new FormData(select.form).get("color")).toBe("red");
  });

  it("warns that removal can leave native submission different from RHF", () => {
    let methods!: UseFormReturn<{ color?: string }>;
    function App({ removed }: { removed: boolean }) {
      methods = useForm<{ color?: string }>();
      return (
        <FormProvider {...methods}>
          <form>
            <SelectField
              name="color"
              label="Color"
              options={removed ? [{ value: "blue", label: "Blue" }] : choices}
            />
          </form>
        </FormProvider>
      );
    }
    const { rerender } = render(<App removed={false} />);
    rerender(<App removed />);
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(methods.getValues("color")).toBe("red");
    expect(select).toHaveValue("blue");
    expect(new FormData(select.form).get("color")).toBe("blue");
    expect(screen.getByRole("alert")).toHaveTextContent("unavailable");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("renders and hydrates a native fallback with no form default", async () => {
    let methods!: UseFormReturn<{ color?: string }>;
    function App() {
      methods = useForm<{ color?: string }>();
      return (
        <FormProvider {...methods}>
          <form>
            <SelectField name="color" label="Color" options={choices} />
          </form>
        </FormProvider>
      );
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<App />);
    const select = container.querySelector("select");
    const form = container.querySelector("form");
    if (!select || !form) throw new Error("Missing form");
    expect(new FormData(form).get("color")).toBe("red");
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    expect(select).toHaveValue("red");
    expect(methods.getValues("color")).toBe("red");
    expect(new FormData(form).get("color")).toBe("red");
    await act(async () => root.unmount());
    container.remove();
  });

  it("adopts an early selection when no form default exists", async () => {
    let methods!: UseFormReturn<{ color?: string }>;
    function App() {
      methods = useForm<{ color?: string }>();
      return (
        <FormProvider {...methods}>
          <SelectField name="color" label="Color" options={choices} />
        </FormProvider>
      );
    }
    const container = document.createElement("div");
    document.body.appendChild(container);
    container.innerHTML = renderToString(<App />);
    const select = container.querySelector("select");
    if (!select) throw new Error("Missing select");
    select.value = "blue";
    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    expect(select).toHaveValue("blue");
    expect(methods.getValues("color")).toBe("blue");
    await act(async () => root.unmount());
    container.remove();
  });

  it("does not invent options or hidden inputs for an empty multiple selection", () => {
    function App() {
      const methods = useForm({ defaultValues: { colors: [] as string[] } });
      return (
        <FormProvider {...methods}>
          <form>
            <SelectField
              name="colors"
              label="Colors"
              multiple
              options={choices}
            />
          </form>
        </FormProvider>
      );
    }
    render(<App />);
    const select = screen.getByLabelText("Colors") as HTMLSelectElement;
    if (!select.form) throw new Error("Missing form");
    expect(select.selectedOptions).toHaveLength(0);
    expect(select.options).toHaveLength(2);
    expect(select.form.querySelectorAll('input[type="hidden"]')).toHaveLength(
      0,
    );
    expect(new FormData(select.form).getAll("colors")).toEqual([]);
  });

  it("leaves disabled options untouched without adding form controls", () => {
    function App() {
      const methods = useForm({ defaultValues: { color: "locked" } });
      return (
        <FormProvider {...methods}>
          <form id="external" />
          <SelectField
            name="color"
            label="Color"
            form="external"
            options={[
              ...choices,
              { value: "locked", label: "Locked", disabled: true },
            ]}
          />
        </FormProvider>
      );
    }
    const { container } = render(<App />);
    const form = container.querySelector("form");
    const select = screen.getByLabelText("Color") as HTMLSelectElement;
    if (!form) throw new Error("Missing form");
    expect(select.form).toBe(form);
    expect(select.querySelectorAll('option[value="locked"]')).toHaveLength(1);
    expect(select.querySelector('option[value="locked"]')).toBeDisabled();
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
  });
});
