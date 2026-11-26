import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ComponentProps, createElement, useEffect } from "react";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "../../../testing/renderWithForm.js";
import { TextField as Text } from "../../component/TextField/index.js";
import type { BaseInputProps, Middleware } from "../types.js";
import createMiddleware from "./createMiddleware.js";

// Text is already wrapped with withWrapper, so we test through it.

describe("withWrapper", () => {
  it("renders the wrapper with label and description", () => {
    renderWithForm(
      <Text name="email" label="Email" description="Enter your email" />,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders the optional indicator in optional-marking mode", () => {
    renderWithForm(
      <Text
        name="email"
        label="Email"
        isOptional
        requiredIndicator="optional"
      />,
    );
    expect(screen.getByText(/optional/)).toBeInTheDocument();
  });

  it("displays error message on validation failure", async () => {
    renderWithForm(
      <Text
        name="email"
        label="Email"
        registerProps={{ required: "Email is required" }}
      />,
      { formProps: { mode: "onTouched" } },
    );
    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    });
  });

  it("applies middleware in order", () => {
    const order: string[] = [];
    const middlewareA: Middleware<BaseInputProps> = (Component) => {
      const Wrapped = (props: BaseInputProps) => {
        order.push("A");
        return <Component {...props} />;
      };
      return Wrapped;
    };
    const middlewareB: Middleware<BaseInputProps> = (Component) => {
      const Wrapped = (props: BaseInputProps) => {
        order.push("B");
        return <Component {...props} />;
      };
      return Wrapped;
    };
    renderWithForm(
      <Text name="test" middleware={[middlewareA, middlewareB]} />,
    );
    // React strict mode double-renders, producing [A, B, A, B].
    // Verify A always comes before B in each render pass.
    const firstA = order.indexOf("A");
    const firstB = order.indexOf("B");
    expect(firstA).toBeLessThan(firstB);
    expect(order.filter((v) => v === "A").length).toBe(
      order.filter((v) => v === "B").length,
    );
  });

  it("keeps the input mounted when an inline middleware list is re-created", () => {
    let mounts = 0;
    const countMounts: Middleware<BaseInputProps> = (Component) => {
      const Wrapped = (props: BaseInputProps) => {
        useEffect(() => {
          mounts += 1;
        }, []);
        return <Component {...props} />;
      };
      return Wrapped;
    };
    const { rerender } = renderWithForm(
      <Text name="test" middleware={[countMounts]} />,
    );
    const mountsAfterRender = mounts;
    rerender(<Text name="test" middleware={[countMounts]} />);
    expect(mounts).toBe(mountsAfterRender);
  });

  it("applies new middleware when the list changes", () => {
    const tag =
      (label: string): Middleware<BaseInputProps> =>
      (Component) => {
        const Wrapped = (props: BaseInputProps) => (
          <Component {...props} className={label} />
        );
        return Wrapped;
      };
    const { container, rerender } = renderWithForm(
      <Text name="test" middleware={[tag("first")]} />,
    );
    expect(container.querySelector(".first")).toBeInTheDocument();
    rerender(<Text name="test" middleware={[tag("second")]} />);
    expect(container.querySelector(".first")).not.toBeInTheDocument();
    expect(container.querySelector(".second")).toBeInTheDocument();
  });

  describe("createMiddleware", () => {
    let mounts = 0;
    const addClassName = createMiddleware<string>((Component, useSettings) => {
      const Wrapped = (props: ComponentProps<typeof Component>) => {
        const className = useSettings();
        useEffect(() => {
          mounts += 1;
        }, []);
        return createElement(Component, { ...props, className });
      };
      return Wrapped;
    });

    it("keeps the input mounted and applies new settings", () => {
      mounts = 0;
      const { container, rerender } = renderWithForm(
        <Text name="test" middleware={[addClassName("first")]} />,
      );
      const input = screen.getByRole("textbox");
      rerender(<Text name="test" middleware={[addClassName("second")]} />);
      expect(mounts).toBe(1);
      expect(screen.getByRole("textbox")).toBe(input);
      expect(container.querySelector(".first")).not.toBeInTheDocument();
      expect(container.querySelector(".second")).toBeInTheDocument();
    });

    it("rebuilds when a middleware from another factory takes its place", () => {
      const tag: Middleware<BaseInputProps> = (Component) => {
        const Wrapped = (props: BaseInputProps) => (
          <Component {...props} className="tagged" />
        );
        return Wrapped;
      };
      const { container, rerender } = renderWithForm(
        <Text name="test" middleware={[addClassName("first")]} />,
      );
      rerender(<Text name="test" middleware={[tag]} />);
      expect(container.querySelector(".first")).not.toBeInTheDocument();
      expect(container.querySelector(".tagged")).toBeInTheDocument();
    });

    it("uses the settings it was made with outside a field", () => {
      const Input = (props: BaseInputProps) => (
        <input aria-label="Plain" className={props.className} />
      );
      const Configured = addClassName("standalone")(Input);
      render(<Configured name="plain" />);
      expect(screen.getByRole("textbox", { name: "Plain" })).toHaveClass(
        "standalone",
      );
    });
  });

  it("supports conditional display — shown when condition is true", () => {
    renderWithForm(
      <Text
        name="dependent"
        label="Dependent"
        condition={[["toggle"], (values: unknown[]) => values[0] === true]}
      />,
      { formProps: { defaultValues: { toggle: true } } },
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("supports conditional display — hidden when condition is false", () => {
    renderWithForm(
      <Text
        name="dependent"
        label="Dependent"
        condition={[["toggle"], (values: unknown[]) => values[0] === true]}
      />,
      { formProps: { defaultValues: { toggle: false } } },
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
