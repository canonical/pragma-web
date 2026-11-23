/**
 * The pagination bar: destinations the collection can actually reach, and
 * counts that describe the rows on screen. It takes its provider explicitly,
 * so every case here mounts it with no DataViews root at all, and observes
 * it itself: the source's first request exists once the bar has rendered,
 * and each case answers it by hand.
 */

import {
  type Count,
  createMemoryLocation,
  DEFAULT_WINDOW,
  declareCapabilities,
} from "@canonical/dataviews-core";
import type { ManualSource } from "@canonical/dataviews-core/testing";
import type { LinkComponentProps } from "@canonical/react-ds-global";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement, StrictMode } from "react";
import { describe, expect, it } from "vitest";
import buildMachine from "../../../../testing/buildMachine.js";
import createMachineProvider from "../../../../testing/createMachineProvider.js";
import { machines as collection } from "../../../../testing/machines.js";
import type {
  Machine,
  MachineFields,
  MachineFixture,
  MachineProvider as Provider,
} from "../../../../testing/types.js";
import { DataViews } from "../DataViews/index.js";
import PaginationBar from "./PaginationBar.js";
import type { PaginationBarProps } from "./types.js";

/** The default window on one page of one size, as every case reads it. */
const buildWindow = (page: number, size: number) => ({
  ...DEFAULT_WINDOW,
  page,
  size,
});

/** A provider started on `window`, over a source each case answers by hand. */
const makeProvider = (window = buildWindow(1, 2)): MachineFixture =>
  createMachineProvider({
    snapshot: {
      query: new URLSearchParams({
        page: String(window.page),
        size: String(window.size),
      }).toString(),
      presentation: {},
    },
  });

const buildMachines = (count: number): readonly Machine[] =>
  Array.from({ length: count }, (_unused, index) =>
    buildMachine(`m${index}`, `m${index}`),
  );

/**
 * Answer the request the provider currently wants: `count` rows the window
 * pages over, counted exactly, or null for a source that counts nothing.
 * `more` is the source's own word on a further page.
 */
const load = (
  source: ManualSource<Machine>,
  rows: readonly Machine[],
  count: number | Count | null,
  more: boolean | null = null,
): void => {
  const counted: Count =
    count === null
      ? { kind: "unknown" }
      : typeof count === "number"
        ? { kind: "exact", value: count }
        : count;
  act(() => {
    source.readLatest().deliver({
      status: "succeeded",
      page: {
        rows,
        groups: null,
        facets: {},
        counts: { pageable: counted, matched: counted },
        more,
        cursors: null,
      },
    });
  });
};

const mount = (
  provider: Provider,
  props: Omit<PaginationBarProps<MachineFields, Machine>, "provider"> = {},
) => render(<PaginationBar {...props} provider={provider} />);

const getSummary = () => screen.getByRole("status");
const getPageSelect = () => screen.getByRole("combobox", { name: "Page" });
const getSizeSelect = () => screen.getByLabelText("Rows per page");
const getButton = (name: string) => screen.getByRole("button", { name });
const getFirst = () => getButton("First page");
const getPrevious = () => getButton("Previous page");
const getNext = () => getButton("Next page");
const getLast = () => getButton("Last page");
const listValues = (select: HTMLElement) =>
  [...select.querySelectorAll("option")].map((option) => option.value);
const readWindow = (provider: Provider) => provider.state.get().window;

