import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectSlotOrder } from "../../../testing/index.js";

describe("expectSlotOrder", () => {
  it("accepts slots that are a subsequence of the order", () => {
    const { container } = render(
      <p>
        <span className="mark" />
        <span className="title">Button</span>
        <span className="kind">Component</span>
        <span className="status">Stable</span>
      </p>,
    );
    expect(() => expectSlotOrder(container)).not.toThrow();
  });

  it("reads a slot nested in another where it begins", () => {
    const { container } = render(
      <h3 className="title">
        <span className="mark" />
        <span className="prefix">ds</span>
        Button
      </h3>,
    );
    expect(() => expectSlotOrder(container)).not.toThrow();
  });

  it("rejects two slots out of order", () => {
    const { container } = render(
      <p>
        <span className="title">Button</span>
        <span className="prefix">ds</span>
      </p>,
    );
    expect(() => expectSlotOrder(container)).toThrow(
      'slot "prefix" follows "title"',
    );
  });

  it("rejects a mark that follows its title", () => {
    const { container } = render(
      <p>
        <span className="title">Button</span>
        <span>
          <span className="mark" />
        </span>
      </p>,
    );
    expect(() => expectSlotOrder(container)).toThrow(
      'slot "mark" follows "title"',
    );
  });

  it("accepts a representation with no slots", () => {
    const { container } = render(<p>Button</p>);
    expect(() => expectSlotOrder(container)).not.toThrow();
  });
});
