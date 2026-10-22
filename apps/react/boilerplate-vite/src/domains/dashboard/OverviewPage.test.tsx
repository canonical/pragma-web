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
