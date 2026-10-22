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
        elements={{ title: <b>IconButton</b>, parent: <i>Button</i> }}
        id="entity.parent"
      />,
    );
    expect(container.innerHTML).toBe("<b>IconButton</b> ∈ <i>Button</i>");
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
    const { container } = render(
      <Message
        elements={{ kind: <b>stations</b> }}
        id="list.count"
        values={{ count: 12 }}
      />,
    );
    expect(container.innerHTML).toBe("12 <b>stations</b>");
  });

  it("keeps a placeholder named twice apart, each in its own place", () => {
    const translate: Translate = () => "{lead} / {lead}";
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MessagesContext value={translate}>{children}</MessagesContext>
    );
    const { container } = render(
      <Message elements={{ lead: <b>a</b> }} id="chip.lead" />,
      { wrapper },
    );
    expect(container.innerHTML).toBe("<b>a</b> / <b>a</b>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(<Message elements={{}} id="entity.parent" />);
    expect(container.textContent).toBe("{title} ∈ {parent}");
  });
});
