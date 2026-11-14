import {
  createRouter,
  createServerAdapter,
  route,
} from "@canonical/router-core";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import viewSearch from "./viewSearch.js";

/** Validate `value` with the schema and return its value. */
const read = (value: unknown) => {
  const result = viewSearch["~standard"].validate(value);
  if (result instanceof Promise || result.issues !== undefined) {
    throw new Error("viewSearch failed");
  }
  return result.value;
};

/** The content the one route renders. */
const Page = () => createElement("p", null, "page");

/** A route table whose one route declares the view's search schema. */
const routes = {
  index: route({ url: "/x", content: Page, search: viewSearch }),
} as const;

/** The view's state as one address carries it, every parameter set. */
const VIEW_STATE = {
  as: "cards",
  q: "cen",
  sheet: "filter",
  graph: "orbit",
  select: "ds:a",
  expand: "ds:a:p:out",
} as const;

/** A router over `routes`, positioned on the server at `url`. */
const createViewRouter = (url: string) =>
  createRouter(routes, { adapter: createServerAdapter(url) });

describe("viewSearch", () => {
  it("passes the view's six parameters through as text", () => {
    expect(
      read({
        as: "cards",
        q: "cen",
        sheet: "filter",
        graph: "orbit",
        select: "ds:a",
        expand: "ds:a:p:out",
      }),
    ).toEqual({
      as: "cards",
      q: "cen",
      sheet: "filter",
      graph: "orbit",
      select: "ds:a",
      expand: "ds:a:p:out",
    });
  });

  it("leaves out every parameter the address does not carry", () => {
    expect(read({})).toEqual({});
    expect(read({ q: "" })).toEqual({ q: "" });
  });

  it("never fails, ignoring parameters it does not name", () => {
    expect(read({ view: "cards", as: 3 })).toEqual({});
  });

  describe("through the router", () => {
    it("matches the view's parameters from an address", () => {
      const router = createViewRouter("/x");
      const match = router.match(
        "/x?as=cards&q=cen&sheet=filter&graph=orbit&select=ds:a&expand=ds:a:p:out",
      );
      expect(match?.kind).toBe("route");
      expect(match?.kind === "route" && match.search).toEqual(VIEW_STATE);
    });

    it("builds an address the router matches back to the same parameters", () => {
      const router = createViewRouter("/x");
      const href = router.buildPath("index", { search: VIEW_STATE });
      const match = router.match(href);
      expect(match?.kind === "route" && match.search).toEqual(VIEW_STATE);
    });

    it("matches an address with none of them to an empty search", () => {
      const router = createViewRouter("/x");
      const match = router.match("/x?sort=name");
      expect(match?.kind === "route" && match.search).toEqual({});
    });
  });
});
