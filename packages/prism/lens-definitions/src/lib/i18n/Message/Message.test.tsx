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
        elements={{ term: <code>ds:Button</code> }}
        id="inspector.unknown"
      />,
    );
    expect(container.innerHTML).toBe(
      "No term at <code>ds:Button</code>. The rail lists every term the ontologies carry.",
    );
  });

  it("places the elements where the translator's sentence puts them", () => {
    // A translator that reverses the order of the two elements.
    const translate: Translate = () => "{namespace} : {term}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ term: <code>ds:Button</code>, namespace: <code>ds</code> }}
        id="inspector.address"
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe(
      "<code>ds</code> : <code>ds:Button</code>",
    );
  });

  it("fills plain-text placeholders from the values", () => {
    const translate: Translate = (_key, values) =>
      `{term} (${String(values?.count)})`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ term: <code>ds:Button</code> }}
        id="inspector.unknown"
        values={{ count: 2 }}
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<code>ds:Button</code> (2)");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(
      <Message elements={{}} id="inspector.unknown" />,
    );
    expect(container.textContent).toBe(
      "No term at {term}. The rail lists every term the ontologies carry.",
    );
  });
});
