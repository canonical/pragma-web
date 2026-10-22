import type { FooterRoot, NavRoot } from "@canonical/react-ds-app";
import { screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import {
  installMatchMedia,
  installResizeObserver,
} from "../../testing/browserStubs.js";
import renderWithProviders from "../../testing/renderWithProviders.js";
import ApplicationShell from "./ApplicationShell.js";

const root: NavRoot = {
  key: "root",
  items: [
    {
      key: "pages",
      items: [
        { url: "/dashboard", label: "Overview" },
        { url: "/dashboard/instances", label: "Instances" },
      ],
    },
    {
      key: "later",
      label: "Later",
      items: [{ key: "networks", label: "Networks", disabled: true }],
    },
  ],
};

const footerRoot: FooterRoot = {
  key: "footer",
  items: [{ url: "/guides/router-core", label: "Router guide" }],
};

beforeAll(() => {
  installMatchMedia();
  installResizeObserver();
});

function renderShell(path = "/dashboard/instances") {
  return renderWithProviders(
    <ApplicationShell footerRoot={footerRoot} label="Dashboard" root={root}>
      <h1>Page</h1>
    </ApplicationShell>,
    path,
  );
}

describe("ApplicationShell", () => {
  it("renders the page in the main landmark the skip link targets", () => {
    renderShell();

    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "main-content");
    expect(within(main).getByRole("heading", { name: "Page" })).toBeVisible();
  });

  it("names the side navigation landmark and shows the app's name", () => {
    renderShell();

    expect(
      screen.getByRole("navigation", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Boilerplate")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Dashboard overview" }),
    ).toHaveAttribute("href", "/dashboard");
  });

  it("marks the item for the current URL as the current page", () => {
    renderShell("/dashboard/instances");

    const navigation = screen.getByRole("navigation", { name: "Dashboard" });

    expect(
      within(navigation).getByRole("link", { name: "Instances" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(navigation).getByRole("link", { name: "Overview" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("translates the side navigation's built-in text", () => {
    renderWithProviders(
      <ApplicationShell label="Tableau de bord" root={root}>
        <p>Page</p>
      </ApplicationShell>,
      "/dashboard",
      "fr",
    );

    expect(
      screen.getByRole("link", { name: "Aller au contenu principal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Réduire la navigation" }),
    ).toHaveTextContent("Fermer le menu");
  });

  it("renders a disabled item without a link", () => {
    renderShell();

    expect(screen.getByText("Networks").closest("a")).toBeNull();
  });

  it("renders the footer rows", () => {
    renderShell();

    expect(screen.getByRole("link", { name: "Router guide" })).toHaveAttribute(
      "href",
      "/guides/router-core",
    );
  });

  it("merges a consumer class with its own and spreads native props", () => {
    const { container } = renderWithProviders(
      <ApplicationShell
        className="custom"
        data-testid="shell"
        label="Dashboard"
        root={root}
      >
        <p>Page</p>
      </ApplicationShell>,
    );

    expect(screen.getByTestId("shell")).toHaveClass(
      "ds",
      "application-shell",
      "surface",
      "custom",
    );
    expect(container.firstElementChild).toBe(screen.getByTestId("shell"));
  });
});
