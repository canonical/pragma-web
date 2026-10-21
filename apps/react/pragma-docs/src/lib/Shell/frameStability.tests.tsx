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
 * - THE LAYOUT REMOUNTS. Each lens renders its own layout root; the
 *   Definitions root after a round trip is a new node, and the Definitions
 *   filter chips come back at their default: the layout's
 *   `LensFilterProvider` was unmounted and mounted fresh.
 * - THE SHELL STAYS. Each provider of the nest (`HeadProvider`,
 *   `RelayEnvironmentProvider`, `RouterProvider`) is wrapped in a mount
 *   counter, and each mounts exactly once and never unmounts across the
 *   round trip. A remount of any of them, or a provider moved into a lens
 *   layout, would mount it again. The store the environment holds still
 *   serves Definitions on the way back (the network is never called), and
 *   the head carries exactly one `<title>`.
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
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import mergeRecordMaps from "../../../testing/mergeRecordMaps.js";
import type { MountCount } from "../../../testing/types.js";
import definitionsExplorerRecords from "../../domains/lenses/definitions/__fixtures__/definitionsExplorerRecords.js";
import standardsIndexRecords from "../../domains/lenses/standards/__fixtures__/standardsIndexRecords.js";
import { appRoutes, middleware, notFoundRoute } from "../../routes.js";
import Shell from "./Shell.js";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** The mounts and unmounts of each provider `Shell` nests, counted by the
 * wrappers the module mocks below put around the real providers. */
const providerMounts = vi.hoisted(
  (): Record<string, MountCount> => ({
    HeadProvider: { mounts: 0, unmounts: 0 },
    RelayEnvironmentProvider: { mounts: 0, unmounts: 0 },
    RouterProvider: { mounts: 0, unmounts: 0 },
  }),
);

vi.mock("@canonical/react-head", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@canonical/react-head")>();
  const { default: trackMounts } = await import(
    "../../../testing/trackMounts.js"
  );
  return {
    ...actual,
    HeadProvider: trackMounts(actual.HeadProvider, providerMounts.HeadProvider),
  };
});

vi.mock("react-relay", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-relay")>();
  const { default: trackMounts } = await import(
    "../../../testing/trackMounts.js"
  );
  return {
    ...actual,
    RelayEnvironmentProvider: trackMounts(
      actual.RelayEnvironmentProvider,
      providerMounts.RelayEnvironmentProvider,
    ),
  };
});

vi.mock("@canonical/router-react", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@canonical/router-react")>();
  const { default: trackMounts } = await import(
    "../../../testing/trackMounts.js"
  );
  return {
    ...actual,
    RouterProvider: trackMounts(
      actual.RouterProvider,
      providerMounts.RouterProvider,
    ),
  };
});

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
    for (const count of Object.values(providerMounts)) {
      count.mounts = 0;
      count.unmounts = 0;
    }
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

    const container = document.createElement("div");
    document.body.appendChild(container);
    containers.push(container);
    const root = createRoot(container);
    roots.push(root);
    await act(async () => {
      root.render(<Shell environment={environment} router={router} />);
    });

    // Definitions, unfiltered: every class is visible.
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
    expect(readStatus(container)).not.toContain("60 of 60");

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
    expect(
      container.querySelectorAll(
        '[data-slot="controls"] button[aria-pressed="false"]',
      ),
    ).toHaveLength(0);

    // The shell held throughout: every provider of the nest mounted once
    // and never unmounted, the store served every page, and the head
    // carries one title.
    expect(providerMounts).toEqual({
      HeadProvider: { mounts: 1, unmounts: 0 },
      RelayEnvironmentProvider: { mounts: 1, unmounts: 0 },
      RouterProvider: { mounts: 1, unmounts: 0 },
    });
    expect(relayFetch).not.toHaveBeenCalled();
    expect(globalFetch).not.toHaveBeenCalled();
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
  });
});
