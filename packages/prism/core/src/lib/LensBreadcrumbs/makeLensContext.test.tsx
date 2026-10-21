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
import { makeLensContext } from "./makeLensContext.js";

const Blank = (): null => null;

/** A params schema that parses every term to a number. */
const numericTerm = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: () => ({ value: { term: 42 } }),
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
} as const;

const notFound = route({ url: "/404", content: Blank });

/** Render the lens context at `url`, once the router has matched it. */
const renderAt = async (url: string, Context: () => ReactElement) => {
  const router = createRouter(routes, {
    adapter: createMemoryAdapter(url),
    notFound,
  });
  await router.load(url);
  render(
    <RouterProvider router={router}>
      <Context />
    </RouterProvider>,
  );
  return screen.getByRole("navigation", { name: "Breadcrumb" });
};

const GlossaryContext = makeLensContext({
  lensLabel: "Glossary",
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

  it("ignores the params when the lens names no paramKey", async () => {
    const HomeContext = makeLensContext({
      lensLabel: "Glossary",
      lensRouteName: "glossary",
    });
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
});
