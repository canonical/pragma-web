import {
  createMemoryAdapter,
  createRouter,
  type RouteMap,
  route,
} from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import makeLensContext from "./makeLensContext.js";
import type { LensContextProps } from "./types.js";

const Blank = (): null => null;

/** A params schema that parses every term to a number. */
const numericTerm = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: () => ({ value: { term: 42 } }),
  },
} as const;

/** A params schema that parses every term to the empty string. */
const emptyTerm = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: () => ({ value: { term: "" } }),
  },
} as const;

const routes: RouteMap = {
  glossary: route({ url: "/glossary", content: Blank }),
  glossaryTerm: route({ url: "/glossary/:term", content: Blank }),
  numbered: route({
    url: "/numbered/:term",
    content: Blank,
    params: numericTerm,
  }),
  emptied: route({
    url: "/emptied/:term",
    content: Blank,
    params: emptyTerm,
  }),
} as const;

const notFound = route({ url: "/404", content: Blank });

/**
 * Render the lens context at `url`, once the router has matched it. With
 * `withNotFound` false the router has no not-found route, so an unknown URL
 * leaves it with no match at all.
 */
const renderAt = async (
  url: string,
  Context: (props: LensContextProps) => ReactElement,
  withNotFound = true,
) => {
  const router = withNotFound
    ? createRouter(routes, { adapter: createMemoryAdapter(url), notFound })
    : createRouter(routes, { adapter: createMemoryAdapter(url) });
  await router.load(url);
  render(
    <RouterProvider router={router}>
      <Context lensLabel="Glossary" />
    </RouterProvider>,
  );
  return screen.getByRole("navigation", { name: "Breadcrumb" });
};

const GlossaryContext = makeLensContext({
  lensRouteName: "glossary",
  paramKey: "term",
});

describe("makeLensContext", () => {
  it("renders the lens crumb alone on the lens index", async () => {
    const nav = await renderAt("/glossary", GlossaryContext);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
    expect(within(nav).getByText("Glossary")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("adds the route param as the current crumb when present", async () => {
    const nav = await renderAt("/glossary/ds%3AUIBlock", GlossaryContext);
    expect(within(nav).getByRole("link", { name: "Glossary" })).toHaveAttribute(
      "href",
      "/glossary",
    );
    expect(within(nav).getByText("ds:UIBlock")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("reads the lens crumb's text from its prop on every render", async () => {
    // One component, built once at module scope, renders whichever label
    // the layout reads for the request in front of it.
    const router = createRouter(routes, {
      adapter: createMemoryAdapter("/glossary/ds%3AUIBlock"),
    });
    await router.load("/glossary/ds%3AUIBlock");
    const { rerender } = render(
      <RouterProvider router={router}>
        <GlossaryContext lensLabel="Glossaire" />
      </RouterProvider>,
    );
    expect(screen.getByRole("link", { name: "Glossaire" })).toHaveAttribute(
      "href",
      "/glossary",
    );
    rerender(
      <RouterProvider router={router}>
        <GlossaryContext lensLabel="Glossar" />
      </RouterProvider>,
    );
    expect(screen.getByRole("link", { name: "Glossar" })).toBeInTheDocument();
    expect(screen.queryByText("Glossaire")).toBeNull();
  });

  it("ignores the params when the lens names no paramKey", async () => {
    const HomeContext = makeLensContext({ lensRouteName: "glossary" });
    const nav = await renderAt("/glossary/ds%3AUIBlock", HomeContext);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
  });

  it("ignores a param that is not a string", async () => {
    const nav = await renderAt("/numbered/7", GlossaryContext);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders the lens crumb alone when no route matched", async () => {
    const nav = await renderAt("/nowhere", GlossaryContext);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders the lens crumb alone when the router has no match at all", async () => {
    const nav = await renderAt("/nowhere", GlossaryContext, false);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
    expect(within(nav).getByText("Glossary")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("adds no current crumb for an empty-string param", async () => {
    const nav = await renderAt("/emptied/anything", GlossaryContext);
    expect(within(nav).getAllByRole("listitem")).toHaveLength(1);
    expect(within(nav).getByText("Glossary")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
