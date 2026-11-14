/**
 * One further conjunct's row: read-only, carried through a submission
 * under its own ordinal, and cleared alone — by a link before scripts run
 * and by a button after, which takes the link's focus.
 */
import {
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  DEFAULT_WINDOW,
  declareCapabilities,
  decodeQuery,
  EMPTY_SLICE,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { createManualSource } from "@canonical/dataviews-core/testing";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, onTestFinished } from "vitest";
import { COUNTED_EXACTLY } from "../../../../../../../../../../testing/fixtures.js";
import DataViews from "../../../../../../Provider.js";
import Filters from "../../../../Filters.js";
import FurtherConjunct from "./FurtherConjunct.js";

type Row = { readonly id: string };

const collection = createCollection({
  identify: (row: Row) => row.id,
  fields: [
    {
      field: "tags",
      kind: "choices",
      options: ["ex-gpu", "ex-nvme", "ex-ssd"],
    },
    { field: "cpu", kind: "number", min: 0, max: 64 },
  ],
});

const capabilities = declareCapabilities(collection, {
  filter: { tags: true, cpu: true },
  counts: COUNTED_EXACTLY,
});

const LINK = "/machines?tags=ex-gpu&tags__isAny__1=ex-nvme&cpu__gte=4";

/** A provider on a followed link. */
const follow = (href: string) =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({ capabilities }).source,
    location: createMemoryLocation({ href }),
  });

const tree = (provider: ReturnType<typeof follow>) => (
  <DataViews provider={provider}>
    <Filters labels={{ tags: "Tags", cpu: "Cores" }} />
  </DataViews>
);

describe("FurtherConjunct", () => {
  it("clears its conjunct alone, and hands focus to the filters' group", () => {
    const provider = follow(LINK);
    render(tree(provider));
    const release = provider.observe();
    fireEvent.click(
      screen.getByRole("button", { name: "Clear Tags is any of ex-nvme" }),
    );
    expect(provider.state.get().slice.filter).toEqual([
      { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
      { field: "cpu", operator: "gte", operands: [4] },
    ]);
    expect(screen.getByRole("group", { name: "Filters" })).toHaveFocus();
    expect(screen.getByRole("checkbox", { name: "ex-gpu" })).toBeChecked();
    release();
  });

  it("leads its Clear to the query without it before scripts run, and carries it in a submission", () => {
    const html = renderToString(tree(follow(LINK)));
    expect(html).toContain(
      'href="?cpu__gte=4&amp;tags=ex-gpu&amp;page=1&amp;size=50"',
    );
    expect(html).toContain(
      'type="hidden" name="tags__isAny__1" value="ex-nvme"',
    );
    expect(html).toContain("Clear Tags is any of ex-nvme");
  });

  it("keeps every conjunct through a submission of the server's form", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(
      tree(follow(`${LINK}&tags__isAny__2=ex-ssd&cpu__gte__1=8`)),
    );
    const form = container.querySelector("form");
    if (form === null) {
      throw new Error("expected the filters' form");
    }
    const submitted = new URLSearchParams(
      [...new FormData(form)].map(([name, value]) => [name, String(value)]),
    );
    expect(
      decodeQuery({ schema: collection.schema, params: submitted }),
    ).toMatchObject({
      issues: [],
      slice: {
        // In the order the form holds them: each control, then its rows.
        filter: [
          { field: "tags", operator: "isAny", operands: ["ex-gpu"] },
          { field: "tags", operator: "isAny", operands: ["ex-nvme"] },
          { field: "tags", operator: "isAny", operands: ["ex-ssd"] },
          { field: "cpu", operator: "gte", operands: [4] },
          { field: "cpu", operator: "gte", operands: [8] },
        ],
      },
    });
  });

  it("offers no link where there is no location to lead to", () => {
    const provider = createDataViewsProvider({
      collection,
      source: createManualSource<Row>({ capabilities }).source,
    });
    readProviderHost(provider).adopt(
      {
        slice: {
          ...EMPTY_SLICE,
          filter: [
            { field: "cpu", operator: "gte", operands: [4] },
            { field: "cpu", operator: "gte", operands: [8] },
          ],
        },
        window: DEFAULT_WINDOW,
      },
      "adopt",
      null,
    );
    const html = renderToString(tree(provider));
    expect(html).toContain("Cores from 8");
    expect(html).not.toContain("Clear Cores from 8");
    // Still carried through a submission.
    expect(html).toContain('type="hidden" name="cpu__gte__1" value="8"');
  });

  it("hands a focused Clear link's focus to its button once scripts take over", async () => {
    const provider = follow(LINK);
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree(provider));
    document.body.append(container);
    onTestFinished(() => {
      container.remove();
    });
    const link = container.querySelector<HTMLAnchorElement>(
      ".data-views-filters-further-conjuncts a.clear",
    );
    link?.focus();
    expect(link).toHaveFocus();
    await act(async () => {
      const root = hydrateRoot(container, tree(provider));
      onTestFinished(() => {
        act(() => {
          root.unmount();
        });
      });
    });
    expect(
      screen.getByRole("button", { name: "Clear Tags is any of ex-nvme" }),
    ).toHaveFocus();
  });
  it("passes native props to its row, keeping its own class first", () => {
    const provider = follow(LINK);
    render(
      <DataViews provider={provider}>
        <ul>
          <FurtherConjunct
            field="cpu"
            operator="gte"
            nth={1}
            ordinal={1}
            operands={[8]}
            phrase="Cores from"
            host={readProviderHost(provider)}
            onLeave={() => {}}
            className="extra"
            data-testid="row"
          />
        </ul>
      </DataViews>,
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("LI");
    expect(row.className).toBe("ds data-views-filters-further-conjunct extra");
  });
});
