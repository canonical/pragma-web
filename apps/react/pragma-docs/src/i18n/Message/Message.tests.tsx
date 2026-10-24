import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import MessagesContext from "../Context.js";
import type { Translate } from "../types.js";
import { Message } from "./index.js";

/** Render under a translator that answers every key with `sentence`. */
const withSentence =
  (sentence: string) =>
  ({ children }: { children: ReactNode }) => {
    const translate: Translate = () => sentence;
    return <MessagesContext value={translate}>{children}</MessagesContext>;
  };

describe("Message", () => {
  it("renders the sentence with each element in its placeholder's place", () => {
    const { container } = render(
      <Message
        elements={{ param: <code>?auth=1</code> }}
        id="login.instruction"
      />,
    );
    expect(container.innerHTML).toBe(
      "Demo login. Add <code>?auth=1</code> to any protected URL to simulate authentication.",
    );
  });

  it("places the elements where the translator's sentence puts them", () => {
    const { container } = render(
      <Message
        elements={{ first: <code>a</code>, second: <code>b</code> }}
        id="login.instruction"
      />,
      { wrapper: withSentence("{second} : {first}") },
    );
    expect(container.innerHTML).toBe("<code>b</code> : <code>a</code>");
  });

  it("fills plain-text placeholders from the values", () => {
    const { container } = render(
      <Message
        elements={{ param: <code>?auth=1</code> }}
        id="login.from"
        values={{ from: "/account" }}
      />,
    );
    expect(container.innerHTML).toBe(
      "You will be redirected to /account after login.",
    );
  });

  it("keeps a placeholder named twice apart, each in its own place", () => {
    const { container } = render(
      <Message elements={{ range: <code>a</code> }} id="login.instruction" />,
      { wrapper: withSentence("{range} / {range}") },
    );
    expect(container.innerHTML).toBe("<code>a</code> / <code>a</code>");
  });

  it("leaves a placeholder no element names as text", () => {
    const { container } = render(
      <Message elements={{}} id="login.instruction" />,
    );
    expect(container.textContent).toBe(
      "Demo login. Add {param} to any protected URL to simulate authentication.",
    );
  });
});
