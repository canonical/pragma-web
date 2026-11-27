import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { installPopoverStandIn } from "../../../testing/index.js";
import BarMachines from "./BarMachines.js";

let uninstall: () => void;
beforeAll(() => {
  uninstall = installPopoverStandIn();
});
afterAll(() => uninstall());
afterEach(() => {
  window.history.replaceState(null, "", "/");
});

/** The table's record rows, the header's left out. */
const countRecords = (): number => screen.getAllByRole("row").length - 1;

describe("BarMachines", () => {
  it("draws the bar over the sixty machines' table", async () => {
    render(<BarMachines />);
    expect(
      screen.getByRole("combobox", { name: "Filter records" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(countRecords()).toBe(50));
  });

  it("starts on the configured query, at the configured width", async () => {
    const { container } = render(
      <BarMachines query="status=deployed" inlineSize="20rem" />,
    );
    expect(
      await screen.findByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument();
    expect(
      container.querySelector<HTMLElement>('[style*="inline-size"]')?.style
        .inlineSize,
    ).toBe("20rem");
  });

  it("changes the status from outside the bar, taking no focus", async () => {
    render(<BarMachines withOutsideChange />);
    const button = screen.getByRole("button", {
      name: "Show only machines tagged ex-ssd",
    });
    expect(fireEvent.pointerDown(button)).toBe(false);
    expect(fireEvent.mouseDown(button)).toBe(false);
    fireEvent.click(button);
    expect(
      await screen.findByRole("group", { name: "tags is ex-ssd" }),
    ).toBeInTheDocument();
  });

  it("keeps the query in the frame's address", async () => {
    window.history.replaceState(null, "", "/?id=bar--default&status=broken");
    render(<BarMachines withHistory query="status=ready" />);
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("status")).toBe(
        "ready",
      ),
    );
    expect(new URLSearchParams(window.location.search).get("id")).toBe(
      "bar--default",
    );
  });

  it("keeps the query with no history in the frame", async () => {
    render(<BarMachines withHistory />);
    await waitFor(() => expect(countRecords()).toBe(50));
  });

  it("reads an address of its own", async () => {
    render(<BarMachines href="/machines?status=deployed" />);
    expect(
      await screen.findByRole("group", { name: "status is deployed" }),
    ).toBeInTheDocument();
  });

  it("places the action bar over rows selected", async () => {
    render(<BarMachines selected={["bm-01", "bm-02"]} />);
    expect(await screen.findByText("2 selected")).toBeInTheDocument();
  });

  it("puts each machine in a pool", async () => {
    render(<BarMachines withPools quickFilters={["pool"]} />);
    expect(
      await screen.findByRole("button", { name: "pool" }),
    ).toBeInTheDocument();
  });

  it("speaks the story's words", () => {
    render(
      <BarMachines
        messages={{ queryBar: (noun) => `Filtrer ${noun.plural}` }}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "Filtrer records" }),
    ).toBeInTheDocument();
  });
});
