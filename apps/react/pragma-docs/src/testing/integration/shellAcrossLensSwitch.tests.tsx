/**
 * The shell stays mounted across navigation; a lens switch remounts the lens
 * layout.
 *
 * Each lens renders inside its own layout, so a lens switch replaces the
 * whole layout (rail, strip, canvas and any provider the layout holds) while
 * `Shell`, the provider nest above it, stays put. This suite drives that
 * through the real app with no module mocked: the real route table, a
 * browser router, the Relay environment `Shell` provides, and clicks on the
 * real rail.
 *
 * The nest's providers (`HeadProvider`, `RelayEnvironmentProvider`,
 * `RouterProvider`) hold no state of their own: each provides a context
 * value read from its props. Whether the nest stays mounted is therefore
 * observable only through the state that lives below it, and that is what
 * this suite reads:
 *
 * - THE SHELL STAYS. Moving between two terms of the Definitions lens keeps
 *   the matched route, so the layout's root node and its filter chips (state
 *   the layout's `LensFilterProvider` owns) survive, which they can only do
 *   if nothing above the layout remounted. The store the environment holds
 *   serves every page (the network is never called), and the head carries
 *   exactly one `<title>`.
 * - THE LAYOUT REMOUNTS. Switching to Standards and back yields a new
 *   Definitions root, with the chips back at their default.
 */

import "../../domains/lenses/definitions/__fixtures__/stubReactFlowGlobals.js";
import {
  createBrowserAdapter,
  createRouter,
  type Router,
} from "@canonical/router-core";
import { fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Shell } from "#lib/Shell";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import mergeRecordMaps from "../../../testing/mergeRecordMaps.js";
import definitionsExplorerRecords from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecords.js";
import definitionsExplorerRecordsComponent from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecordsComponent.js";
import definitionsExplorerRecordsProperty from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecordsProperty.js";
import standardsIndexRecords from "../../domains/lenses/standards/__fixtures__/standardsIndexRecords.js";
import { appRoutes, middleware, notFoundRoute } from "../../routes.js";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** The status figure's caption: how many classes the chips leave visible. */
const readStatus = (container: HTMLElement): string | undefined =>
  container.querySelector('[data-slot="explorer-status"] figcaption')
    ?.textContent ?? undefined;

/** The strip trail's current crumb: the page the strip says you are on. */
const readCurrentCrumb = (container: HTMLElement): string | undefined =>
  container.querySelector('[data-slot="context"] [aria-current="page"]')
    ?.textContent ?? undefined;

/** How many of the strip's filter chips are turned off. */
const countChipsOff = (container: HTMLElement): number =>
  container.querySelectorAll(
    '[data-slot="controls"] button[aria-pressed="false"]',
  ).length;

/** Click the rail's entry for `href`, through the real router. */
const clickRail = async (container: HTMLElement, href: string) => {
  const link = container.querySelector<HTMLAnchorElement>(
    `nav[data-region="primary-nav"] .rail-lenses a[href="${href}"]`,
  );
  expect(link, `the rail links ${href}`).not.toBeNull();
  await act(async () => {
    link?.click();
  });
};

describe("Shell across a lens switch", () => {
  const roots: Root[] = [];
  const containers: HTMLElement[] = [];
  let globalFetch: ReturnType<typeof createFetchSpy>;

  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      (query: string): MediaQueryList =>
        ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );
    globalFetch = createFetchSpy();
    vi.stubGlobal("fetch", globalFetch);
  });

  afterEach(async () => {
    for (const root of roots.splice(0)) {
      await act(async () => {
        root.unmount();
      });
    }
    for (const container of containers.splice(0)) {
      container.remove();
    }
    setPrefetchEnvironment(undefined);
    window.history.pushState({}, "", "/");
    vi.unstubAllGlobals();
  });

  it("keeps the state below the shell across navigation and remounts the lens layout on a switch", async () => {
    // One store warm for every page the test visits, behind a network that
    // never answers: any fetch at all means the store did not survive.
    const relayFetch = createFetchSpy();
    const environment = createEnvironment({
      records: mergeRecordMaps(
        definitionsExplorerRecords,
        definitionsExplorerRecordsComponent,
        definitionsExplorerRecordsProperty,
        standardsIndexRecords,
      ),
      fetchFn: relayFetch,
    });
    setPrefetchEnvironment(environment);
    window.history.pushState({}, "", "/definitions/ds%3AComponent");
    const router: Router<typeof appRoutes, typeof notFoundRoute> = createRouter(
      appRoutes,
      {
        adapter: createBrowserAdapter(),
        middleware: [...middleware],
        notFound: notFoundRoute,
      },
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    containers.push(container);
    const root = createRoot(container);
    roots.push(root);
    await act(async () => {
      root.render(<Shell environment={environment} router={router} />);
    });

    // A Definitions term, unfiltered: every class is visible.
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    const definitionsLayout = container.querySelector(".ds.definitions-layout");
    expect(definitionsLayout).not.toBeNull();

    // Turn one ontology off through the strip's chips: the figure recounts.
    const chip = container.querySelector<HTMLButtonElement>(
      '[data-slot="controls"] button[aria-pressed="true"]',
    );
    expect(chip).not.toBeNull();
    await act(async () => {
      if (chip !== null) fireEvent.click(chip);
    });
    expect(countChipsOff(container)).toBe(1);
    const filteredStatus = readStatus(container);
    expect(filteredStatus).not.toContain("60 of 60");

    // Another term of the same lens: the same layout node, and the chip
    // stays off, so nothing above the layout remounted.
    await act(async () => {
      router.navigate("definitionsTerm", {
        params: { term: "ds:hasSubcomponent" },
      });
    });
    await waitFor(() =>
      expect(window.location.pathname).toBe(
        "/definitions/ds%3AhasSubcomponent",
      ),
    );
    expect(container.querySelector(".ds.definitions-layout")).toBe(
      definitionsLayout,
    );
    expect(countChipsOff(container)).toBe(1);
    expect(readStatus(container)).toBe(filteredStatus);

    // Switch to Standards: a different layout element, with its own strip.
    await clickRail(container, "/standards");
    await waitFor(() => expect(readCurrentCrumb(container)).toBe("Standards"));
    expect(container.querySelector(".ds.standards-layout")).not.toBeNull();
    expect(container.querySelector(".ds.definitions-layout")).toBeNull();

    // And back: the chips start over, because the layout and its filter
    // provider were mounted afresh.
    await clickRail(container, "/definitions");
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    const definitionsLayoutAgain = container.querySelector(
      ".ds.definitions-layout",
    );
    expect(definitionsLayoutAgain).not.toBeNull();
    expect(definitionsLayoutAgain).not.toBe(definitionsLayout);
    expect(countChipsOff(container)).toBe(0);

    // The store served every page, and the head carries one title.
    expect(relayFetch).not.toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
  });
});
