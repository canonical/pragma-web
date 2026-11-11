import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Suggestions from "./Suggestions.js";

describe("Suggestions SSR", () => {
  it("renders without hydration errors", () => {
    const html = renderToString(
      <Suggestions
        id="list"
        groups={[
          { id: "tickets", label: "Tickets", items: [{ id: "1", label: "A" }] },
        ]}
        onSelect={() => {}}
      />,
    );
    expect(html).toContain("ds prompt-input-suggestions");
    expect(html).toContain("Tickets");
  });
});
