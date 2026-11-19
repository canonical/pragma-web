import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Context from "../../Context.js";
import type { ModalContextValue } from "../../types.js";
import Header from "./Header.js";

/** Renders the header inside a modal context. */
const renderHeader = (
  ui: React.ReactElement,
  value: Partial<ModalContextValue> = {},
) => {
  const context: ModalContextValue = {
    titleId: "modal-title",
    onDismiss: vi.fn(),
    ...value,
  };
  render(<Context.Provider value={context}>{ui}</Context.Provider>);
  return context;
};

describe("Modal.Header", () => {
  describe("the close control", () => {
    it("is an icon-only close button, named by dismissLabel", () => {
      renderHeader(<Header dismissLabel="Dismiss">Title</Header>);
      const close = screen.getByRole("button", { name: "Dismiss" });
      expect(close).toHaveAttribute("type", "button");
      expect(close).toHaveClass("icon-button", "tertiary", "close");
      expect(close.querySelector("use")?.getAttribute("href")).toContain(
        "close",
      );
      expect(close.querySelector(".label")).toBeNull();
    });

    it("is named Close by default", () => {
      renderHeader(<Header>Title</Header>);
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });

    it("dismisses the modal through its context", () => {
      const context = renderHeader(<Header>Title</Header>);
      fireEvent.click(screen.getByRole("button"));
      expect(context.onDismiss).toHaveBeenCalledTimes(1);
    });

    it("calls onDismiss instead, when given", () => {
      const onDismiss = vi.fn();
      const context = renderHeader(
        <Header onDismiss={onDismiss}>Title</Header>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(context.onDismiss).not.toHaveBeenCalled();
    });

    it("is gone when the header is undismissible", () => {
      renderHeader(<Header undismissible>Title</Header>);
      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("the title", () => {
    it("takes its id from the context, or from titleId", () => {
      renderHeader(<Header>From context</Header>);
      expect(screen.getByText("From context")).toHaveAttribute(
        "id",
        "modal-title",
      );
      renderHeader(<Header titleId="own">Own</Header>);
      expect(screen.getByText("Own")).toHaveAttribute("id", "own");
    });
  });

  it("keeps the consumer's props, its class first", () => {
    renderHeader(
      <Header className="wide" data-testid="header">
        Title
      </Header>,
    );
    expect(screen.getByTestId("header").className).toBe("ds modal-header wide");
  });
});
