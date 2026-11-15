/**
 * The further conjuncts under a filter control: nothing while its address
 * holds one conjunct, a row for each beyond it otherwise, numbered for a
 * submission from 1, and how each operator's row reads.
 */
import {
  createCollection,
  createDataViewsProvider,
  createMemoryLocation,
  declareCapabilities,
  type FurtherConjunct,
  type PredicateOperator,
} from "@canonical/dataviews-core";
import { readProviderHost } from "@canonical/dataviews-core/bindings";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFakeChannel from "../../../../../../../../testing/createFakeChannel.js";
import createManualSource from "../../../../../../../../testing/createManualSource.js";
import expectNoAxeViolations from "../../../../../../../../testing/expectNoAxeViolations.js";
import { COUNTED_EXACTLY } from "../../../../../../../../testing/fixtures.js";
import DataViews from "../../../../Provider.js";
import Filters from "../../Filters.js";
import FurtherConjuncts from "./FurtherConjuncts.js";

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
    { field: "owner", kind: "presence" },
  ],
});

const capabilities = declareCapabilities(collection, {
  filter: { tags: true, cpu: true, owner: true },
  counts: COUNTED_EXACTLY,
});

/** A provider on a followed link. */
const follow = (href: string) =>
  createDataViewsProvider({
    collection,
    source: createManualSource<Row>({ capabilities }).source,
    location: createMemoryLocation({ href }),
  });

const mount = (href: string) => {
  const provider = follow(href);
  const view = render(
    <DataViews provider={provider}>
      <Filters labels={{ tags: "Tags", cpu: "Cores" }} />
    </DataViews>,
  );
  const release = provider.observe();
  return { provider, view, release };
};

/** A handle whose further conjuncts are the ones given. */
const standing = (others: readonly FurtherConjunct[]) => ({
  others: createFakeChannel(others),
});

describe("FurtherConjuncts", () => {
  it("draws nothing while the address holds one conjunct", () => {
    const { view, release } = mount("/machines?tags=ex-gpu&cpu__gte=4");
    expect(
      view.container.querySelector(".data-views-filters-further-conjuncts"),
    ).toBeNull();
    release();
  });

  it("draws a row for each further conjunct, in canonical order, after its control", async () => {
    const { view, release } = mount(
      "/machines?tags__isAny__2=ex-ssd&tags=ex-gpu&tags__isAny__1=ex-nvme&cpu__gte=8&cpu__gte__1=4",
    );
    const lists = [
      ...view.container.querySelectorAll(
        ".ds.data-views-filters-further-conjuncts",
      ),
    ];
    expect(
      lists.map((list) =>
        within(list as HTMLElement)
          .getAllByRole("listitem")
          .map((item) => item.firstChild?.textContent),
      ),
    ).toEqual([
      ["Tags is any of ex-nvme", "Tags is any of ex-ssd"],
      ["Cores from 8"],
    ]);
    // Each after the control it belongs to, the control still on its own.
    expect(lists.at(0)?.previousElementSibling).toHaveClass(
      "data-views-filters-choices",
    );
    expect(
      [
        ...view.container.querySelectorAll(
          'input[type="hidden"][name^="tags"]',
        ),
      ].map((input) => [
        input.getAttribute("name"),
        input.getAttribute("value"),
      ]),
    ).toEqual([
      ["tags__isAny__1", "ex-nvme"],
      ["tags__isAny__2", "ex-ssd"],
    ]);
    expect(screen.getByRole("checkbox", { name: "ex-gpu" })).toBeChecked();
    await expectNoAxeViolations(view.container);
    release();
  });

  it("reads each row as the control above it reads", () => {
    const provider = follow("/machines");
    const host = readProviderHost(provider);
    const rows = (
      operator: PredicateOperator,
      operands: readonly (string | number | boolean)[],
    ) => {
      const { container, unmount } = render(
        <DataViews provider={provider}>
          <FurtherConjuncts
            handle={standing([{ nth: 1, operands }])}
            field="cpu"
            operator={operator}
            label="Cores"
            host={host}
            onLeave={() => {}}
          />
        </DataViews>,
      );
      const text = container.querySelector(".conjunct")?.textContent;
      unmount();
      return text;
    };
    expect(rows("isNone", ["ex-gpu"])).toBe("Cores is none of ex-gpu");
    expect(rows("lte", [8])).toBe("Cores to 8");
    expect(rows("contains", ["ex"])).toBe("Cores contains ex");
    expect(rows("notContains", ["ex"])).toBe("Cores does not contain ex");
    expect(rows("startsWith", ["ex"])).toBe("Cores starts with ex");
    expect(rows("endsWith", ["ex"])).toBe("Cores ends with ex");
    expect(rows("is", ["ex"])).toBe("Cores is ex");
    expect(rows("isNot", ["ex"])).toBe("Cores is not ex");
    // Presence reads as the field and the value a link spells it with.
    expect(rows("isSet", [true])).toBe("Cores true");
  });
  it("passes native props to its list, keeping its own class first", () => {
    const provider = follow("/machines");
    const { container } = render(
      <DataViews provider={provider}>
        <FurtherConjuncts
          handle={standing([{ nth: 1, operands: [8] }])}
          field="cpu"
          operator="gte"
          label="Cores"
          host={readProviderHost(provider)}
          onLeave={() => {}}
          className="extra"
          data-testid="further"
        />
      </DataViews>,
    );
    const list = screen.getByTestId("further");
    expect(list.tagName).toBe("UL");
    expect(list.className).toBe(
      "ds data-views-filters-further-conjuncts extra",
    );
    expect(container.querySelector("li")?.className).toBe(
      "ds data-views-filters-further-conjunct",
    );
  });
});
