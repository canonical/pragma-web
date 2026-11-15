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
        <span className="mark" />
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

  it("requires a mark and a title by default", () => {
    const { container } = render(
      <p>
        <span className="title">Button</span>
      </p>,
    );
    expect(() => expectSlotOrder(container)).toThrow(
      'the required slot "mark" is absent',
    );
    expect(() =>
      expectSlotOrder(render(<p className="mark" />).container),
    ).toThrow('the required slot "title" is absent');
  });

  it("requires the slots a representation passes, and none for []", () => {
    const { container } = render(
      <p>
        <span className="title">Button</span>
      </p>,
    );
    expect(() =>
      expectSlotOrder(container, { requires: ["title"] }),
    ).not.toThrow();
    expect(() =>
      expectSlotOrder(container, { requires: ["title", "status"] }),
    ).toThrow('the required slot "status" is absent');
    expect(() =>
      expectSlotOrder(render(<p>Button</p>).container, { requires: [] }),
    ).not.toThrow();
  });

  it("leaves out the slots of a dialog below the root, as an open peek's card", () => {
    const { container } = render(
      <span>
        <span className="mark" />
        <span className="title">Button</span>
        <span role="dialog">
          <span className="mark" />
          <span className="title">Button</span>
          <span className="summary">A button.</span>
        </span>
        <span className="status">Stable</span>
      </span>,
    );
    expect(() => expectSlotOrder(container)).not.toThrow();
    const dialog = container.querySelector('[role="dialog"]');
    if (dialog === null) throw new Error("no dialog rendered");
    expect(() => expectSlotOrder(dialog)).not.toThrow();
  });

  it("does not count a required slot that only a dialog below holds", () => {
    const { container } = render(
      <span>
        <span className="title">Button</span>
        <span role="dialog">
          <span className="mark" />
        </span>
      </span>,
    );
    expect(() => expectSlotOrder(container)).toThrow(
      'the required slot "mark" is absent',
    );
  });
});
