import {
  createMemoryLocation,
  type DataViewsProvider,
  type SchemaFieldDefinition,
} from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createQuickFilterProvider } from "../../../../../../../../../testing/index.js";
import DataViews from "../../../../../Provider.js";
import { useQueryGroup } from "../../hooks/index.js";
import QuickFilter from "./QuickFilter.js";
import type { QuickFilterArrangement } from "./types.js";

type Provider = DataViewsProvider<readonly SchemaFieldDefinition[]>;

/** One quick filter as the server renders it. */
function Host({
  provider,
  field,
  arrangement,
  hasHref,
}: {
  readonly provider: Provider;
  readonly field: string;
  readonly arrangement: QuickFilterArrangement;
  readonly hasHref: boolean;
}) {
  const group = useQueryGroup(provider);
  return (
    <QuickFilter
      field={field}
      arrangement={arrangement}
      group={group}
      hasHref={hasHref}
      onRefused={() => undefined}
      onCommitted={() => undefined}
      onInvalid={() => undefined}
    />
  );
}

const renderFilter = (
  field: string,
  arrangement: QuickFilterArrangement,
  href: string | null,
): string => {
  const provider = createQuickFilterProvider(
    href === null
      ? { query: "status=ready&q=web" }
      : { location: createMemoryLocation({ href }) },
  ) as unknown as Provider;
  return renderToString(
    <DataViews provider={provider}>
      <Host
        provider={provider}
        field={field}
        arrangement={arrangement}
        hasHref={href !== null}
      />
    </DataViews>,
  );
};

describe("QuickFilter SSR", () => {
  it("renders each word as a link to the query with its condition set or removed", () => {
    const html = renderFilter(
      "status",
      "words",
      "/hosts?status=ready&pool=pool-01&q=web",
    );
    expect(html).toMatch(
      /<a class="word" href="\?pool=pool-01&amp;status=deployed&amp;q=web[^"]*">deployed<\/a>/,
    );
    expect(html).toMatch(/href="\?[^"]*" aria-current="true">ready</);
    // All keeps the other field and the search.
    expect(html).toMatch(
      /<a class="word" href="\?pool=pool-01&amp;q=web[^"]*">All</,
    );
  });

  it("renders the words inert in memory, the current one still marked", () => {
    const html = renderFilter("status", "words", null);
    expect(html).not.toContain("<a ");
    expect(html).toMatch(/<span class="word" aria-current="true">ready/);
  });

  it("renders no search before scripts, which it needs", () => {
    const html = renderFilter("pool", "button", "/hosts");
    expect(html).toContain('name="pool"');
    expect(html).not.toContain('role="searchbox"');
  });

  it("renders the panel as a GET form with Apply at an address, and controls without names in memory", () => {
    const linked = renderFilter(
      "status",
      "button",
      "/hosts?status=ready&q=web",
    );
    expect(linked).toMatch(/<form [^>]*method="get"/);
    expect(linked).toContain('name="status"');
    expect(linked).toContain(">Apply<");
    const inert = renderFilter("status", "button", null);
    expect(inert).not.toContain("<form");
    expect(inert).not.toMatch(/<input[^>]* name=/);
    expect(inert).toContain('popover="auto"');
  });
});
