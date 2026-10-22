import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "../Badge/index.js";
import Component from "./Chip.js";

describe("Chip component", () => {
  it("subscribes only noninteractive, nondismissible roots to host density", () => {
    const { container } = render(
      <>
        <Component value="Static" />
        <Component value="Action" onClick={vi.fn()} />
        <Component value="Dismissible" onDismiss={vi.fn()} />
      </>,
    );
    expect(
      container.querySelectorAll('[data-ds-density-subscriber="static-chip"]'),
    ).toHaveLength(1);
    expect(screen.getByText("Static").closest(".chip")).toHaveAttribute(
      "data-ds-density-subscriber",
      "static-chip",
    );
    expect(screen.getByRole("button", { name: "Action" })).not.toHaveAttribute(
      "data-ds-density-subscriber",
    );
    expect(
      screen.getByText("Dismissible").closest(".chip"),
    ).not.toHaveAttribute("data-ds-density-subscriber");
  });
  it("renders", () => {
    render(<Component lead={"Cloud"} value={"AWS"} />);
    expect(screen.getByText("AWS")).toBeInTheDocument();
  });

  it("applies lead & value", () => {
    render(<Component lead={"Cloud"} value={"AWS"} />);
    const leadElement = screen.getByText("Cloud");
    const valueElement = screen.getByText("AWS");

    const chipElement = leadElement.closest(".ds.chip");
    expect(chipElement).toBeInTheDocument();
    expect(chipElement).toContainElement(leadElement);
    expect(chipElement).toContainElement(valueElement);
  });

  it("renders a Badge after the value and before dismiss", () => {
    render(
      <Component
        value="Machines"
        badge={<Badge value={42} />}
        onDismiss={vi.fn()}
      />,
    );
    const chip = screen.getByText("Machines").closest(".ds.chip");
    const value = screen.getByText("Machines");
    const badge = screen.getByText("42");
    const dismiss = screen.getByRole("button", { name: "Dismiss" });

    expect(chip).toContainElement(badge);
    expect(value.compareDocumentPosition(badge)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(badge.compareDocumentPosition(dismiss)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("supports the noninteractive Badge slot on an interactive Chip", () => {
    const onClick = vi.fn();
    render(
      <Component
        value="Machines"
        badge={<Badge value={7} />}
        onClick={onClick}
        data-testid="chip"
      />,
    );

    const chip = screen.getByTestId("chip");
    expect(chip.tagName).toBe("BUTTON");
    expect(chip).toContainElement(screen.getByText("7"));
    expect(chip).not.toHaveAttribute("badge");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("includes a Badge in an interactive Chip's accessible name", () => {
    render(
      <Component
        value="Machines"
        badge={<Badge value={7} />}
        onClick={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Machines 7" }),
    ).toBeInTheDocument();
  });

  it("applies criticality modifier", () => {
    render(<Component lead="Cloud" value="AWS" criticality="success" />);

    const leadElement = screen.getByText("Cloud");
    const chipElement = leadElement.closest(".ds.chip");

    expect(chipElement).toHaveClass("success");
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<Component lead={"Cloud"} value={"AWS"} onClick={onClick} />);
    screen.getByText("AWS").click();
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(<Component lead={"Cloud"} value={"AWS"} onDismiss={onDismiss} />);
    screen.getByLabelText("Dismiss").click();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("forwards native props to the button root", () => {
    const onMouseEnter = vi.fn();
    render(
      <Component
        value={"AWS"}
        onClick={vi.fn()}
        onMouseEnter={onMouseEnter}
        title={"Cloud provider"}
        aria-describedby={"hint"}
      />,
    );
    const button = screen.getByRole("button", { name: "AWS" });

    expect(button).toHaveAttribute("title", "Cloud provider");
    expect(button).toHaveAttribute("aria-describedby", "hint");
    fireEvent.mouseEnter(button);
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it("forwards native props to the span root", () => {
    const onMouseEnter = vi.fn();
    render(
      <Component
        value={"AWS"}
        data-testid={"chip"}
        onMouseEnter={onMouseEnter}
        title={"Cloud provider"}
      />,
    );
    const chip = screen.getByTestId("chip");

    expect(chip.tagName).toBe("SPAN");
    expect(chip).toHaveAttribute("title", "Cloud provider");
    fireEvent.mouseEnter(chip);
    expect(onMouseEnter).toHaveBeenCalled();
  });

  it("does not leak design-system props to the DOM from the span root", () => {
    render(
      <Component
        lead={"Cloud"}
        value={"AWS"}
        badge={<Badge value={42} />}
        criticality={"success"}
        release={"beta"}
        onDismiss={vi.fn()}
        data-testid={"chip"}
      />,
    );
    const chip = screen.getByTestId("chip");

    expect(chip.tagName).toBe("SPAN");
    for (const leaked of [
      "criticality",
      "release",
      "lead",
      "value",
      "badge",
      "ondismiss",
    ]) {
      expect(chip).not.toHaveAttribute(leaked);
    }
  });

  it("does not leak design-system props to the DOM from the button root", () => {
    render(
      <Component
        lead={"Cloud"}
        value={"AWS"}
        criticality={"success"}
        release={"beta"}
        onClick={vi.fn()}
        onDismiss={vi.fn()}
        data-testid={"chip"}
      />,
    );
    const chip = screen.getByTestId("chip");

    expect(chip.tagName).toBe("BUTTON");
    for (const leaked of [
      "criticality",
      "release",
      "lead",
      "value",
      "badge",
      "ondismiss",
    ]) {
      expect(chip).not.toHaveAttribute(leaked);
    }
  });
});
