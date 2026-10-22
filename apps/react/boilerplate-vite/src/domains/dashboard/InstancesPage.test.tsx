import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import {
  installDialogStubs,
  installMatchMedia,
  installResizeObserver,
} from "../../testing/browserStubs.js";
import renderWithProviders from "../../testing/renderWithProviders.js";
import InstancesPage from "./InstancesPage.js";

beforeAll(() => {
  installMatchMedia();
  installResizeObserver();
  installDialogStubs();
});

/** The page's own Create instance button, in its title bar. */
function openCreatePanelButton(container: HTMLElement): HTMLElement {
  const titlebar = container.querySelector<HTMLElement>("header.titlebar");
  if (titlebar === null) {
    throw new Error("InstancesPage rendered no title bar");
  }
  return within(titlebar).getByRole("button", { name: "Create instance" });
}

function renderPage() {
  return renderWithProviders(<InstancesPage />, "/dashboard/instances");
}

describe("InstancesPage", () => {
  it("lists the instances, with their count beside the heading", () => {
    renderPage();

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toHaveTextContent("Instances");
    expect(heading).toHaveTextContent("6");
    expect(
      screen.getByRole("button", { name: "Show details of web-01" }),
    ).toBeInTheDocument();
  });

  it("projects its breadcrumb trail from the navigation tree", () => {
    renderPage();

    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(
      within(trail).getByRole("link", { name: "default" }),
    ).toHaveAttribute("href", "/dashboard");
    expect(within(trail).getByText("Instances")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("labels statuses and memory in the active locale", () => {
    renderWithProviders(<InstancesPage />, "/dashboard/instances", "fr");

    expect(
      screen.getAllByText("En cours d'exécution · Ubuntu 24.04 LTS"),
    ).not.toHaveLength(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Afficher les détails de db-01" }),
    );

    expect(screen.getByText("16 Gio")).toBeInTheDocument();
  });

  describe("the details aside", () => {
    it("prompts for a selection until an instance is chosen", () => {
      renderPage();

      expect(
        screen.getByText("Select an instance to see its details."),
      ).toBeInTheDocument();
    });

    it("shows the chosen instance and marks its button pressed", () => {
      renderPage();

      const button = screen.getByRole("button", {
        name: "Show details of db-01",
      });
      fireEvent.click(button);

      expect(button).toHaveAttribute("aria-pressed", "true");
      expect(
        screen.getByRole("heading", { level: 2, name: "db-01" }),
      ).toBeInTheDocument();
      expect(screen.getByText("10.42.0.21")).toBeInTheDocument();
    });
  });

  describe("the create side panel", () => {
    it("opens prefilled from the Create instance button", () => {
      const { container } = renderPage();
      const dialog = container.querySelector("dialog");

      fireEvent.click(openCreatePanelButton(container));

      expect(dialog).toHaveAttribute("open");
      expect(screen.getByLabelText(/Instance name/)).toHaveValue("web-03");
    });

    it("adds the submitted instance, selects it and closes", async () => {
      const { container } = renderPage();
      const dialog = container.querySelector("dialog");

      fireEvent.click(openCreatePanelButton(container));
      fireEvent.submit(
        screen
          .getByLabelText(/Instance name/)
          .closest("form") as HTMLFormElement,
      );

      await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
      expect(
        screen.getByRole("button", { name: "Show details of web-03" }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("7");
    });
  });
});
