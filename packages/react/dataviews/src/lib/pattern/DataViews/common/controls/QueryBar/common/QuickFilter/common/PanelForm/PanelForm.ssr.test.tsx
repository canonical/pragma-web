import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createQuickFilterProvider } from "../../../../../../../../../../../testing/index.js";
import DataViews from "../../../../../../../Provider.js";
import type { PlacedConjunct } from "../../../../types.js";
import PanelForm from "./PanelForm.js";

/** The status panel's first any-of set. */
const STATUS_SET: readonly PlacedConjunct[] = [
  {
    predicate: { field: "status", operator: "isAny", operands: ["ready"] },
    ref: { field: "status", operator: "isAny", nth: 0 },
  },
];

/** The memory panel's lower bounds: one with its control, one beyond it. */
const MEMORY_BOUNDS: readonly PlacedConjunct[] = [
  {
    predicate: { field: "memory", operator: "gte", operands: [1024] },
    ref: { field: "memory", operator: "gte", nth: 0 },
  },
  {
    predicate: { field: "memory", operator: "gte", operands: [2048] },
    ref: { field: "memory", operator: "gte", nth: 1 },
  },
];

/** The server's markup of a status panel's form over a provider. */
const renderForm = (
  href: string | null,
  claimed: readonly PlacedConjunct[] = STATUS_SET,
): string => {
  const provider = createQuickFilterProvider(
    href === null
      ? { query: "status=ready&q=web" }
      : { location: createMemoryLocation({ href }) },
  );
  return renderToString(
    <DataViews provider={provider}>
      <PanelForm claimed={claimed} hasHref={href !== null}>
        <input type="checkbox" name="status" value="deployed" />
      </PanelForm>
    </DataViews>,
  );
};

/** Each hidden field's name and value, in order. */
const readHidden = (html: string): string[] =>
  [
    ...html.matchAll(/<input type="hidden" name="([^"]*)" value="([^"]*)"/g),
  ].map(([, name, value]) => `${name}=${value}`);

describe("PanelForm SSR", () => {
  it("renders a GET form whose hidden fields carry every other clause and the search, with Apply", () => {
    const html = renderForm(
      "/hosts?status=ready&memory__gte=1024&memory__gte__1=2048&q=web",
    );
    expect(html).toMatch(/<form [^>]*method="get"/);
    const hidden = readHidden(html);
    expect(hidden).toEqual(
      expect.arrayContaining([
        "memory__gte=1024",
        "memory__gte__1=2048",
        "q=web",
      ]),
    );
    expect(hidden.some((pair) => pair.startsWith("status"))).toBe(false);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*>.*Apply/);
  });

  it("keeps a clause of the field the panel has no control for", () => {
    const html = renderForm("/hosts?status=ready&status__isNone=broken&q=web");
    const hidden = readHidden(html);
    expect(hidden).toContain("status__isNone=broken");
    expect(hidden).not.toContain("status=ready");
    expect(hidden).toContain("q=web");
  });

  it("keeps a further bound at its own place, apart from its control's name", () => {
    const hidden = readHidden(
      renderForm(
        "/hosts?memory__gte=1024&memory__gte__1=2048&q=web",
        MEMORY_BOUNDS,
      ),
    );
    expect(hidden).toContain("memory__gte__1=2048");
    expect(hidden.some((pair) => pair.startsWith("memory__gte="))).toBe(false);
    expect(hidden).toContain("q=web");
  });

  it("renders the controls alone in memory, with no form", () => {
    const html = renderForm(null);
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<button");
    expect(html).toContain('type="checkbox"');
  });
});
