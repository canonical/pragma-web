import { createEnvironment } from "@canonical/prism-core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createMetroFetch from "../../../testing/createMetroFetch.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATION_COUNT,
  STATIONS_BINDING,
} from "../../../testing/fixtures.js";
import { MESSAGES } from "../i18n/constants.js";

/** The layout the stations lens's site wrapper mounts. */
const STATIONS_LAYOUT = {
  binding: STATIONS_BINDING,
  label: "Stations",
  rail: <nav aria-label="Site rail" />,
} as const;

/** The strip socket named `slot`. */
const readSocket = (slot: string): HTMLElement =>
  document.querySelector(`[data-slot="${slot}"]`) as HTMLElement;

describe("EntityLayout", () => {
  it("renders the site's rail and colophon around the routed page", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment } = await createWarmEnvironment("/stations");
    render(
      createEntitySite({
        url: "/stations",
        environment,
        layout: {
          ...STATIONS_LAYOUT,
          colophon: <footer>Colophon</footer>,
          className: "site-layout",
        },
      }),
    );

    expect(screen.getByRole("navigation", { name: "Site rail" })).toBeVisible();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Colophon");
    expect(
      screen.getByRole("heading", { level: 1, name: "Stations" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".ds.entity-layout")?.className).toBe(
      "ds entity-layout site-layout",
    );
  });

  it("trails the lens on the index, and the lens then the address on an entity", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const index = await createWarmEnvironment("/stations");
    const { unmount } = render(
      createEntitySite({
        url: "/stations",
        environment: index.environment,
        layout: STATIONS_LAYOUT,
      }),
    );
    // One crumb, the lens itself, as text: the index is the current page.
    expect(within(readSocket("context")).getAllByRole("listitem")).toHaveLength(
      1,
    );
    expect(within(readSocket("context")).getByText("Stations")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(readSocket("context")).queryByRole("link")).toBeNull();
    unmount();

    const url = "/stations/metro%3Anorthgate";
    const entity = await createWarmEnvironment(url);
    render(
      createEntitySite({
        url,
        environment: entity.environment,
        layout: STATIONS_LAYOUT,
      }),
    );
    // The lens crumb links back to the index; the address is the current
    // page, as the URL carries it.
    expect(within(readSocket("context")).getAllByRole("listitem")).toHaveLength(
      2,
    );
    expect(
      within(readSocket("context")).getByRole("link", { name: "Stations" }),
    ).toHaveAttribute("href", "/stations");
    expect(
      within(readSocket("context")).getByText("metro:northgate"),
    ).toHaveAttribute("aria-current", "page");
  });

  it("claims the controls and the status on the index only", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const index = await createWarmEnvironment("/stations");
    const { unmount } = render(
      createEntitySite({
        url: "/stations",
        environment: index.environment,
        layout: STATIONS_LAYOUT,
      }),
    );
    expect(
      within(readSocket("controls")).getByRole("searchbox", {
        name: MESSAGES["controls.search.label"],
      }),
    ).toBeInTheDocument();
    expect(readSocket("status")).toHaveTextContent(
      `${STATION_COUNT} of ${STATION_COUNT} entries`,
    );
    unmount();

    const url = "/stations/metro%3Anorthgate";
    const entity = await createWarmEnvironment(url);
    render(
      createEntitySite({
        url,
        environment: entity.environment,
        layout: STATIONS_LAYOUT,
      }),
    );
    expect(readSocket("controls")).toBeEmptyDOMElement();
    expect(readSocket("status")).toBeEmptyDOMElement();
  });

  it("narrows the canvas and the status together as the reader types", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment } = await createWarmEnvironment("/stations");
    render(
      createEntitySite({
        url: "/stations",
        environment,
        layout: STATIONS_LAYOUT,
      }),
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "north" },
    });
    expect(
      within(screen.getByRole("main")).getAllByRole("listitem"),
    ).toHaveLength(1);
    expect(readSocket("status")).toHaveTextContent(
      `1 of ${STATION_COUNT} entries`,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "no such station" },
    });
    expect(screen.getByText(MESSAGES["index.noMatch"])).toBeInTheDocument();
    expect(readSocket("status")).toHaveTextContent(
      `0 of ${STATION_COUNT} entries`,
    );
  });

  it("switches the canvas between rows and cards", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment } = await createWarmEnvironment("/stations");
    render(
      createEntitySite({
        url: "/stations",
        environment,
        layout: STATIONS_LAYOUT,
      }),
    );
    const rows = screen.getByRole("button", {
      name: MESSAGES["controls.view.rows"],
    });
    const cards = screen.getByRole("button", {
      name: MESSAGES["controls.view.cards"],
    });
    expect(rows).toHaveAttribute("aria-pressed", "true");
    expect(cards).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(cards);
    expect(cards).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("article")).toHaveLength(STATION_COUNT);

    fireEvent.click(rows);
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(
      within(screen.getByRole("main")).getAllByRole("listitem"),
    ).toHaveLength(STATION_COUNT);
  });

  it("counts nothing for a class the graph does not know", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    render(
      createEntitySite({
        url: "/stations",
        environment: createEnvironment({ fetchFn: createMetroFetch() }),
        layout: {
          ...STATIONS_LAYOUT,
          binding: { ...STATIONS_BINDING, classUri: "metro:Nowhere" },
        },
        children: null,
      }),
    );
    expect(await screen.findByText("0 of 0 entries")).toBeInTheDocument();
  });

  it("empties the status over a cold store and keeps the rail and canvas", () => {
    render(
      createEntitySite({
        url: "/stations",
        environment: createEnvironment({ fetchFn: createFetchSpy() }),
        layout: STATIONS_LAYOUT,
      }),
    );

    expect(screen.getByRole("navigation", { name: "Site rail" })).toBeVisible();
    expect(screen.getByRole("main")).toHaveTextContent(
      MESSAGES["index.loading"],
    );
    expect(readSocket("status")).toBeEmptyDOMElement();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });
});
