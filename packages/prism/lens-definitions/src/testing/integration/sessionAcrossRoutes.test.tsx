/**
 * THE READER'S CHOICES OUTLIVE THE ROUTE. The router mounts a route's
 * wrappers again whenever the matched route changes, so moving from the
 * lens index to a term mounts a new layout, provider and explorer. Under
 * the real router and its outlet, a reader who turns a chip off, types a
 * search and zooms in, then picks a class from the rail, finds the chip
 * still off, the search still typed, the zoom unchanged and the camera
 * panned, not reopened; and so on the way back to the index. A visit to
 * another lens and back starts from the defaults.
 */

import { createEnvironment, HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import {
  createMemoryAdapter,
  createRouter,
  group,
  route,
  wrapper,
} from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  HOMES,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecordsComponent from "../../../testing/records/definitionsExplorerRecordsComponent.js";
import { definitionsRoutes } from "../../lib/routes.js";
import { DefinitionsLayout } from "../../lib/ui/DefinitionsLayout/index.js";

/** The lens's layout as a site groups its routes under it. */
const layout = wrapper<ReactElement>({
  id: "definitions-layout",
  component: ({ children }: { readonly children?: ReactNode }) => (
    <DefinitionsLayout rail={null}>{children}</DefinitionsLayout>
  ),
});

const [definitions, definitionsTerm] = group(layout, [
  definitionsRoutes.definitions,
  definitionsRoutes.definitionsTerm,
] as const);

/** A page of another lens, outside the Definitions layout. */
const elsewhere = route({
  url: "/elsewhere",
  content: () => <p>Another lens</p>,
});

/** Mount the lens's two routes and another under a router at the index. */
function mountLens() {
  const router = createRouter(
    { definitions, definitionsTerm, elsewhere },
    { adapter: createMemoryAdapter("/definitions") },
  );
  const view = render(
    <RelayEnvironmentProvider
      environment={createEnvironment({
        records: definitionsExplorerRecordsComponent,
        fetchFn: createFetchSpy(),
      })}
    >
      <RouterProvider router={router}>
        <HomesProvider homes={HOMES}>
          <ProjectionsProvider maps={defaultProjectionMaps}>
            <Outlet />
          </ProjectionsProvider>
        </HomesProvider>
      </RouterProvider>
    </RelayEnvironmentProvider>,
  );
  return { ...view, router };
}

/** The viewport's size, as the stubbed layout reports it. */
const VIEWPORT = { w: 590, h: 778 };

/**
 * The camera's scale from world units to screen pixels, read off its
 * transform and the viewport's viewBox, which differs from route to route.
 */
const readScreenScale = (container: HTMLElement): number => {
  const transform =
    container.querySelector(".desktop .camera")?.getAttribute("transform") ??
    "";
  const k = Number(/scale\(([^)]+)\)/.exec(transform)?.at(1));
  const [, , w = 1, h = 1] = (
    container.querySelector(".desktop svg.viewport")?.getAttribute("viewBox") ??
    ""
  )
    .split(" ")
    .map(Number);
  return k * Math.min(VIEWPORT.w / w, VIEWPORT.h / h);
};

/** The zoom level the canvas's controls bar reads. */
const readZoomLevel = (container: HTMLElement): string | null | undefined =>
  container.querySelector(".desktop .zoom-level")?.textContent;

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({ matches: true, media: query }) as unknown as MediaQueryList,
  );
  vi.spyOn(SVGElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: VIEWPORT.w,
    height: VIEWPORT.h,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: VIEWPORT.w,
    bottom: VIEWPORT.h,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the reader's choices across the lens's routes", () => {
  it("keeps the chips, the search, the zoom and the pan from the index to a term and back", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, async () => {
    const { container, router } = mountLens();
    const firstLayout = container.querySelector(".ds.workspace-layout");
    fireEvent.click(screen.getByRole("button", { name: "Abstract" }));
    expect(
      screen
        .getByRole("button", { name: "Abstract" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    const hidden = container.querySelectorAll(
      ".desktop .node.is-hidden",
    ).length;
    expect(hidden).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "st" },
    });
    const dimmed = container.querySelectorAll(
      ".ds.term-rail .item.is-dimmed",
    ).length;
    expect(dimmed).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    const zoom = readZoomLevel(container);
    const scale = readScreenScale(container);

    await act(async () => {
      await router.navigate("definitionsTerm", {
        params: { term: "ds:Component" },
      });
    });

    // The router mounted the layout again, and the reader's view survived.
    expect(container.querySelector(".ds.workspace-layout")).not.toBe(
      firstLayout,
    );
    expect(
      screen
        .getByRole("button", { name: "Abstract" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
    expect(container.querySelectorAll(".desktop .node.is-hidden")).toHaveLength(
      hidden,
    );
    expect(screen.getByRole("searchbox")).toHaveValue("st");
    expect(
      container.querySelectorAll(".ds.term-rail .item.is-dimmed"),
    ).toHaveLength(dimmed);
    expect(readScreenScale(container)).toBeCloseTo(scale, 10);
    expect(readZoomLevel(container)).toBe(zoom);

    await act(async () => {
      await router.navigate("definitions");
    });
    expect(screen.getByRole("searchbox")).toHaveValue("st");
    expect(readScreenScale(container)).toBeCloseTo(scale, 10);
    expect(readZoomLevel(container)).toBe(zoom);

    // A visit to another lens ends the session: back on the index, the
    // reader starts from the defaults.
    await act(async () => {
      await router.navigate("elsewhere");
    });
    expect(screen.getByText("Another lens")).toBeInTheDocument();
    await act(async () => {
      await router.navigate("definitions");
    });
    expect(
      screen
        .getByRole("button", { name: "Abstract" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });
});
