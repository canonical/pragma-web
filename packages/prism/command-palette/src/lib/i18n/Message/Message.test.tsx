import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import MessagesContext from "../Context.js";
import type { Translate } from "../types.js";
import { Message } from "./index.js";

describe("Message", () => {
  it("renders the sentence with each element in its placeholder's place", () => {
    const { container } = render(
      <Message
        elements={{ up: <kbd>↑</kbd>, down: <kbd>↓</kbd> }}
        id="hints.move"
      />,
    );
    expect(container.innerHTML).toBe("<kbd>↑</kbd> <kbd>↓</kbd> to move");
  });

  it("places the elements where the translator's sentence puts them", () => {
    // A translator that puts the two elements in the other order.
    const translate: Translate = () => "{down} : {up}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ up: <kbd>↑</kbd>, down: <kbd>↓</kbd> }}
        id="hints.move"
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<kbd>↓</kbd> : <kbd>↑</kbd>");
  });

  it("fills plain-text placeholders from the values", () => {
    const translate: Translate = (_key, values) =>
      `{enter} (${String(values?.count)})`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ enter: <kbd>↵</kbd> }}
        id="hints.open"
        values={{ count: 2 }}
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<kbd>↵</kbd> (2)");
  });

  it("keys an element named twice by its occurrence", () => {
    const translate: Translate = () => "{enter} and {enter}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message elements={{ enter: <kbd>↵</kbd> }} id="hints.open" />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<kbd>↵</kbd> and <kbd>↵</kbd>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(<Message elements={{}} id="hints.open" />);
    expect(container.textContent).toBe("{enter} to open");
  });
});
