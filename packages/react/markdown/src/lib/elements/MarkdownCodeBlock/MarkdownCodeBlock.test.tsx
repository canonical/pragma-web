import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownCodeBlock from "./MarkdownCodeBlock.js";

describe("MarkdownCodeBlock", () => {
  it("renders a code block with the consumer's class last", () => {
    const { container } = render(
      <MarkdownCodeBlock className="custom" node={{}}>
        <code>x</code>
      </MarkdownCodeBlock>,
    );

    const pre = container.querySelector("pre");
    expect(pre?.className).toBe("ds markdown-code-block p code custom");
    expect(pre?.querySelector("code")?.textContent).toBe("x");
    expect(pre?.hasAttribute("node")).toBe(false);
  });

  it("renders without a consumer class", () => {
    const { container } = render(<MarkdownCodeBlock>x</MarkdownCodeBlock>);

    expect(container.querySelector("pre")?.className).toBe(
      "ds markdown-code-block p code",
    );
  });
});
