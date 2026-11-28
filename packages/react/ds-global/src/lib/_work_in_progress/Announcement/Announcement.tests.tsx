import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../component/Button/index.js";
import Announcement from "./Announcement.js";

describe("Announcement", () => {
  it("renders content", () => {
    render(<Announcement criticality="information">Test content</Announcement>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders an optional heading", () => {
    render(
      <Announcement criticality="information" heading="Subject">
        Body
      </Announcement>,
    );
    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("omits the heading when not provided", () => {
    const { container } = render(
      <Announcement criticality="information">Body</Announcement>,
    );
    expect(container.querySelector(".heading")).toBeNull();
  });

  it("renders the slots in flow-content elements", () => {
    const { container } = render(
      <Announcement criticality="information" heading="Subject">
        Body
      </Announcement>,
    );
    expect(container.querySelector(".text")?.tagName).toBe("DIV");
    expect(container.querySelector(".heading")?.tagName).toBe("DIV");
    expect(container.querySelector(".content")?.tagName).toBe("DIV");
  });

  it("accepts a heading element in the heading slot", () => {
    render(
      <Announcement criticality="information" heading={<h2>Subject</h2>}>
        Body
      </Announcement>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Subject",
    );
  });

  it("accepts flow content in the content slot", () => {
    render(
      <Announcement criticality="information">
        <p>Body</p>
      </Announcement>,
    );
    expect(screen.getByText("Body").tagName).toBe("P");
  });

  it("renders a control nested in the content", () => {
    render(
      <Announcement criticality="error" heading="Something went wrong">
        <p>Usage request failed (500)</p>
        <Button type="button" importance="tertiary">
          Try again
        </Button>
      </Announcement>,
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("applies the criticality modifier class", () => {
    const { container } = render(
      <Announcement criticality="error">Body</Announcement>,
    );
    expect(container.querySelector(".ds.announcement")).toHaveClass("error");
  });

  it("renders a decorative icon element", () => {
    const { container } = render(
      <Announcement criticality="information">Body</Announcement>,
    );
    const icon = container.querySelector(".icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Announcement criticality="information" className="custom-class">
        Content
      </Announcement>,
    );
    const root = container.querySelector(".ds.announcement");
    expect(root).toHaveClass("custom-class");
  });

  it("passes through additional props", () => {
    render(
      <Announcement criticality="information" data-testid="test-component">
        Content
      </Announcement>,
    );
    expect(screen.getByTestId("test-component")).toBeInTheDocument();
  });
});
