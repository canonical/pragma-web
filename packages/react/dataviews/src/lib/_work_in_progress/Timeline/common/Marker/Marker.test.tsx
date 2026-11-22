import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Marker from "./Marker.js";

const readMarker = (container: HTMLElement): Element => {
  const marker = container.querySelector(".data-timeline-marker");
  if (marker === null) {
    throw new Error("no marker drawn");
  }
  return marker;
};

describe("Marker", () => {
  it("carries its size as a class", () => {
    const { container } = render(<Marker size="large" />);
    expect(readMarker(container)).toHaveClass(
      "ds",
      "data-timeline-marker",
      "large",
    );
  });

  it("draws an image with its alternative text", () => {
    render(
      <Marker size="large" marker={{ imageUrl: "/jane.png", alt: "Jane" }} />,
    );
    expect(screen.getByRole("img", { name: "Jane" })).toHaveAttribute(
      "src",
      "/jane.png",
    );
  });

  it("draws the user icon for an image without alternative text", () => {
    const { container } = render(
      <Marker size="large" marker={{ imageUrl: "/jane.png" }} />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".icon svg")).not.toBeNull();
  });

  it("draws the first graphic given: custom, then image, icon and initials", () => {
    render(
      <Marker
        size="large"
        marker={{ customGraphic: <b>B</b>, icon: <i>I</i>, initials: "JD" }}
      />,
    );
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("I")).toBeNull();
    render(
      <Marker size="medium" marker={{ icon: <i>I</i>, initials: "JD" }} />,
    );
    expect(screen.getByText("I")).toBeInTheDocument();
    render(<Marker size="medium" marker={{ initials: "KL" }} />);
    expect(screen.getByText("KL")).toBeInTheDocument();
  });

  it("draws the user icon where no graphic is given", () => {
    const { container } = render(<Marker size="medium" />);
    expect(container.querySelector(".icon svg")).not.toBeNull();
  });

  it("draws nothing inside a small marker", () => {
    const { container } = render(
      <Marker
        size="small"
        marker={{ initials: "JD" }}
        href="/jane"
        label="Jane"
      />,
    );
    expect(readMarker(container).childElementCount).toBe(0);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links the graphic, named by its label", () => {
    render(<Marker size="large" href="/jane" label="Jane Doe" />);
    expect(screen.getByRole("link", { name: "Jane Doe" })).toHaveAttribute(
      "href",
      "/jane",
    );
  });

  it("links nowhere without a label to name the link by", () => {
    render(<Marker size="large" href="/jane" />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("takes a redundant link out of the reading and tab order", () => {
    const { container } = render(
      <Marker size="large" href="/jane" label="Jane Doe" redundant />,
    );
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("aria-hidden", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(link).not.toHaveAttribute("aria-label");
  });
});
