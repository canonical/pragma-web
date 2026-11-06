import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import useScrollOverflow from "./useScrollOverflow.js";

const forwarded = createRef<HTMLDivElement>();

function Probe() {
  const { ref, overflowTop, overflowBottom } =
    useScrollOverflow<HTMLDivElement>(forwarded);
  return (
    <div
      ref={ref}
      data-overflow-top={overflowTop || undefined}
      data-overflow-bottom={overflowBottom || undefined}
    >
      Body
    </div>
  );
}

describe("useScrollOverflow SSR", () => {
  it("renders without errors in node environment", () => {
    const html = renderToString(<Probe />);
    expect(html).toContain("Body");
  });

  it("reports no overflow on the server — there is nothing laid out to measure", () => {
    // Effects never run on the server, so the flags keep their initial
    // false and the edge attributes stay out of the markup until hydration
    // measures the real box.
    const html = renderToString(<Probe />);
    expect(html).not.toContain("data-overflow-top");
    expect(html).not.toContain("data-overflow-bottom");
  });
});
