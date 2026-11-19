import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import installPopoverStandIn from "../../../../testing/installPopoverStandIn.js";
import { Button } from "../Button/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import type { WithDropdownRender } from "./types.js";
import withDropdownButton from "./withDropdownButton.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());

const renderView: WithDropdownRender = ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <label>
      <input type="checkbox" /> Compact
    </label>
  </DropdownPanel>
);

const ViewTrigger = withDropdownButton(Button, renderView);

describe("withDropdownButton", () => {
  it("names the component after its trigger", () => {
    expect(ViewTrigger.displayName).toBe("withDropdownButton(Button)");
    const Named = (props: { children?: React.ReactNode }) => (
      <button type="button" {...props} />
    );
    Named.displayName = "Named";
    expect(withDropdownButton(Named, renderView).displayName).toBe(
      "withDropdownButton(Named)",
    );
    expect(
      withDropdownButton(
        ((props: { children?: React.ReactNode }) => (
          <button type="button" {...props} />
        )) as (props: { children?: React.ReactNode }) => React.ReactElement,
        renderView,
      ).displayName,
    ).toBe("withDropdownButton(AnonymousComponent)");
  });

  describe("the chevron", () => {
    it("trails the children inside Button's label, and is decorative", () => {
      render(<ViewTrigger>View</ViewTrigger>);
      const label = screen.getByText("View");
      expect(label).toHaveClass("label");
      const chevron = label.lastElementChild as HTMLElement;
      expect(chevron).toHaveClass("chevron");
      expect(chevron.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(chevron.querySelector("use")?.getAttribute("href")).toContain(
        "chevron-down",
      );
    });

    it("stays on an icon-only Button, which keeps its name", () => {
      render(<ViewTrigger icon="filter" aria-label="Filter" />);
      const trigger = screen.getByRole("button", { name: "Filter" });
      expect(trigger.querySelector(".label > .chevron")).not.toBeNull();
    });

    it("leaves a count in the children part of the name", () => {
      render(
        <ViewTrigger>
          Status <span className="count">2</span>
        </ViewTrigger>,
      );
      expect(
        screen.getByRole("button", { name: "Status 2" }),
      ).toBeInTheDocument();
    });
  });

  describe("the name warning", () => {
    it("warns when a trigger with no visible children has no name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<ViewTrigger icon="filter" />);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "withDropdownButton: a trigger with no visible children",
        ),
      );
      warn.mockRestore();
    });

    it("stays quiet when the trigger is named or labelled", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <>
          <ViewTrigger>View</ViewTrigger>
          <ViewTrigger icon="filter" aria-label="Filter" />
          <ViewTrigger icon="filter" aria-labelledby="filter-label" />
        </>,
      );
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("withDropdownButton"),
      );
      warn.mockRestore();
    });

    it("stays quiet in production", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.stubEnv("NODE_ENV", "production");
      render(<ViewTrigger icon="filter" />);
      vi.unstubAllEnvs();
      expect(warn).not.toHaveBeenCalledWith(
        expect.stringContaining("withDropdownButton"),
      );
      warn.mockRestore();
    });
  });

  describe("the class", () => {
    it("orders base, modifiers, its own, then the consumer's", () => {
      render(
        <ViewTrigger importance="secondary" className="active">
          View
        </ViewTrigger>,
      );
      expect(screen.getByRole("button").className).toBe(
        "ds button secondary ds dropdown-button active",
      );
    });

    it("needs no consumer class", () => {
      render(<ViewTrigger>View</ViewTrigger>);
      expect(screen.getByRole("button").className).toBe(
        "ds button primary ds dropdown-button",
      );
    });
  });

  it("opens its panel, with the wiring withDropdownPanel gives", async () => {
    render(<ViewTrigger>View</ViewTrigger>);
    const trigger = screen.getByRole("button");
    fireEvent.click(trigger);
    await act(async () => {});
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).toBe(screen.getByLabelText("Compact"));
  });

  it("cannot open while disabled or loading", async () => {
    render(
      <>
        <ViewTrigger disabled>Disabled</ViewTrigger>
        <ViewTrigger loading>Loading</ViewTrigger>
      </>,
    );
    for (const trigger of document.querySelectorAll("button")) {
      fireEvent.click(trigger);
    }
    await act(async () => {});
    expect(document.querySelectorAll(".dropdown-button-panel")).toHaveLength(2);
    for (const panel of document.querySelectorAll(".dropdown-button-panel")) {
      expect(panel.matches(":popover-open")).toBe(false);
    }
  });
});