describe("PaginationBar", () => {
  it("refuses anything but a provider", () => {
    // A structural copy of a provider is not one: the check is by identity.
    const counterfeit = { ...createMachineProvider().provider };
    expect(() => render(<PaginationBar provider={counterfeit} />)).toThrow(
      "PaginationBar requires a provider created by createDataViewsProvider",
    );
    expect(() =>
      // @ts-expect-error the provider is the one input the bar cannot derive
      render(<PaginationBar />),
    ).toThrow(
      "PaginationBar requires a provider created by createDataViewsProvider",
    );
  });

  it("marks its root once the page has hydrated", () => {
    const { provider } = makeProvider();
    mount(provider);
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toHaveAttribute("data-hydrated");
  });

  it("observes its provider for as long as it is mounted", () => {
    const { provider, source } = makeProvider();
    // Construction subscribes to nothing and requests nothing: the first
    // request is the bar's.
    expect(source.calls).toHaveLength(0);
    const { unmount } = mount(provider);
    expect(source.calls).toHaveLength(1);
    expect(source.callAt(0).releases).toBe(0);
    unmount();
    // The last observer gone, the live execution is released.
    expect(source.calls).toHaveLength(1);
    expect(source.callAt(0).releases).toBe(1);
  });

  it("pages its own provider, whatever root it sits in", () => {
    const outer = makeProvider();
    const own = makeProvider();
    render(
      <DataViews provider={outer.provider}>
        <PaginationBar provider={own.provider} />
      </DataViews>,
    );
    load(own.source, buildMachines(2), 6);
    fireEvent.click(getNext());
    expect(readWindow(own.provider)).toEqual(buildWindow(2, 2));
    expect(readWindow(outer.provider)).toEqual(buildWindow(1, 2));
  });

  it("is a navigation named by its label, in the drawn order", () => {
    mount(makeProvider().provider, { label: "Machines pagination" });
    const nav = screen.getByRole("navigation", { name: "Machines pagination" });
    // Page size first, then the summary; the page select, then the buttons.
    // The submit controls are the baseline's, beside the select they submit.
    expect([...nav.querySelectorAll("select, [role=status], button")]).toEqual([
      getSizeSelect(),
      getButton("Apply page size"),
      getSummary(),
      getPageSelect(),
      getButton("Go to page"),
      getFirst(),
      getPrevious(),
      getNext(),
      getLast(),
    ]);
  });

  it("is named Pagination by default", () => {
    mount(makeProvider().provider);
    expect(
      screen.getByRole("navigation", { name: "Pagination" }),
    ).toBeInTheDocument();
  });

  it("claims nothing before the first results arrive", () => {
    mount(makeProvider().provider);
    expect(getSummary()).toBeEmptyDOMElement();
    expect(listValues(getPageSelect())).toEqual(["1"]);
    expect(getPageSelect()).not.toHaveAttribute("aria-describedby");
    for (const control of [getFirst(), getPrevious(), getNext(), getLast()]) {
      expect(control).toBeDisabled();
    }
  });

  it("summarises the rows on screen out of the filtered total", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 5);
    expect(getSummary()).toHaveTextContent(/^Showing 1–2 out of 5 rows$/);
    expect(listValues(getPageSelect())).toEqual(["1", "2", "3"]);
    // The total describes the select it sits beside.
    const total = screen.getByText("of 3 pages");
    expect(getPageSelect()).toHaveAttribute("aria-describedby", total.id);
    expect(getFirst()).toBeDisabled();
    expect(getPrevious()).toBeDisabled();
    expect(getNext()).toBeEnabled();
    expect(getLast()).toBeEnabled();
  });

  it("counts one item and one page in the singular", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(1), 1);
    expect(getSummary()).toHaveTextContent(/^Showing row 1 out of 1$/);
    expect(screen.getByText("of 1 page")).toBeInTheDocument();
  });

  it("offers no last page when the source publishes no count", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), null);
    expect(getSummary()).toHaveTextContent(/^Showing 1–2 rows$/);
    expect(screen.queryByText(/^of /)).toBeNull();
    expect(getLast()).toBeDisabled();
    // A full page is evidence there may be another; a short one is not.
    expect(getNext()).toBeEnabled();
    fireEvent.click(getNext());
    load(source, buildMachines(1), null);
    expect(getNext()).toBeDisabled();
    expect(getSummary()).toHaveTextContent(/^Showing row 3$/);
    // Every page before this one is reachable from the select.
    expect(listValues(getPageSelect())).toEqual(["1", "2"]);
    expect(getPageSelect()).toHaveValue("2");
  });

  it("takes the page's own word on a further page over its own guess", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    // A full page the source says is the last one.
    load(source, buildMachines(2), null, false);
    expect(getNext()).toBeDisabled();
    act(() => {
      provider.refresh();
    });
    // A short page the source says has another behind it.
    load(source, buildMachines(1), null, true);
    expect(getNext()).toBeEnabled();
  });

  it("goes to the first and last pages a count declares", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 6);
    fireEvent.click(getLast());
    expect(readWindow(provider)).toEqual(buildWindow(3, 2));
    load(source, buildMachines(2), 6);
    expect(getNext()).toBeDisabled();
    expect(getLast()).toBeDisabled();
    fireEvent.click(getFirst());
    expect(readWindow(provider)).toEqual(buildWindow(1, 2));
  });

  it("steps one page from wherever it is", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 6);
    fireEvent.click(getNext());
    load(source, buildMachines(2), 6);
    expect(getPageSelect()).toHaveValue("2");
    fireEvent.click(getPrevious());
    expect(readWindow(provider)).toEqual(buildWindow(1, 2));
    load(source, buildMachines(2), 6);
    fireEvent.click(getNext());
    expect(readWindow(provider)).toEqual(buildWindow(2, 2));
  });

  it("jumps to the page the select names", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 6);
    fireEvent.change(getPageSelect(), { target: { value: "3" } });
    expect(readWindow(provider)).toEqual(buildWindow(3, 2));
  });

  it("steps back from past the last page to the last one there is", () => {
    const { provider, source } = makeProvider(buildWindow(9, 2));
    mount(provider);
    load(source, [], 4);
    // The select still says where the window is, after the pages there are.
    expect(getPageSelect()).toHaveValue("9");
    expect(listValues(getPageSelect())).toEqual(["1", "2", "9"]);
    fireEvent.click(getPrevious());
    expect(readWindow(provider)).toEqual(buildWindow(2, 2));
  });

  it("steps back one page from the last", () => {
    const { provider, source } = makeProvider(buildWindow(3, 2));
    mount(provider);
    load(source, buildMachines(2), 6);
    fireEvent.click(getPrevious());
    expect(readWindow(provider)).toEqual(buildWindow(2, 2));
  });

  it("goes to the last page from past it", () => {
    const { provider, source } = makeProvider(buildWindow(9, 2));
    mount(provider);
    load(source, [], 4);
    expect(getLast()).toBeEnabled();
    fireEvent.click(getLast());
    expect(readWindow(provider)).toEqual(buildWindow(2, 2));
  });

  it("keeps one page when the collection is empty", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, [], 0);
    expect(getSummary()).toHaveTextContent(/^Showing 0 out of 0 rows$/);
    expect(screen.getByText("of 1 page")).toBeInTheDocument();
    expect(getNext()).toBeDisabled();
  });

  it("summarises nothing while a replacement page is in flight", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 5);
    act(() => {
      provider.navigateWindow({ page: 2 });
    });
    // The rows still on screen are an earlier page's, so they are not
    // summarised as this one's; the count is this query's all the same, so
    // the pages it makes are still listed and still reachable.
    expect(getSummary()).toBeEmptyDOMElement();
    expect(screen.getByText(/^of /)).toHaveTextContent("of 3 pages");
    expect(getNext()).toBeEnabled();
    load(source, buildMachines(2), 5);
    expect(getSummary()).toHaveTextContent(/^Showing 3–4 out of 5 rows$/);
    expect(getNext()).toBeEnabled();
  });

  it("says a lower bound as one, and names no last page from it", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), { kind: "at-least", value: 7 });
    expect(getSummary()).toHaveTextContent(
      /^Showing 1–2 out of at least 7 rows$/,
    );
    expect(screen.queryByText(/^of /)).toBeNull();
    expect(getLast()).toBeDisabled();
    // Seven at least, two to a page: a second page is proven.
    expect(getNext()).toBeEnabled();
    fireEvent.click(getNext());
    // One row, and a bound the rows already exceed: said as the source
    // said it, and Next now rests on the page's own word, which is none.
    load(source, buildMachines(1), { kind: "at-least", value: 1 });
    expect(getSummary()).toHaveTextContent(/^Showing row 3 out of at least 1$/);
    expect(getNext()).toBeDisabled();
  });

  it("claims no total while a replacement query is in flight", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 5);
    act(() => {
      provider.setSearch("alpha");
    });
    // The previous query's total does not describe the pending one, and the
    // rows still on screen are not the ones Next would page past.
    expect(getSummary()).toBeEmptyDOMElement();
    expect(screen.queryByText(/^of /)).toBeNull();
    expect(getNext()).toBeDisabled();
    load(source, buildMachines(2), 3);
    expect(getSummary()).toHaveTextContent(/^Showing 1–2 out of 3 rows$/);
    expect(getNext()).toBeEnabled();
  });

  it("announces the rows a new page brings", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 5);
    fireEvent.click(getNext());
    load(source, buildMachines(2), 5);
    // The same count on another page: the range is what changes.
    expect(getSummary()).toHaveTextContent(/^Showing 3–4 out of 5 rows$/);
    fireEvent.click(getLast());
    load(source, buildMachines(1), 5);
    expect(getSummary()).toHaveTextContent(/^Showing row 5 out of 5$/);
  });

  it("lists the pages the core counts, through a page move and not past a new query", () => {
    // Which pages exist is the core's decision; the bar renders the list it
    // is handed and keeps it while a page of the same query loads.
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 6);
    fireEvent.change(getPageSelect(), { target: { value: "2" } });
    expect(screen.getByText(/^of /)).toHaveTextContent("of 3 pages");
    expect(listValues(getPageSelect())).toEqual(["1", "2", "3"]);
    load(source, buildMachines(2), 6);
    act(() => {
      provider.setSearch("m1");
    });
    expect(listValues(getPageSelect())).toEqual(["1"]);
    expect(screen.queryByText(/^of /)).toBeNull();
  });

  it("claims no total beside an earlier query's rows after the current one failed", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 5);
    act(() => {
      provider.setSearch("m1");
    });
    act(() => {
      source.readLatest().deliver({
        status: "failed",
        failure: { reason: "offline", cause: null, transient: null },
      });
    });
    expect(getSummary()).toBeEmptyDOMElement();
    expect(getNext()).toBeDisabled();
    expect(getLast()).toBeDisabled();
  });

  it("resets to the first page when the page size changes", () => {
    const { provider, source } = makeProvider();
    mount(provider, { sizes: [2, 25] });
    load(source, buildMachines(2), 40);
    fireEvent.click(getNext());
    load(source, buildMachines(2), 40);
    fireEvent.change(getSizeSelect(), { target: { value: "25" } });
    // The old page number counted rows of a different size.
    expect(readWindow(provider)).toEqual(buildWindow(1, 25));
  });

  it("always offers the applied size, in order", () => {
    mount(makeProvider().provider);
    expect(listValues(getSizeSelect())).toEqual(["2", "50", "75", "100"]);
    expect(getSizeSelect()).toHaveValue("2");
  });

  it("offers each size once, and exactly the sizes given when one is applied", () => {
    mount(makeProvider(buildWindow(1, 25)).provider, { sizes: [50, 25, 50] });
    expect(listValues(getSizeSelect())).toEqual(["50", "25"]);
  });

  it("moves focus to the page select when the focused button becomes unavailable", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 4);
    getNext().focus();
    fireEvent.click(getNext());
    // Next waits for the page it asked for, so it cannot keep the focus.
    expect(getNext()).toBeDisabled();
    expect(getPageSelect()).toHaveFocus();
  });

  it("keeps focus on a button that stays available", () => {
    const { provider, source } = makeProvider(buildWindow(3, 2));
    mount(provider);
    load(source, buildMachines(2), 6);
    getPrevious().focus();
    fireEvent.click(getPrevious());
    load(source, buildMachines(2), 6);
    expect(getPrevious()).toBeEnabled();
    expect(getPrevious()).toHaveFocus();
  });

  it("leaves focus alone once it has left the buttons", () => {
    const { provider, source } = makeProvider();
    mount(provider);
    load(source, buildMachines(2), 4);
    getNext().focus();
    getNext().blur();
    act(() => {
      provider.navigateWindow({ page: 2 });
    });
    expect(getNext()).toBeDisabled();
    expect(getPageSelect()).not.toHaveFocus();
  });

  it("follows the window and pages under StrictMode", () => {
    const { provider, source } = makeProvider();
    render(
      <StrictMode>
        <PaginationBar provider={provider} />
      </StrictMode>,
    );
    // The rehearsal mount released its hold; the live execution is the
    // one the real mount started, for the same request.
    expect(source.callAt(0).releases).toBe(1);
    expect(source.readLatest().releases).toBe(0);
    load(source, buildMachines(2), 5);
    expect(getSummary()).toHaveTextContent(/^Showing 1–2 out of 5 rows$/);
    fireEvent.click(getNext());
    expect(readWindow(provider)).toEqual(buildWindow(2, 2));
    load(source, buildMachines(2), 5);
    expect(getPageSelect()).toHaveValue("2");
  });

  it("pages a cursor source by its tokens, and offers no jump", () => {
    // A forward cursor source reaches its next page only through the token
    // the current one handed back. It may still count its rows exactly; a
    // page total would nevertheless name pages nothing can address. Only
    // the source knows which pages its tokens reach, so it has to answer
    // for refusals itself; this one refuses nothing.
    const { provider, source } = createMachineProvider({
      snapshot: { query: "page=1&size=2", presentation: {} },
      capabilities: declareCapabilities(collection, {
        counts: { pageable: "exact" },
        pagination: { kind: "cursor", backward: false, durable: false },
      }),
      listRefusals: () => [],
    });
    mount(provider);
    act(() => {
      source.readLatest().deliver({
        status: "succeeded",
        page: {
          rows: buildMachines(2),
          groups: null,
          facets: {},
          counts: {
            pageable: { kind: "exact", value: 6 },
            matched: { kind: "unknown" },
          },
          more: null,
          cursors: { next: "c:m1", previous: null },
        },
      });
    });
    expect(getSummary()).toHaveTextContent(/^Showing 1–2 out of 6 rows$/);
    expect(screen.queryByText(/of \d+ pages?/)).toBe(null);
    expect(listValues(getPageSelect())).toEqual(["1"]);
    expect(getLast()).toBeDisabled();
    fireEvent.click(getNext());
    expect(readWindow(provider)).toEqual({
      ...buildWindow(2, 2),
      cursor: "c:m1",
    });
    // And the source is asked for the page the token names.
    expect(source.readLatest().request.window.cursor).toBe("c:m1");
  });

  it("hides the controls only the enhancement can drive until scripting is enabled", () => {
    // Without a location there is no destination a link could lead to, so
    // the page controls are buttons the enhancement alone drives, marked
    // for the stylesheet to hold back until it runs.
    mount(makeProvider().provider);
    for (const control of [getFirst(), getPrevious(), getNext(), getLast()]) {
      expect(control).toHaveClass("scripted");
    }
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("offers every reachable page as a real link the encoder spelled", () => {
    const location = createMemoryLocation({
      href: "/machines?tab=overview&status=failed&page=2&size=2",
    });
    const { provider, source } = createMachineProvider({ location });
    mount(provider);
    load(source, buildMachines(2), 6);
    const readHref = (name: string) =>
      screen.getByRole("link", { name }).getAttribute("href");
    // Each carries the whole query and the host's own parameter; only the
    // window moves.
    expect(readHref("First page")).toBe(
      "?tab=overview&status=failed&page=1&size=2",
    );
    expect(readHref("Previous page")).toBe(
      "?tab=overview&status=failed&page=1&size=2",
    );
    expect(readHref("Next page")).toBe(
      "?tab=overview&status=failed&page=3&size=2",
    );
    expect(readHref("Last page")).toBe(
      "?tab=overview&status=failed&page=3&size=2",
    );
    // A link is a link: nothing is marked for the enhancement alone.
    expect(screen.getByRole("link", { name: "Next page" })).not.toHaveClass(
      "scripted",
    );
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
  });

  it("follows the location's other parameters into its destinations", () => {
    const location = createMemoryLocation({
      href: "/machines?tab=overview&page=1&size=2",
    });
    const { provider, source } = createMachineProvider({ location });
    mount(provider);
    load(source, buildMachines(2), 6);
    const readHref = (name: string) =>
      screen.getByRole("link", { name }).getAttribute("href");
    expect(readHref("Next page")).toBe("?tab=overview&page=2&size=2");
    // The host moves its own parameter; the query stands, so no state is
    // published — the bar redraws on the location itself.
    act(() => {
      location.write(new URLSearchParams("tab=details&page=1&size=2"));
    });
    expect(readHref("Next page")).toBe("?tab=details&page=2&size=2");
  });

  it("intercepts a plain click on a link and pages in place, leaving other clicks to the browser", () => {
    const location = createMemoryLocation({ href: "/machines?page=1&size=2" });
    const { provider, source } = createMachineProvider({ location });
    mount(provider);
    load(source, buildMachines(2), 6);
    const link = screen.getByRole("link", { name: "Next page" });
    // A modified click, or another button, asks the browser for something
    // else — a new tab, a saved link: not intercepted.
    for (const other of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      expect(fireEvent.click(link, other)).toBe(true);
      expect(readWindow(provider).page).toBe(1);
    }
    // A plain click is the enhancement's: the window moves, the location
    // follows with a history entry, and the browser does not navigate.
    expect(fireEvent.click(link)).toBe(false);
    expect(readWindow(provider).page).toBe(2);
    expect(location.read().get("page")).toBe("2");
  });

  it("renders its links through the consumer's router link, which navigates itself", () => {
    // The shared link contract: href, className and children reach the
    // router's Link, which does the navigating; the provider then hears the
    // move through its location port, so nothing is intercepted here.
    const seen: string[] = [];
    const RouterLink = ({
      href,
      className,
      children,
    }: LinkComponentProps): ReactElement => (
      <a
        href={href}
        className={className}
        data-router-link=""
        onClick={(event) => {
          event.preventDefault();
          seen.push(href ?? "");
        }}
      >
        {children}
      </a>
    );
    const location = createMemoryLocation({ href: "/machines?page=1&size=2" });
    const { provider, source } = createMachineProvider({ location });
    mount(provider, { LinkComponent: RouterLink });
    load(source, buildMachines(2), 6);
    const next = screen.getByRole("link", { name: "Next page" });
    expect(next).toHaveAttribute("data-router-link");
    expect(next).toHaveAttribute("href", "?page=2&size=2");
    expect(next).toHaveClass("ds", "button", "tertiary", "next");
    fireEvent.click(next);
    // The router's link saw the click; the bar moved nothing itself.
    expect(seen).toEqual(["?page=2&size=2"]);
    expect(readWindow(provider).page).toBe(1);
  });

  it("disables the control to a page it cannot reach, named for where it would go", () => {
    const location = createMemoryLocation({ href: "/machines?page=1&size=2" });
    const { provider, source } = createMachineProvider({ location });
    mount(provider);
    load(source, buildMachines(2), 6);
    // From the first page there is no earlier one: a disabled button, not a
    // link to nowhere — and not one the enhancement alone drives, since a
    // destination exists.
    expect(getFirst()).toBeDisabled();
    expect(getFirst()).not.toHaveClass("scripted");
    expect(getPrevious()).toBeDisabled();
    expect(screen.queryByRole("link", { name: "First page" })).toBeNull();
    expect(screen.getByRole("link", { name: "Next page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Last page" })).toBeInTheDocument();
  });

  it("moves focus to the page select when the focused link becomes unreachable", () => {
    const location = createMemoryLocation({ href: "/machines?page=2&size=2" });
    const { provider, source } = createMachineProvider({ location });
    mount(provider);
    load(source, buildMachines(2), 6);
    const link = screen.getByRole("link", { name: "Previous page" });
    link.focus();
    expect(link).toHaveFocus();
    // The link was the way back to page one; there the way disappears, and
    // the disabled button that replaces it cannot hold focus.
    fireEvent.click(link);
    load(source, buildMachines(2), 6);
    expect(getPrevious()).toBeDisabled();
    expect(getPageSelect()).toHaveFocus();
  });

  it("puts the page size and the page in GET forms carrying the rest of the query", () => {
    const location = createMemoryLocation({
      href: "/machines?tab=overview&status=failed&page=2&size=2",
    });
    const { provider, source } = createMachineProvider({ location });
    const { container } = mount(provider);
    load(source, buildMachines(2), 6);
    const forms = container.querySelectorAll("form");
    expect(forms).toHaveLength(2);
    for (const form of forms) {
      expect(form).toHaveAttribute("method", "get");
    }
    const listHidden = (form: Element) =>
      [...form.querySelectorAll<HTMLInputElement>("input[type=hidden]")].map(
        (input) => [input.name, input.value],
      );
    // The size form supplies the size and leaves the page to its default:
    // a new size is a new window.
    const [sizeForm, pageForm] = forms;
    if (sizeForm === undefined || pageForm === undefined) {
      throw new Error("expected two forms");
    }
    expect(getSizeSelect()).toHaveAttribute("name", "size");
    expect(sizeForm.contains(getSizeSelect())).toBe(true);
    expect(listHidden(sizeForm)).toEqual([
      ["tab", "overview"],
      ["status", "failed"],
    ]);
    // The page form supplies the page and keeps the size.
    expect(getPageSelect()).toHaveAttribute("name", "page");
    expect(pageForm.contains(getPageSelect())).toBe(true);
    expect(listHidden(pageForm)).toEqual([
      ["tab", "overview"],
      ["status", "failed"],
      ["size", "2"],
    ]);
    // A submission the enhancement sees has nothing left to apply.
    expect(fireEvent.submit(pageForm)).toBe(false);
    expect(fireEvent.submit(sizeForm)).toBe(false);
    for (const name of ["Apply page size", "Go to page"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute(
        "type",
        "submit",
      );
    }
  });

  it("passes native nav props through and merges the class name", () => {
    mount(makeProvider().provider, {
      className: "footer",
      id: "machines-pages",
    });
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav).toHaveClass("ds", "data-table-pagination-bar", "footer");
    expect(nav).toHaveAttribute("id", "machines-pages");
  });

  it("speaks the words it is given, keeping English only where none are given", () => {
    const { provider, source } = makeProvider();
    mount(provider, {
      messages: {
        pagination: "Pages",
        rowsPerPage: "Lignes par page",
        page: "Feuille",
        pageCount: (pages) => `sur ${pages}`,
        rowsShown: (first, shown) => `${first} + ${shown}`,
        goToFirstPage: "Première",
        goToPreviousPage: "Précédente",
        goToNextPage: "Suivante",
        goToLastPage: "Dernière",
      },
    });
    load(source, buildMachines(2), 5);
    expect(
      screen.getByRole("navigation", { name: "Pages" }),
    ).toBeInTheDocument();
    // The size select is named by its label alone, with no colon read into it.
    expect(screen.getByLabelText("Lignes par page")).toHaveAttribute(
      "name",
      "size",
    );
    expect(screen.getByRole("combobox", { name: "Feuille" })).toHaveValue("1");
    expect(screen.getByText("sur 3")).toBeInTheDocument();
    expect(getSummary()).toHaveTextContent(/^1 \+ 2$/);
    for (const name of ["Première", "Précédente", "Suivante", "Dernière"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    // A message left out is still English.
    expect(getButton("Apply page size")).toHaveAttribute("type", "submit");
  });

  it("takes a label over the messages' name for the navigation", () => {
    mount(makeProvider().provider, {
      label: "Machine pages",
      messages: { pagination: "Pages" },
    });
    expect(
      screen.getByRole("navigation", { name: "Machine pages" }),
    ).toBeInTheDocument();
  });
});
