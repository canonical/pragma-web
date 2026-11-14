/**
 * The filters' list of a followed link's refused clauses: each reason, a
 * Clear for every clause that withheld the query, and where focus goes once
 * a clause is cleared.
 */
import {
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
} from "@canonical/dataviews-core";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import expectNoAxeViolations from "../../../../../../../../testing/expectNoAxeViolations.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import DataViews from "../../../../Provider.js";
import Filters from "../../Filters.js";
import LinkRefusals from "./LinkRefusals.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [
    {
      field: "status",
      kind: "choices",
      options: ["failed", "cancelled", "ready"],
    },
    { field: "cpu", kind: "number", min: 0, max: 64 },
  ],
});

const capabilities = declareCapabilities(collection, {
  filter: { status: true, cpu: true },
  search: ["status"],
  sort: { fields: ["cpu"], terms: 1 },
  counts: COUNTED_EXACTLY,
});

/** A provider standing on a followed link. */
const follow = (href: string) => {
  const { source, calls } = createManualSource<Row>({ capabilities });
  const location = createMemoryLocation({ href });
  const provider = createDataViewsProvider({ collection, source, location });
  return { provider, location, calls };
};

const mount = (href: string) => {
  const followed = follow(href);
  const view = render(
    <DataViews provider={followed.provider}>
      <Filters labels={{ status: "Status", cpu: "Cores" }} />
    </DataViews>,
  );
  const release = followed.provider.observe();
  return { ...followed, view, release };
};

const findRefusalList = () =>
  screen.getByRole("list", { name: "Not applied from the link" });

