import {
  createMemoryLocation,
  type DataViewsState,
} from "@canonical/dataviews-core";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMachineProvider } from "../../../../../../testing/index.js";
import { useDataViewsRoot } from "../../hooks/index.js";
import DataViews from "../../Provider.js";
import HiddenQueryFields from "./HiddenQueryFields.js";

/** The applied query less its search, from the first page. */
const leadToSearch = ({ slice, window }: DataViewsState<object>) => ({
  slice: { ...slice, search: null },
  window: { ...window, page: 1, cursor: null },
});

const OMIT = ["q"] as const;

/** Every hidden control of the form, as name and value. */
const listHidden = (): readonly (readonly [string, string])[] =>
  Array.from(
    screen
      .getByRole("form", { name: "Search" })
      .querySelectorAll<HTMLInputElement>("input[type=hidden]"),
    (input) => [input.name, input.value] as const,
  );

/** The hidden fields over the root's provider, in a search form. */
const SearchForm = () => {
  const { provider } = useDataViewsRoot("HiddenQueryFields test");
  return (
    <form aria-label="Search" method="get">
      <HiddenQueryFields
        provider={provider}
        readDestination={leadToSearch}
        omit={OMIT}
      />
    </form>
  );
};

/** The search form in a root over the given provider. */
const mountFields = (
  provider: ReturnType<typeof createMachineProvider>["provider"],
) =>
  render(
    <DataViews provider={provider}>
      <SearchForm />
    </DataViews>,
  );

describe("HiddenQueryFields", () => {
  it("carries nothing without a location", () => {
    const { provider } = createMachineProvider({ rows: [] });
    mountFields(provider);
    expect(listHidden()).toEqual([]);
  });

  it("carries the destination's parameters, less those omitted", () => {
    const location = createMemoryLocation({
      href: "/machines?tab=overview&q=alder",
    });
    const { provider } = createMachineProvider({ rows: [], location });
    mountFields(provider);
    const hidden = listHidden();
    expect(hidden).toContainEqual(["tab", "overview"]);
    expect(hidden.map(([name]) => name)).not.toContain("q");
  });

  it("follows the destination as it moves", () => {
    const location = createMemoryLocation({ href: "/machines?tab=overview" });
    const { provider } = createMachineProvider({ rows: [], location });
    mountFields(provider);
    act(() => {
      location.write(new URLSearchParams("tab=details"));
    });
    expect(listHidden()).toContainEqual(["tab", "details"]);
    expect(listHidden()).not.toContainEqual(["tab", "overview"]);
  });
});
