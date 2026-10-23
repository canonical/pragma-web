import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownCode from "./MarkdownCode.js";

describe("MarkdownCode", () => {
  it("renders inline code with the language class merged in", () => {
    const { container } = render(
      <MarkdownCode className="language-js" node={{}}>
        x
      </MarkdownCode>,
    );

    const code = container.querySelector("code");
    expect(code?.className).toBe("ds inline-code code language-js");
    expect(code?.textContent).toBe("x");
    expect(code?.hasAttribute("node")).toBe(false);
  });
});
