import { fireEvent, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import {
  installDialogStubs,
  installMatchMedia,
  installResizeObserver,
} from "../../testing/browserStubs.js";
import renderWithProviders from "../../testing/renderWithProviders.js";
import SettingsPage from "./SettingsPage.js";

beforeAll(() => {
  installMatchMedia();
  installResizeObserver();
  installDialogStubs();
});

function renderPage() {
  return renderWithProviders(<SettingsPage />, "/dashboard/settings");
}

describe("SettingsPage", () => {
  it("prefills the project settings", () => {
    renderPage();

    expect(screen.getByLabelText(/Default bridge/)).toHaveValue("lxdbr0");
    expect(screen.getByLabelText(/Maximum instances/)).toHaveValue(50);
  });

  describe("the delete confirmation", () => {
    it("opens from Delete project in the danger zone", () => {
      const { container } = renderPage();
      const modal = container.querySelector("dialog.ds.modal");

      expect(modal).not.toHaveAttribute("open");

      fireEvent.click(screen.getByRole("button", { name: "Delete project" }));

      expect(modal).toHaveAttribute("open");
    });

    it("closes from Cancel", () => {
      const { container } = renderPage();
      const modal = container.querySelector("dialog.ds.modal");

      fireEvent.click(screen.getByRole("button", { name: "Delete project" }));
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(modal).not.toHaveAttribute("open");
    });
  });
});
