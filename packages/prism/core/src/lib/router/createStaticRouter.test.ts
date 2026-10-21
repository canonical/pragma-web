import { route } from "@canonical/router-core";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import createStaticRouter from "./createStaticRouter.js";

const Page = () => createElement("p", null, "page");
const Missing = () => createElement("p", null, "missing");

const routes = {
  home: route({ url: "/", content: Page }),
  term: route({ url: "/terms/:term", content: Page }),
  legacy: route({ url: "/legacy", redirect: "/", status: 301 }),
} as const;

const notFound = route({ url: "/404", content: Missing });

describe("createStaticRouter", () => {
  it("hydrates a matched route so render() works without load()", () => {
    const router = createStaticRouter(routes, "/terms/ds%3AUIBlock");
    expect(router.match?.kind).toBe("route");
    expect(router.dehydrate()).toEqual({
      href: "/terms/ds%3AUIBlock",
      kind: "route",
      routeId: "term",
      status: 200,
    });
    expect(router.render()).not.toBeNull();
  });

  it("hydrates the not-found route when one is configured", () => {
    const router = createStaticRouter(routes, "/nowhere", { notFound });
    expect(router.match?.kind).toBe("not-found");
    expect(router.dehydrate()).toMatchObject({
      kind: "not-found",
      routeId: null,
      status: 404,
    });
  });

  it("leaves an unmatched URL unhydrated", () => {
    const router = createStaticRouter(routes, "/nowhere");
    expect(router.match).toBeNull();
    expect(router.dehydrate()).toBeNull();
    expect(router.render()).toBeNull();
  });

  it("leaves a redirect unhydrated, exposing its target on the match", () => {
    const router = createStaticRouter(routes, "/legacy");
    expect(router.match).toMatchObject({
      kind: "redirect",
      redirectTo: "/",
      status: 301,
    });
    expect(router.dehydrate()).toBeNull();
  });

  it("accepts a URL object as well as a string", () => {
    const router = createStaticRouter(
      routes,
      new URL("http://localhost/terms/density"),
    );
    expect(router.match?.kind).toBe("route");
    expect(router.dehydrate()?.routeId).toBe("term");
  });

  it("reports the same match on every read of the getter", () => {
    const router = createStaticRouter(routes, "/");
    expect(router.match).toBe(router.match);
  });
});
