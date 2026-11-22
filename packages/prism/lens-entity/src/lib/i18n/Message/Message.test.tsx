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
        elements={{ address: <code>metro:nowhere</code> }}
        id="page.notFound"
      />,
    );
    expect(container.innerHTML).toBe(
      "Nothing in the graph answers to <code>metro:nowhere</code>.",
    );
  });

  it("places the elements where the translator's sentence puts them", () => {
    // A translator that reverses the order of the two elements.
    const translate: Translate = () => "{range} : {property}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{
          property: <code>metro:servesLine</code>,
          range: <code>metro:Line</code>,
        }}
        id="statements.group"
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe(
      "<code>metro:Line</code> : <code>metro:servesLine</code>",
    );
  });

  it("fills plain-text placeholders from the values", () => {
    const { container } = render(
      <Message
        elements={{ label: <code>metro:servesLine</code> }}
        id="statements.group"
        values={{ count: "4" }}
      />,
    );
    expect(container.innerHTML).toBe("<code>metro:servesLine</code> · 4");
  });

  it("keeps a placeholder named twice apart, each in its own place", () => {
    const translate: Translate = () => "{range} / {range}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message elements={{ range: <code>a</code> }} id="statements.group" />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<code>a</code> / <code>a</code>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(<Message elements={{}} id="page.notFound" />);
    expect(container.textContent).toBe(
      "Nothing in the graph answers to {address}.",
    );
  });
});
