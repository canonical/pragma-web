import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import MessagesContext from "../Context.js";
import type { Translate } from "../types.js";
import { Message } from "./index.js";

const URI = "http://pragma.canonical.com/codestandards#no.such.standard";

describe("Message", () => {
  it("renders the sentence with each element in its placeholder's place", () => {
    const { container } = render(
      <Message elements={{ uri: <code>{URI}</code> }} id="reading.missing" />,
    );
    expect(container.innerHTML).toBe(
      `No standard found at <code>${URI}</code>. The standards index lists every standard the graph carries.`,
    );
  });

  it("places the elements where the translator's sentence puts them", () => {
    // A translator that puts the two elements in the other order.
    const translate: Translate = () => "{class} : {uri}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ uri: <code>cs:x</code>, class: <em>CodeStandard</em> }}
        id="reading.missing"
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe(
      "<em>CodeStandard</em> : <code>cs:x</code>",
    );
  });

  it("fills plain-text placeholders from the values", () => {
    const translate: Translate = (_key, values) =>
      `{uri} (${String(values?.count)})`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ uri: <code>cs:x</code> }}
        id="reading.missing"
        values={{ count: 2 }}
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<code>cs:x</code> (2)");
  });

  it("keys an element named twice by its occurrence", () => {
    const translate: Translate = () => "{uri} and {uri}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message elements={{ uri: <code>cs:x</code> }} id="reading.missing" />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<code>cs:x</code> and <code>cs:x</code>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(
      <Message elements={{}} id="reading.missing" />,
    );
    expect(container.textContent).toBe(
      "No standard found at {uri}. The standards index lists every standard the graph carries.",
    );
  });
});
