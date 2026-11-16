import type { LinkComponentProps } from "@canonical/react-ds-global";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageControl from "./PageControl.js";
import type { PageControlProps } from "./types.js";

/** A control to the next page, reachable, with a destination. */
const renderControl = (props: Partial<PageControlProps> = {}) => {
  const onNavigate = vi.fn();
  const result = render(
    <PageControl
      label="Next page"
      icon="chevron-right"
      className="next"
      destination={new URLSearchParams("page=2")}
      reachable
      onNavigate={onNavigate}
      LinkComponent="a"
      {...props}
    />,
  );
  return { ...result, onNavigate };
};

describe("PageControl", () => {
  describe("a reachable page with a destination", () => {
    it("is a link to the destination, named by its label", () => {
      renderControl();
      expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
        "href",
        "?page=2",
      );
    });

    it("moves the window in place on a plain click", () => {
      const { onNavigate } = renderControl();
      const link = screen.getByRole("link", { name: "Next page" });
      expect(fireEvent.click(link)).toBe(false);
      expect(onNavigate).toHaveBeenCalledOnce();
    });

    it("leaves a modified or secondary click to the browser", () => {
      const { onNavigate } = renderControl();
      const link = screen.getByRole("link", { name: "Next page" });
      for (const init of [
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { altKey: true },
        { button: 1 },
      ]) {
        fireEvent.click(link, init);
      }
      expect(onNavigate).not.toHaveBeenCalled();
    });

    it("renders through the consumer's router link", () => {
      const RouterLink = ({
        href,
        className,
        children,
      }: LinkComponentProps) => (
        <a href={href} className={className} data-router-link="">
          {children}
        </a>
      );
      renderControl({ LinkComponent: RouterLink });
      const link = screen.getByRole("link", { name: "Next page" });
      expect(link).toHaveAttribute("data-router-link");
      expect(link).toHaveAttribute("href", "?page=2");
    });

    it.fails("wears its own root class, not Button's", () => {
      renderControl();
      const link = screen.getByRole("link", { name: "Next page" });
      expect(link).toHaveClass("ds", "page-control", "next");
      expect(link).not.toHaveClass("button");
    });
  });

  describe("an unreachable page", () => {
    it("is a disabled button named by its label", () => {
      renderControl({ reachable: false });
      expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    });

    it.fails("is an icon button", () => {
      renderControl({ reachable: false });
      expect(screen.getByRole("button", { name: "Next page" })).toHaveClass(
        "icon-button",
      );
    });
  });

  describe("a page with no destination", () => {
    it("is a button only scripts drive", () => {
      const { onNavigate } = renderControl({ destination: null });
      const button = screen.getByRole("button", { name: "Next page" });
      expect(button).toHaveClass("scripted", "next");
      fireEvent.click(button);
      expect(onNavigate).toHaveBeenCalledOnce();
    });
  });
});
