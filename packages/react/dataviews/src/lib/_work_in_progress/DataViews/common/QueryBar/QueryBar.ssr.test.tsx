/**
 * A server render of the query bar: with a location that spells addresses,
 * a search form around a plain input, each chip's remove control and the
 * clear control as links, and a refused filter's clear as a link; under
 * the in-memory default, the same controls, inert.
 */
import { createMemoryLocation } from "@canonical/dataviews-core";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/index.js";
import DataViews from "../../Provider.js";
import QueryBar from "./QueryBar.js";

/** The server markup of the bar over a provider. */
const renderBar = (
  provider: ReturnType<typeof createMachineProvider>["provider"],
) =>
  renderToString(
    <DataViews provider={provider}>
      <QueryBar />
    </DataViews>,
  );

/** Where a link of the markup leads, by its name. */
const readHref = (html: string, name: string): string | undefined =>
  [...html.matchAll(/<a ([^>]*)>([^<]*)/g)]
    .find(
      ([, attributes = "", text]) =>
        attributes.includes(`aria-label="${name}"`) || text === name,
    )
    ?.at(1)
    ?.match(/href="([^"]*)"/)
    ?.at(1)
    ?.replaceAll("&amp;", "&");

describe("DataViews.QueryBar SSR", () => {
  it("renders a search form and links where the location spells addresses", () => {
    const location = createMemoryLocation({
      href: "/machines?status=failed&cores__gte=2&cores__lte=8&q=alder&status__isNone=melted",
    });
    const { provider, source } = createMachineProvider({ location });
    const html = renderBar(provider);
    expect(html).toContain('method="get"');
    expect(html).toContain('role="search"');
    // The field stays in flow until scripts run.
    expect(html).toMatch(/^<div class="ds data-views-query-bar">/);
    expect(html).toContain('name="q"');
    expect(html).toContain('value="alder"');
    expect(html).toContain('type="hidden" name="status" value="failed"');
    const searchForm = html.match(/<form role="search".*?<\/form>/)?.at(0);
    expect(searchForm).not.toContain('type="hidden" name="q"');
    // The refused clause rides on, so a search never widens the query.
    expect(searchForm).toContain(
      'type="hidden" name="status__isNone" value="melted"',
    );
    /** The keys a link's address carries. */
    const readKeys = (name: string) => {
      const href = readHref(html, name);
      expect(href, name).toBeDefined();
      return [...new URLSearchParams(href).keys()];
    };
    // Each removal leads to the query without its clause. A refused clause
    // rides on, but for one on the field a link changes, which it replaces.
    expect(readKeys("Remove status is failed")).not.toContain("status");
    expect(readKeys("Remove status is failed")).not.toContain("status__isNone");
    expect(readKeys("Remove Search for alder")).toContain("status__isNone");
    expect(readKeys("Remove cores at least 2 and at most 8")).not.toContain(
      "cores__gte",
    );
    expect(readKeys("Remove cores at least 2 and at most 8")).not.toContain(
      "cores__lte",
    );
    expect(readKeys("Remove Search for alder")).not.toContain("q");
    // Clearing the filters replaces the refused one too.
    expect(readKeys("Clear filters and search")).toEqual(["page", "size"]);
    // The filters form, disclosed; two filter chips, cores' range once.
    expect(html).toContain(
      '<details class="ds data-views-query-bar-filters-disclosure filters">',
    );
    expect(html).toContain("Filters (2)");
    // Only the refused chip's own clear removes its parameter.
    expect(readHref(html, "Clear status")).toBe(
      "?status=failed&cores__gte=2&cores__lte=8&q=alder",
    );
    expect(source.calls).toHaveLength(0);
  });

  it("renders Merge as a link to the merged query, or not at all without an address", () => {
    const location = createMemoryLocation({
      href: "/machines?cores__gte=8&cores__lte=2",
    });
    const html = renderBar(createMachineProvider({ location }).provider);
    const keys = new URLSearchParams(readHref(html, "Merge the cores filters"));
    expect(keys.get("cores__gte")).toBe("2");
    expect(keys.get("cores__lte")).toBe("8");
    const memory = renderBar(
      createMachineProvider({
        snapshot: { query: "cores__gte=8&cores__lte=2", presentation: {} },
      }).provider,
    );
    expect(memory).toContain("The cores filters cannot all hold");
    expect(memory).not.toContain("Merge the cores filters");
  });

  it("renders the controls inert under the in-memory default", () => {
    const { provider } = createMachineProvider({
      snapshot: { query: "status=failed&q=alder", presentation: {} },
    });
    const html = renderBar(provider);
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<details");
    expect(html).not.toContain("name=");
    expect(html).not.toMatch(/<a [^>]*href=/);
    expect(html).toContain('value="alder"');
    // With no search, the plain input is empty.
    expect(renderBar(createMachineProvider().provider)).toContain('value=""');
  });
});
