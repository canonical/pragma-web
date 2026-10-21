import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { Outlet, RouterProvider } from "@canonical/router-react";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import RouterLink from "./RouterLink.js";

const warmThing = vi.fn(async () => {});

/** A route table with one entity page, which names the entity it shows. */
const routes = {
  home: route({ url: "/", content: () => <p>Home page</p> }),
  thing: route({
    url: "/things/:uri",
    warm: warmThing,
    content: ({ params }: { readonly params: { readonly uri: string } }) => (
      <p>Thing {params.uri}</p>
    ),
  }),
};

/** Render `link` beside the routed content, under a router at `/`. */
const renderWithRouter = async (
  link: ReactElement,
  notFound?: ReturnType<typeof route>,
): Promise<HTMLElement> => {
  render(
    <RouterProvider
      router={createRouter(routes, {
        adapter: createMemoryAdapter("/"),
        notFound,
      })}
    >
      {link}
      <Outlet />
    </RouterProvider>,
  );
  await screen.findByText("Home page");
  return screen.getByRole("link");
};

describe("RouterLink", () => {
  it("renders the anchor it is asked for, href and all", async () => {
    const link = await renderWithRouter(
      <RouterLink
        aria-current="page"
        className="title"
        href="/things/ds%3AButton?tab=usage#props"
      >
        Button
      </RouterLink>,
    );
    expect(link.getAttribute("href")).toBe(
      "/things/ds%3AButton?tab=usage#props",
    );
    expect(link.getAttribute("aria-current")).toBe("page");
    expect(link.className).toBe("title");
  });

  it("navigates on the client to the route its href matches", async () => {
    const link = await renderWithRouter(
      <RouterLink href="/things/ds%3AButton">Button</RouterLink>,
    );
    // The router took the click: the browser's own navigation was prevented
    // and the matched page rendered in place.
    expect(fireEvent.click(link)).toBe(false);
    expect(await screen.findByText("Thing ds:Button")).toBeInTheDocument();
  });

  it("warms the matched route when hovered", async () => {
    warmThing.mockClear();
    const link = await renderWithRouter(
      <RouterLink href="/things/ds%3AButton">Button</RouterLink>,
    );
    fireEvent.mouseEnter(link);
    await vi.waitFor(() => expect(warmThing).toHaveBeenCalledTimes(1));
  });

  it("leaves a modified click to the browser", async () => {
    const link = await renderWithRouter(
      <RouterLink href="/things/ds%3AButton">Button</RouterLink>,
    );
    expect(fireEvent.click(link, { metaKey: true })).toBe(true);
    expect(screen.getByText("Home page")).toBeInTheDocument();
  });

  it("leaves an href no route matches to the browser", async () => {
    const link = await renderWithRouter(
      <RouterLink href="/elsewhere/a/b">Elsewhere</RouterLink>,
    );
    fireEvent.mouseEnter(link);
    expect(fireEvent.click(link)).toBe(true);
  });

  it("leaves an href only the not-found route matches to the browser", async () => {
    const link = await renderWithRouter(
      <RouterLink href="/elsewhere/a/b">Elsewhere</RouterLink>,
      route({ url: "/not-found", content: () => null }),
    );
    expect(fireEvent.click(link)).toBe(true);
  });

  it("renders an anchor without an href when it is given none", async () => {
    render(
      <RouterProvider
        router={createRouter(routes, { adapter: createMemoryAdapter("/") })}
      >
        <RouterLink>Nowhere</RouterLink>
      </RouterProvider>,
    );
    const anchor = screen.getByText("Nowhere");
    expect(anchor.hasAttribute("href")).toBe(false);
    expect(fireEvent.click(anchor)).toBe(true);
  });
});
