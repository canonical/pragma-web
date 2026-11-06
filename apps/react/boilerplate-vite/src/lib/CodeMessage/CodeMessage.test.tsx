import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CodeMessage from "./CodeMessage.js";

describe("CodeMessage", () => {
  it("renders backticked names as inline code within the paragraph", () => {
    const { container } = render(
      <CodeMessage message="`LazyComponent` lit une donnée avec `use()`." />,
    );

    const codes = [...container.querySelectorAll("code")].map(
      (code) => code.textContent,
    );

    expect(codes).toEqual(["LazyComponent", "use()"]);
    expect(container.querySelector("p")).toHaveTextContent(
      "LazyComponent lit une donnée avec use().",
    );
  });

  it("renders a message without backticks as plain text", () => {
    const { container } = render(<CodeMessage message="Plain text." />);

    expect(container.querySelector("code")).toBeNull();
    expect(screen.getByText("Plain text.")).toBeInTheDocument();
  });

  it("spreads native props onto the paragraph", () => {
    render(<CodeMessage data-testid="message" message="Text" />);

    expect(screen.getByTestId("message").tagName).toBe("P");
  });
});
