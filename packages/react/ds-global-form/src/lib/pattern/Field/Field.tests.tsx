import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useFormContext } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import {
  Field,
  type FieldProps,
  Form,
  type InputProps,
} from "../../../index.js";

type CodeProps = InputProps<{ label: string; maxCharacters: number }>;

function CodeField({ name, label, maxCharacters, registerProps }: CodeProps) {
  const { register } = useFormContext();
  return (
    <label>
      {label}
      <input maxLength={maxCharacters} {...register(name, registerProps)} />
    </label>
  );
}

type PrefixProps = InputProps<{ label: string; prefix: string }>;

function PrefixField({ name, label, prefix }: PrefixProps) {
  const { register } = useFormContext();
  return (
    <label>
      {label}
      <input placeholder={prefix} {...register(name)} />
    </label>
  );
}

type Definition =
  | { kind: "builtin"; field: Exclude<FieldProps, { inputType: "custom" }> }
  | {
      kind: "code";
      field: Extract<FieldProps<CodeProps>, { inputType: "custom" }>;
    }
  | {
      kind: "prefix";
      field: Extract<FieldProps<PrefixProps>, { inputType: "custom" }>;
    };

const definitions: Definition[] = [
  {
    kind: "builtin",
    field: { inputType: "text", name: "title", label: "Title" },
  },
  {
    kind: "code",
    field: {
      inputType: "custom",
      CustomComponent: CodeField,
      name: "code",
      label: "Code",
      maxCharacters: 8,
    },
  },
  {
    kind: "prefix",
    field: {
      inputType: "custom",
      CustomComponent: PrefixField,
      name: "prefix",
      label: "Prefix",
      prefix: "Example",
    },
  },
];

const invalidDefinition: Definition = {
  kind: "code",
  // @ts-expect-error a prefix component cannot be paired with code props
  field: {
    inputType: "custom",
    CustomComponent: PrefixField,
    name: "wrong",
    label: "Wrong",
    maxCharacters: 8,
  },
};
void invalidDefinition;

function MappedField({ definition }: { definition: Definition }) {
  switch (definition.kind) {
    case "builtin":
      return <Field {...definition.field} />;
    case "code":
      return <Field {...definition.field} />;
    case "prefix":
      return <Field {...definition.field} />;
  }
}

describe("Field component", () => {
  it("keeps built-in native types on the server when extra props supply a type", () => {
    const conflicting = { type: "search" };
    const text = { inputType: "email" as const, name: "email", ...conflicting };
    const date = { inputType: "date" as const, name: "date", ...conflicting };
    const checkbox = {
      inputType: "checkbox" as const,
      name: "checkbox",
      label: "Checkbox",
      ...conflicting,
    };
    const html = renderToStaticMarkup(
      <Form onSubmit={() => {}}>
        {/* @ts-expect-error exercise an extra runtime prop from JavaScript */}
        <Field {...text} placeholder="Email" />
        {/* @ts-expect-error exercise an extra runtime prop from JavaScript */}
        <Field {...date} min="2020-01-01" />
        {/* @ts-expect-error exercise an extra runtime prop from JavaScript */}
        <Field {...checkbox} />
      </Form>,
    );

    expect(html).toContain('type="email"');
    expect(html).toContain('type="date"');
    expect(html).toContain('type="checkbox"');
    expect(html).not.toContain('type="search"');
    expect(html).toContain('placeholder="Email"');
    expect(html).toContain('min="2020-01-01"');
  });

  it("forwards a custom component's own type and unrelated props", () => {
    const received = vi.fn();
    const Custom = (props: { name: string; id: number; type: string }) => {
      received(props);
      return null;
    };
    render(
      <Field
        inputType="custom"
        CustomComponent={Custom}
        name="x"
        id={1}
        type="own"
      />,
    );
    expect(received).toHaveBeenCalledWith({ name: "x", id: 1, type: "own" });
  });

  it("does not forward a structurally supplied CustomComponent to built-in controls", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const extra = { CustomComponent: "unexpected-prop" };
      const fields = [
        { inputType: "text" as const, name: "title", label: "Title", ...extra },
        {
          inputType: "select" as const,
          name: "choice",
          label: "Choice",
          options: [{ value: "a", label: "A" }],
          ...extra,
        },
        {
          inputType: "checkbox" as const,
          name: "enabled",
          label: "Enabled",
          ...extra,
        },
      ];
      const { container } = render(
        <Form onSubmit={() => {}}>
          {fields.map((field) => (
            <Field key={field.name} {...field} />
          ))}
        </Form>,
      );

      expect(screen.getByLabelText("Title")).toHaveAttribute("type", "text");
      expect(screen.getByLabelText("Choice")).toBeInTheDocument();
      expect(screen.getByLabelText("Enabled")).toHaveAttribute(
        "type",
        "checkbox",
      );
      expect(container.querySelector("[customcomponent]")).toBeNull();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("consumes routing props rather than forwarding them to a custom component", () => {
    const received = vi.fn();
    const Custom = (props: { name: string; caption: string }) => {
      received(props);
      return <span>{props.caption}</span>;
    };

    render(
      <Field
        inputType="custom"
        CustomComponent={Custom}
        name="example"
        caption="Example"
      />,
    );

    expect(received).toHaveBeenCalledWith({
      name: "example",
      caption: "Example",
    });
  });

  it("passes custom props to a form-bound custom component", async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Field
          inputType="custom"
          CustomComponent={CodeField}
          name="code"
          label="Code"
          maxCharacters={8}
        />
        <button type="submit">Submit</button>
      </Form>,
    );
    const input = screen.getByLabelText("Code");
    expect(input).toHaveAttribute("maxlength", "8");
    fireEvent.change(input, { target: { value: "ABC" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({ code: "ABC" });
  });

  it("renders and submits a mixed map of built-in and different custom fields", async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        {definitions.map((definition) => (
          <MappedField key={definition.field.name} definition={definition} />
        ))}
        <button type="submit">Submit</button>
      </Form>,
    );
    const code = screen.getByLabelText("Code");
    const prefix = screen.getByLabelText("Prefix");
    expect(code).toHaveAttribute("maxlength", "8");
    expect(prefix).toHaveAttribute("placeholder", "Example");
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "A" },
    });
    fireEvent.change(code, { target: { value: "B" } });
    fireEvent.change(prefix, { target: { value: "C" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      title: "A",
      code: "B",
      prefix: "C",
    });
  });
});
