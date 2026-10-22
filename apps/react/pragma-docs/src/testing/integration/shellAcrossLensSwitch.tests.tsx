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
 * value read from its props. The one thing the nest owns is the `Outlet`'s
 * subscription to the router, which it holds for as long as it is mounted;
 * everything below the `Outlet` is keyed on the matched route and remounts
 * whenever that changes. This suite reads both:
 *
 * - THE SHELL STAYS. The router's own `subscribe` is wrapped to record
 *   which subscriptions are live. A change of route inside the lens (a term
 *   to the lens index) remounts the layout but not the nest, so the
 *   subscriptions that outlive it are the nest's own. Every one of them must
 *   still be live after a switch to Standards and back: a nest rebuilt per
 *   lens drops them. Moving between two terms (the same route, new params)
 *   keeps the layout's root node and its filter chips. The store the
 *   environment holds serves every page (the network is never called), and
 *   the head carries exactly one `<title>`.
 * - THE LAYOUT REMOUNTS. Each change of route yields a new Definitions root,
 *   with the chips back at their default.
 */

import "../../../testing/stubReactFlowGlobals.js";
import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import {
  createBrowserAdapter,
  createRouter,
  type Router,
} from "@canonical/router-core";
import { fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Shell } from "#lib/ui";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  definitionsExplorerRecords,
  definitionsExplorerRecordsComponent,
  definitionsExplorerRecordsProperty,
} from "../../../testing/definitionsRecords.js";
import mergeRecordMaps from "../../../testing/mergeRecordMaps.js";
import { standardsIndexRecords } from "../../../testing/standardsRecords.js";
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

/**
 * Record which of the router's subscriptions are live, by wrapping its own
 * `subscribe` so each subscription, numbered in the order it was made, is
 * tracked until it is dropped.
 *
 * @note Impure: replaces `router.subscribe` with a spy that delegates to it.
 */
const trackRouterSubscriptions = (
  router: Router<typeof appRoutes, typeof notFoundRoute>,
): ReadonlySet<number> => {
  const live = new Set<number>();
  const subscribe = router.subscribe.bind(router);
  let count = 0;
  vi.spyOn(router, "subscribe").mockImplementation((listener) => {
    count += 1;
    const subscription = count;
    live.add(subscription);
    const unsubscribe = subscribe(listener);
    return () => {
      live.delete(subscription);
      unsubscribe();
    };
  });
  return live;
};

/** The members of `before` that are still in `after`. */
const keepSurvivors = (
  before: ReadonlySet<number>,
  after: ReadonlySet<number>,
): ReadonlySet<number> =>
  new Set([...before].filter((subscription) => after.has(subscription)));

/** Click the rail's entry for `href`, through the real router. */
const clickRail = async (container: HTMLElement, href: string) => {
  const link = container.querySelector<HTMLAnchorElement>(
    `nav[data-region="primary-nav"] .lenses a[href="${href}"]`,
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

  it("keeps the shell mounted across a lens switch and remounts the lens layout", async () => {
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
    const liveSubscriptions = trackRouterSubscriptions(router);

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

    // The lens index: another route of the same lens, so the layout and its
    // filter provider remount and the chips start over, while the nest above
    // the layout stays. The subscriptions that outlive the move are the
    // nest's own.
    const liveOnTerm = new Set(liveSubscriptions);
    await act(async () => {
      router.navigate("definitions");
    });
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    const definitionsIndexLayout = container.querySelector(
      ".ds.definitions-layout",
    );
    expect(definitionsIndexLayout).not.toBeNull();
    expect(definitionsIndexLayout).not.toBe(definitionsLayout);
    expect(countChipsOff(container)).toBe(0);
    const nestSubscriptions = keepSurvivors(liveOnTerm, liveSubscriptions);
    expect(nestSubscriptions.size).toBeGreaterThan(0);

    // Switch to Standards: a different layout element, with its own strip.
    await clickRail(container, "/standards");
    await waitFor(() => expect(readCurrentCrumb(container)).toBe("Standards"));
    expect(container.querySelector(".ds.standards-layout")).not.toBeNull();
    expect(container.querySelector(".ds.definitions-layout")).toBeNull();

    // And back: a new layout, with the chips at their default.
    await clickRail(container, "/definitions");
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    const definitionsLayoutAgain = container.querySelector(
      ".ds.definitions-layout",
    );
    expect(definitionsLayoutAgain).not.toBeNull();
    expect(definitionsLayoutAgain).not.toBe(definitionsIndexLayout);
    expect(countChipsOff(container)).toBe(0);

    // The nest held every one of its subscriptions through the lens switch
    // and back: it was never unmounted.
    expect(keepSurvivors(nestSubscriptions, liveSubscriptions)).toEqual(
      nestSubscriptions,
    );

    // The store served every page, and the head carries one title.
    expect(relayFetch).not.toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
  });
});
