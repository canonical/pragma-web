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
        elements={{ kind: <b>Class</b>, location: <i>ds</i> }}
        id="entity.context"
      />,
    );
    expect(container.innerHTML).toBe("<b>Class</b> in <i>ds</i>");
  });

  it("places the elements where the translator's sentence puts them", () => {
    // A translator that reverses the order of the two elements.
    const translate: Translate = () => "{location} : {kind}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ kind: <b>Class</b>, location: <i>ds</i> }}
        id="entity.context"
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<i>ds</i> : <b>Class</b>");
  });

  it("fills plain-text placeholders from the values", () => {
    const translate: Translate = (_key, values) =>
      `${String(values?.count)} {kind}`;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message
        elements={{ kind: <b>stations</b> }}
        id="entity.context"
        values={{ count: 12 }}
      />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("12 <b>stations</b>");
  });

  it("keeps a placeholder named twice apart, each in its own place", () => {
    const translate: Translate = () => "{title} / {title}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message elements={{ title: <b>a</b> }} id="chip.peek" />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<b>a</b> / <b>a</b>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(<Message elements={{}} id="chip.peek" />);
    expect(container.textContent).toBe("Preview of {title}");
  });
});
