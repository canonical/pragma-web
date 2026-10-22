import {
  createMemoryAdapter,
  createRouter,
  type RouteMap,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import { collectLenses, routeLensFacet } from "../routeLens/index.js";
import {
  collectShortcuts,
  ROUTE_SHORTCUT_META_KEY,
} from "../routeShortcut/index.js";
import Rail from "./Rail.js";
import type { RailBrand } from "./types.js";

const brand: RailBrand = {
  label: "Atlas",
  caption: "a field guide",
  to: "home",
};

const Icon = () => <svg aria-hidden="true" />;

/** Mount the rail over `routes`, listing the lenses that table declares. */
const renderRailOver = (routes: RouteMap, initialUrl = "/") => {
  const router = createRouter(routes, {
    adapter: createMemoryAdapter(initialUrl),
  });
  const view = render(
    <RouterProvider router={router}>
      <Rail brand={brand} entries={collectLenses(routes)} />
    </RouterProvider>,
  );
  return { router, view };
};

/** Mount the rail under a real in-memory router over the fixture table. */
const renderRail = (initialUrl = "/") =>
  renderRailOver(LENS_ROUTES, initialUrl);

afterEach(() => {
  // The shortcuts preference is a cookie written at `path=/`; clearing it on
  // any other path leaves it set, and an "off" rail would leak into every
  // later test in this file.
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
  document.cookie = "shortcuts=; path=/; max-age=0";
});

describe("Rail", () => {
  it("is a labelled nav carrying the table's lenses in rail order", () => {
    renderRail();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav.dataset.region).toBe("primary-nav");
    const labels = [...nav.querySelectorAll(".lenses .label")].map(
      (label) => label.textContent,
    );
    expect(labels).toEqual(["Home", "Catalog", "Glossary"]);
  });

  it("takes a consumer aria-label in place of its default name", () => {
    const router = createRouter(LENS_ROUTES, {
      adapter: createMemoryAdapter("/"),
    });
    render(
      <RouterProvider router={router}>
        <Rail
          aria-label="Principal"
          brand={brand}
          entries={collectLenses(LENS_ROUTES)}
        />
      </RouterProvider>,
    );
    expect(
      screen.getByRole("navigation", { name: "Principal" }),
    ).toBeInTheDocument();
  });

  it("shows each lens's keyboard hint as kbd and aria-keyshortcuts", () => {
    renderRail();
    // Sourced from the ROUTES' allocation, not from a literal here: the
    // point of the derivation is that this test cannot pass by agreeing
    // with a second hand-written table.
    const { byRoute } = collectShortcuts(LENS_ROUTES);
    for (const { name, label } of collectLenses(LENS_ROUTES)) {
      const hint = byRoute.get(name);
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("aria-keyshortcuts", hint);
      expect(link.querySelector("kbd")?.textContent).toBe(hint);
    }
  });

  it("renders the lens order's digits as 1–3", () => {
    renderRail();
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const digits = [...nav.querySelectorAll(".lenses kbd")].map(
      (kbd) => kbd.textContent,
    );
    expect(digits).toEqual(["1", "2", "3"]);
  });

  it("displays and wires whatever key the ROUTE allocates", async () => {
    // The derivation proof. Re-allocate Catalog to "9" on a copy of the
    // table and the rail must follow — display AND listener — with the old
    // key going dead. Nothing here touches the entries, so a rail that read
    // its digits from anywhere but the router's table would fail every
    // assertion.
    // A spread copy of a route is complete: `route()` returns own
    // enumerable properties only, which is what `group()` already relies on.
    const routes = {
      ...LENS_ROUTES,
      catalog: {
        ...LENS_ROUTES.catalog,
        meta: {
          ...LENS_ROUTES.catalog.meta,
          [ROUTE_SHORTCUT_META_KEY]: "9",
        },
      },
    };
    const router = createRouter(routes, {
      adapter: createMemoryAdapter("/"),
    });
    render(
      <RouterProvider router={router}>
        <Rail brand={brand} entries={collectLenses(routes)} />
      </RouterProvider>,
    );

    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute(
      "aria-keyshortcuts",
      "9",
    );

    // The old digit first, while the router is still at "/": nothing
    // allocates "2" any more, so it must navigate nowhere. Asserting this
    // AFTER the "9" navigation would prove nothing — "2" would be heading
    // to /catalog either way.
    fireEvent.keyDown(document, { key: "2" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");

    fireEvent.keyDown(document, { key: "9" });
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe("/catalog");
    });
  });

  it("renders no hint for a lens whose route allocates no key", () => {
    // Catalog carries a lens claim and no shortcut claim; the other lenses
    // keep theirs.
    const routes = {
      ...LENS_ROUTES,
      catalog: {
        ...LENS_ROUTES.catalog,
        meta: routeLensFacet.of({
          label: "Catalog",
          icon: Icon,
          order: 2,
          tier: 1,
        }),
      },
    };
    renderRailOver(routes);

    const catalog = screen.getByRole("link", { name: "Catalog" });
    expect(catalog.querySelector("kbd")).toBeNull();
    expect(catalog).not.toHaveAttribute("aria-keyshortcuts");
    for (const [label, hint] of [
      ["Home", "1"],
      ["Glossary", "3"],
    ] as const) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("aria-keyshortcuts", hint);
      expect(link.querySelector("kbd")?.textContent).toBe(hint);
    }
  });

  it("lists the entries in the order the lenses declare, not the table's", () => {
    // Orders 10, 2, 7 declared in table order: the rail must sort them, and
    // the gaps must not matter.
    const buildLens = (label: string, order: number) =>
      routeLensFacet.of({ label, icon: Icon, order, tier: 1 });
    const routes = {
      home: route({
        url: "/",
        content: () => null,
        meta: buildLens("Ten", 10),
      }),
      second: route({
        url: "/b",
        content: () => null,
        meta: buildLens("Two", 2),
      }),
      third: route({
        url: "/c",
        content: () => null,
        meta: buildLens("Seven", 7),
      }),
    } as const;
    renderRailOver(routes);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      [...nav.querySelectorAll(".lenses .label")].map(
        (label) => label.textContent,
      ),
    ).toEqual(["Two", "Seven", "Ten"]);
  });

  it("links the brand to the route it names, with its caption", () => {
    renderRail("/catalog");
    const brandLink = screen
      .getByRole("navigation", { name: "Primary" })
      .querySelector(".brand");
    expect(brandLink).toHaveAttribute("href", "/");
    expect(brandLink?.querySelector("small")?.textContent).toBe(
      "a field guide",
    );
  });

  it("renders no caption when the brand has none", () => {
    const routes = {
      home: route({ url: "/", content: () => null }),
    } as const;
    render(
      <RouterProvider
        router={createRouter(routes, { adapter: createMemoryAdapter("/") })}
      >
        <Rail brand={{ label: "Metro", to: "home" }} entries={[]} />
      </RouterProvider>,
    );
    const brandLink = screen
      .getByRole("navigation", { name: "Primary" })
      .querySelector(".brand");
    expect(brandLink?.textContent).toBe("Metro");
    expect(brandLink?.querySelector("small")).toBeNull();
  });

  it("marks the active lens with the router's aria-current", () => {
    renderRail("/catalog");
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Glossary" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders children after the lenses, at the foot of the rail", () => {
    render(
      <RouterProvider
        router={createRouter(LENS_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <Rail brand={brand} entries={collectLenses(LENS_ROUTES)}>
          <ul aria-label="Utilities" className="utilities">
            <li>Help</li>
          </ul>
        </Rail>
      </RouterProvider>,
    );
    const nav = screen.getByRole("navigation", { name: "Primary" });
    const utilities = screen.getByRole("list", { name: "Utilities" });
    expect(nav.lastElementChild).toBe(utilities);
    expect(nav.querySelector(".lenses")?.contains(utilities)).toBe(false);
    expect(nav.querySelector(".spacer")?.nextElementSibling).toBe(utilities);
  });

  it("navigates on a bare lens digit (the wired keyboard grammar)", async () => {
    const { router } = renderRail("/");
    fireEvent.keyDown(document, { key: "2" });
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe("/catalog");
    });
  });

  it("fires no digit while the shortcuts preference is off", () => {
    // A returning visitor who has switched the shortcuts off: the preference
    // is in the cookie before the rail ever mounts, and the listener reads it
    // on the first render.
    //
    // Asserted through `preventDefault` rather than through the router's
    // pathname, and so without a wall-clock wait: the handler cancels the
    // event only when it acts, and `fireEvent` returns false for a cancelled
    // event. That distinguishes DECLINED from "acted, but the navigation has
    // not landed yet", which a sleep-then-check-the-pathname cannot.
    // biome-ignore lint/suspicious/noDocumentCookie: test setup
    document.cookie = "shortcuts=off; path=/";
    renderRail("/");
    expect(fireEvent.keyDown(document, { key: "2" })).toBe(true);
  });

  it("fires a digit when the preference is on (the same assertion, inverted)", async () => {
    // The control case for the test above: without it, a rail whose listener
    // never acted at all would satisfy the "off" assertion. The navigation is
    // awaited rather than left in flight, so no state update escapes into
    // another test's teardown.
    // biome-ignore lint/suspicious/noDocumentCookie: test setup
    document.cookie = "shortcuts=on; path=/";
    const { router } = renderRail("/");
    expect(fireEvent.keyDown(document, { key: "2" })).toBe(false);
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe("/catalog");
    });
  });

  it("leaves digits alone while typing in an editable target", async () => {
    const { router, view } = renderRail("/");
    const input = document.createElement("input");
    view.container.appendChild(input);
    fireEvent.keyDown(input, { key: "2" });
    // Give a queued navigation a beat to (wrongly) land before asserting.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");
  });

  it("leaves digits alone in a textarea, a select, or editable content", async () => {
    const { router, view } = renderRail("/");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    // jsdom computes no `isContentEditable`; state it the way a browser
    // reports a `contenteditable` element.
    Object.defineProperty(editable, "isContentEditable", { value: true });
    view.container.append(textarea, select, editable);
    for (const target of [textarea, select, editable]) {
      fireEvent.keyDown(target, { key: "2" });
    }
    // Give a queued navigation a beat to (wrongly) land before asserting.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");
  });

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"] as const)(
    "leaves a %s chord alone",
    async (modifier) => {
      const { router } = renderRail("/");
      fireEvent.keyDown(document, { key: "2", [modifier]: true });
      // Give a queued navigation a beat to (wrongly) land before asserting.
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(router.getState().location.pathname).toBe("/");
    },
  );

  it("leaves digits alone mid-IME composition", async () => {
    const { router } = renderRail("/");
    fireEvent.keyDown(document, { key: "2", isComposing: true });
    // Give a queued navigation a beat to (wrongly) land before asserting.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");
  });

  it("leaves auto-repeated digits alone (a held key is not a command)", async () => {
    const { router } = renderRail("/");
    fireEvent.keyDown(document, { key: "2", repeat: true });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");
  });

  it("detaches the listener on unmount (the ephemeral contract)", async () => {
    const { router, view } = renderRail("/");
    view.unmount();
    fireEvent.keyDown(document, { key: "3" });
    // Give a queued navigation a beat to (wrongly) land before asserting.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(router.getState().location.pathname).toBe("/");
  });
});
