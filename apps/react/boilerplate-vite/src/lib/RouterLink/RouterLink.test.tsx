import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import renderWithProviders from "../../testing/renderWithProviders.js";
import RouterLink from "./RouterLink.js";

describe("RouterLink", () => {
  it("renders an anchor with the given href, class and children", () => {
    renderWithProviders(
      <RouterLink className="row" href="/dashboard">
        Overview
      </RouterLink>,
    );

    const link = screen.getByRole("link", { name: "Overview" });

    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).toHaveClass("row");
  });

  it("forwards aria-current as given", () => {
    renderWithProviders(
      <RouterLink aria-current="page" href="/dashboard">
        Overview
      </RouterLink>,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  describe("a plain click", () => {
    it("navigates client-side to the route the URL matches", () => {
      const { router } = renderWithProviders(
        <RouterLink href="/dashboard/instances">Instances</RouterLink>,
        "/dashboard",
      );
      const navigate = vi.spyOn(router, "navigate");
      const link = screen.getByRole("link", { name: "Instances" });

      const notPrevented = fireEvent.click(link);

      expect(notPrevented).toBe(false);
      expect(navigate).toHaveBeenCalledWith(
        "dashboardInstances",
        expect.objectContaining({ params: {} }),
      );
    });

    it("leaves a URL the router does not match to the browser", () => {
      const { router } = renderWithProviders(
        <RouterLink href="https://ubuntu.com/legal">Legal</RouterLink>,
      );
      const navigate = vi.spyOn(router, "navigate");

      const notPrevented = fireEvent.click(
        screen.getByRole("link", { name: "Legal" }),
      );

      expect(notPrevented).toBe(true);
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("a modified click", () => {
    it.each([["ctrlKey"], ["metaKey"], ["shiftKey"], ["altKey"]])(
      "with %s is left to the browser",
      (modifier) => {
        const { router } = renderWithProviders(
          <RouterLink href="/dashboard">Overview</RouterLink>,
        );
        const navigate = vi.spyOn(router, "navigate");

        const notPrevented = fireEvent.click(
          screen.getByRole("link", { name: "Overview" }),
          { [modifier]: true },
        );

        expect(notPrevented).toBe(true);
        expect(navigate).not.toHaveBeenCalled();
      },
    );

    it("with the middle button is left to the browser", () => {
      const { router } = renderWithProviders(
        <RouterLink href="/dashboard">Overview</RouterLink>,
      );
      const navigate = vi.spyOn(router, "navigate");

      fireEvent.click(screen.getByRole("link", { name: "Overview" }), {
        button: 1,
      });

      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
