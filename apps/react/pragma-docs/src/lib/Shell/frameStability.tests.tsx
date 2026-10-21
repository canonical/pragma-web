/**
 * The shell providers stay mounted across a lens switch; the lens layout
 * remounts.
 *
 * Each lens renders inside its own layout, so a lens switch replaces the
 * whole layout — rail, strip, canvas and any provider the layout holds —
 * while `Shell`, the provider nest above it, stays put. This suite drives
 * that through the real app: the real route table, a browser router, the
 * Relay environment `Shell` provides, and clicks on the real rail.
 *
 * What it pins, per layer:
 *
 * - THE LAYOUT REMOUNTS. The `.ds.lens-layout` element after a switch is a
 *   different node, and the Definitions filter chips come back at their
 *   default after a round trip: the layout's `LensFilterProvider` was
 *   unmounted and mounted fresh.
 * - THE SHELL STAYS. The Profiler around `Shell` reports exactly one mount,
 *   the store the environment holds still serves Definitions on the way
 *   back (the network is never called), and the head carries exactly one
 *   `<title>`.
 */

import "../../domains/lenses/definitions/__fixtures__/stubReactFlowGlobals.js";
import {
  createBrowserAdapter,
  createRouter,
  type Router,
} from "@canonical/router-core";
import { fireEvent, waitFor } from "@testing-library/react";
import { act, Profiler, type ProfilerOnRenderCallback } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import mergeRecordMaps from "../../../testing/mergeRecordMaps.js";
import definitionsExplorerRecords from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecords.js";
import standardsIndexRecords from "../../domains/lenses/standards/__fixtures__/standardsIndexRecords.js";
import { appRoutes, middleware, notFoundRoute } from "../../routes.js";
import Shell from "./Shell.js";

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

  it("keeps the shell providers mounted and remounts the lens layout", async () => {
    // One store warm for both lenses, behind a network that never answers:
    // any fetch at all means the store did not survive.
    const relayFetch = createFetchSpy();
    const environment = createEnvironment({
      records: mergeRecordMaps(
        definitionsExplorerRecords,
        standardsIndexRecords,
      ),
      fetchFn: relayFetch,
    });
    setPrefetchEnvironment(environment);
    window.history.pushState({}, "", "/definitions");
    const router: Router<typeof appRoutes, typeof notFoundRoute> = createRouter(
      appRoutes,
      {
        adapter: createBrowserAdapter(),
        middleware: [...middleware],
        notFound: notFoundRoute,
      },
    );

    const onRender = vi.fn<ProfilerOnRenderCallback>();
    const container = document.createElement("div");
    document.body.appendChild(container);
    containers.push(container);
    const root = createRoot(container);
    roots.push(root);
    await act(async () => {
      root.render(
        <Profiler id="shell" onRender={onRender}>
          <Shell environment={environment} router={router} />
        </Profiler>,
      );
    });

    // Definitions, unfiltered: every class is visible.
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    const definitionsLayout = container.querySelector(".ds.lens-layout");
    expect(definitionsLayout).not.toBeNull();

    // Turn one ontology off through the strip's chips: the figure recounts.
    const chip = container.querySelector<HTMLButtonElement>(
      '[data-slot="controls"] button[aria-pressed="true"]',
    );
    expect(chip).not.toBeNull();
    await act(async () => {
      if (chip !== null) fireEvent.click(chip);
    });
    expect(readStatus(container)).not.toContain("60 of 60");

    // Switch to Standards: a different layout element, with its own strip.
    await clickRail(container, "/standards");
    await waitFor(() => expect(readCurrentCrumb(container)).toBe("Standards"));
    const standardsLayout = container.querySelector(".ds.lens-layout");
    expect(standardsLayout).not.toBeNull();
    expect(standardsLayout).not.toBe(definitionsLayout);

    // And back: the chips start over, because the layout and its filter
    // provider were mounted afresh.
    await clickRail(container, "/definitions");
    await waitFor(() => expect(readStatus(container)).toContain("60 of 60"));
    expect(
      container.querySelectorAll(
        '[data-slot="controls"] button[aria-pressed="false"]',
      ),
    ).toHaveLength(0);

    // The shell held throughout: the store served every page, the nest
    // mounted once, and the head carries one title.
    expect(relayFetch).not.toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
    expect(
      onRender.mock.calls.filter(([, phase]) => phase === "mount"),
    ).toHaveLength(1);
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
  });
});
