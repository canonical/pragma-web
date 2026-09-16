/**
 * The not-applicable content: a dash hidden from readers, and the word for
 * the state from the messages, reachable and clipped by its own class.
 */

import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessagesContext } from "../MessagesContext/index.js";
import NotApplicable from "./NotApplicable.js";

describe("NotApplicable", () => {
  it("hides the dash and says the messages' word", () => {
    const { container } = render(
      <MessagesContext
        value={resolveMessages({ cellNotApplicable: "Does not apply" })}
      >
        <NotApplicable />
      </MessagesContext>,
    );
    const [dash, word] = Array.from(container.children);
    expect(dash).toHaveTextContent(/^—$/);
    expect(dash).toHaveAttribute("aria-hidden", "true");
    expect(word).toHaveClass("ds", "data-views-not-applicable");
    expect(word).toHaveTextContent(/^Does not apply$/);
    expect(word).not.toHaveAttribute("aria-hidden");
  });
});
