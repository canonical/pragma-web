import { fireEvent, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  installMatchMedia,
  installResizeObserver,
} from "../../testing/browserStubs.js";
import renderWithProviders from "../../testing/renderWithProviders.js";
import OverviewPage from "./OverviewPage.js";

beforeAll(() => {
  installMatchMedia();
  installResizeObserver();
});

describe("OverviewPage", () => {
  it("shows the status tiles, the releases and the activity feed", () => {
    renderWithProviders(<OverviewPage />, "/dashboard");

    expect(
      screen.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("Ubuntu 25.10")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Activity" }),
    ).toBeInTheDocument();
  });

  it("reads fully in French: labels, data, figures and relative times", () => {
    renderWithProviders(<OverviewPage />, "/dashboard", "fr");

    expect(
      screen.getByRole("heading", { level: 1, name: "Vue d'ensemble" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^2,4\sTo$/u)).toBeInTheDocument();
    expect(screen.getByText("web-01 démarrée")).toBeInTheDocument();
    expect(screen.getByText("il y a 2 minutes")).toBeInTheDocument();
    expect(screen.getByText("hier")).toBeInTheDocument();
    expect(screen.getByText("Planificateur")).toBeInTheDocument();
    expect(screen.getByText("Bêta · noyau 6.17")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Fil d'Ariane" }),
    ).toBeInTheDocument();
  });

  it("marks Overview as the current crumb", () => {
    renderWithProviders(<OverviewPage />, "/dashboard");

    const trail = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(within(trail).getByText("Overview")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("navigates to the instances from Create instance", () => {
    const { router } = renderWithProviders(<OverviewPage />, "/dashboard");
    const navigate = vi.spyOn(router, "navigate");

    fireEvent.click(screen.getByRole("button", { name: "Create instance" }));

    expect(navigate).toHaveBeenCalledWith("dashboardInstances");
  });
});
