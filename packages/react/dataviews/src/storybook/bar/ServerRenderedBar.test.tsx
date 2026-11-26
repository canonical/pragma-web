import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ServerRenderedBar from "./ServerRenderedBar.js";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("ServerRenderedBar", () => {
  it("draws the bar's markup in memory, with nothing to lead to", () => {
    render(<ServerRenderedBar />);
    expect(screen.queryByRole("search")).toBeNull();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("draws the bar's markup at an address, at its width", () => {
    const { container } = render(
      <ServerRenderedBar
        href="/machines?status=deployed"
        inlineSize="22.5rem"
      />,
    );
    expect(screen.getByRole("search")).toHaveAttribute("method", "get");
    expect(
      screen.getByRole("link", { name: "Remove status is deployed" }),
    ).toBeInTheDocument();
    expect((container.firstElementChild as HTMLElement).style.inlineSize).toBe(
      "22.5rem",
    );
  });

  it("speaks the story's words", () => {
    render(
      <ServerRenderedBar
        messages={{ clearFiltersAndSearch: "Tout effacer" }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Tout effacer" }),
    ).toBeInTheDocument();
  });

  it("leaves a press outside a link to the page", () => {
    render(<ServerRenderedBar href="/machines?status=deployed" />);
    expect(fireEvent.click(screen.getByRole("search"))).toBe(true);
  });

  it("follows a link and a submitted form within the frame", () => {
    render(<ServerRenderedBar href="/machines?status=deployed" />);
    expect(
      fireEvent.click(
        screen.getByRole("link", { name: "Remove status is deployed" }),
      ),
    ).toBe(false);
    expect(fireEvent.submit(screen.getByRole("search"))).toBe(false);
  });
});