describe("LinkRefusals", () => {
  it("lists every refused clause with its reason, and a Clear for those that withheld", () => {
    const { release } = mount(
      "/machines?status=melted&sort=nope__desc&q=a&q=b",
    );
    const items = within(findRefusalList()).getAllByRole("listitem");
    expect(items.map((item) => item.firstChild?.textContent)).toEqual([
      'Status: "melted" is not an option of "status".',
      'Sort: "nope" is not a field of this collection.',
      'Search: "q" takes one value; the extra values were ignored.',
    ]);
    // The sort fell back to the default, so it has nothing to clear.
    expect(
      within(findRefusalList())
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Clear Status", "Clear Search"]);
    release();
  });

  it("names a refused window by the words its control reads, a grouping by its fields", () => {
    const { release } = mount("/machines?page=0&size=0&group=status");
    const items = within(findRefusalList()).getAllByRole("listitem");
    expect(items.map((item) => item.firstChild?.textContent)).toEqual([
      'Page: "0" is not a positive integer.',
      'Rows per page: "0" is not a positive integer.',
      "Status: this source cannot group.",
    ]);
    expect(within(findRefusalList()).queryByRole("button")).toBeNull();
    release();
  });

  it("names a grouping the snapshot was refused for in the words the root speaks", () => {
    const { source } = createManualSource<Row>({ capabilities });
    const provider = createDataViewsProvider({
      collection,
      source,
      snapshot: { query: "group=status", presentation: {} },
    });
    render(
      <DataViews provider={provider}>
        <Filters />
      </DataViews>,
    );
    expect(within(findRefusalList()).getByRole("listitem")).toHaveTextContent(
      /^Grouping: /,
    );
  });

  it("clears a refused set at its own key, as its link does, keeping the applied one", () => {
    const { location, release } = mount(
      "/machines?status=failed&status__isNone=melted",
    );
    const button = within(findRefusalList()).getByRole("button", {
      name: "Clear Status",
    });
    fireEvent.click(button);
    expect(location.read().getAll("status")).toEqual(["failed"]);
    expect(location.read().has("status__isNone")).toBe(false);
    release();
    // The link before scripts leads to the same place.
    const html = renderToString(
      <DataViews
        provider={
          follow("/machines?status=failed&status__isNone=melted").provider
        }
      >
        <Filters />
      </DataViews>,
    );
    expect(html).toContain('href="?status=failed"');
  });

  it("hands a focused Clear link's focus to its button once scripts take over", async () => {
    const href = "/machines?status=melted&cpu__gte=lots";
    const tree = (
      <DataViews provider={follow(href).provider}>
        <Filters labels={{ status: "Status", cpu: "Cores" }} />
      </DataViews>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    const links = [...container.querySelectorAll<HTMLAnchorElement>("a.clear")];
    expect(links.map((link) => link.textContent)).toEqual([
      "Clear Status",
      "Clear Cores",
    ]);
    links.at(1)?.focus();
    await act(async () => {
      const root = hydrateRoot(container, tree);
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(screen.getByRole("button", { name: "Clear Cores" })).toHaveFocus();
  });

  it("names a refused filter on an undeclared field by the field it spells", () => {
    const { release } = mount("/machines?memory__gte=4");
    expect(within(findRefusalList()).getByRole("listitem")).toHaveTextContent(
      'memory: "memory" is not a field of this collection.',
    );
    release();
  });

  it("removes a cleared clause, and hands focus to the next Clear", () => {
    const { location, calls, release } = mount(
      "/machines?status=melted&cpu__gte=lots",
    );
    const [first, second] = within(findRefusalList()).getAllByRole("button");
    act(() => {
      first?.focus();
      first?.click();
    });
    expect(location.read().has("status")).toBe(false);
    expect(second).toHaveFocus();
    // Another clause still withholds the query.
    expect(calls).toHaveLength(0);
    act(() => {
      second?.click();
    });
    expect(location.read().has("cpu__gte")).toBe(false);
    expect(
      screen.queryByRole("list", { name: "Not applied from the link" }),
    ).toBeNull();
    // The list is gone, so focus goes to the filters' group.
    expect(screen.getByRole("group", { name: "Filters" })).toHaveFocus();
    expect(calls).toHaveLength(1);
    release();
  });

  it("hands focus to the Clear before when the last one is cleared", () => {
    const { release } = mount("/machines?status=melted&cpu__gte=lots");
    const [first, second] = within(findRefusalList()).getAllByRole("button");
    act(() => {
      second?.click();
    });
    expect(first).toHaveFocus();
    release();
  });

  it("clears a refused search from the link", () => {
    const { location, release } = mount("/machines?q=a&q=b");
    fireEvent.click(
      within(findRefusalList()).getByRole("button", { name: "Clear Search" }),
    );
    expect(location.read().has("q")).toBe(false);
    release();
  });

  it("has no axe violation while a refused clause is listed", async () => {
    const { view, release } = mount("/machines?status=melted&sort=nope__desc");
    await expectNoAxeViolations(view.container);
    release();
  });

  it("leads each Clear to the URL without it before scripts run", () => {
    const { provider } = follow(
      "/machines?tab=a&status=melted&sort=nope__desc",
    );
    const html = renderToString(
      <DataViews provider={provider}>
        <Filters />
      </DataViews>,
    );
    expect(html).toContain("Not applied from the link");
    expect(html).toContain('href="?tab=a&amp;sort=nope__desc"');
    expect(html).not.toContain('<button type="button"');
  });

  it("leads to the bare page when the clause was all the link carried", () => {
    const { provider } = follow("/machines?status=melted");
    const html = renderToString(
      <DataViews provider={provider}>
        <Filters />
      </DataViews>,
    );
    expect(html).toContain('href="?"');
  });

  it("offers no link without a location to lead from", () => {
    const { source } = createManualSource<Row>({ capabilities });
    const provider = createDataViewsProvider({
      collection,
      source,
      snapshot: { query: "status=melted", presentation: {} },
    });
    const html = renderToString(
      <DataViews provider={provider}>
        <Filters />
      </DataViews>,
    );
    expect(html).toContain("Not applied from the link");
    expect(html).not.toContain("Clear status");
  });

  it("offers no Clear for a clause the location does not carry", () => {
    const { source } = createManualSource<Row>({ capabilities });
    const provider = createDataViewsProvider({
      collection,
      source,
      location: createMemoryLocation({ href: "/machines" }),
      snapshot: { query: "status=melted", presentation: {} },
    });
    render(
      <DataViews provider={provider}>
        <Filters />
      </DataViews>,
    );
    expect(within(findRefusalList()).getByRole("listitem")).toHaveTextContent(
      "status: ",
    );
    expect(within(findRefusalList()).queryByRole("button")).toBeNull();
  });

  it("spreads a caller's native props onto its root, beside its own class", () => {
    const { source } = createManualSource<Row>({ capabilities });
    const provider = createDataViewsProvider({
      collection,
      source,
      location: createMemoryLocation({ href: "/machines?status=melted" }),
    });
    const { container } = render(
      <DataViews provider={provider}>
        <LinkRefusals
          issues={provider.issues.get()}
          nameField={(field) => field}
          params={null}
          onClear={() => {}}
          focusGroup={() => {}}
          className="mine"
          data-testid="refusals"
        />
      </DataViews>,
    );
    const root = container.querySelector("[data-testid='refusals']");
    expect(root).toHaveClass("ds", "data-views-filters-link-refusals", "mine");
  });
});
