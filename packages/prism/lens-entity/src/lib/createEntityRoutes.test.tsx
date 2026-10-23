import {
  collectLenses,
  createEnvironment,
  createStaticRouter,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import {
  LINES_BINDING,
  NORTHGATE_CURIE,
  SITE_ROUTES,
  STATIONS_BINDING,
  STATIONS_LENS,
} from "../../testing/fixtures.js";
import createEntityRoutes from "./createEntityRoutes.js";
import { EntityIcon } from "./EntityIcon/index.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

/** A glyph a site gives in place of the lens's own. */
const SiteGlyph = () => <svg aria-hidden="true" />;

describe("createEntityRoutes", () => {
  it("names the two routes after the binding's id", () => {
    const routes = createEntityRoutes(STATIONS_BINDING, STATIONS_LENS);
    expect(Object.keys(routes)).toEqual(["stations", "stationsEntity"]);
    expect(routes.stations.url).toBe("/stations");
    expect(routes.stationsEntity.url).toBe("/stations/:uri");
  });

  it("declares the lens on the index, and on the index only", () => {
    const routes = createEntityRoutes(STATIONS_BINDING, STATIONS_LENS);
    expect(collectLenses(routes)).toEqual([
      {
        name: "stations",
        label: "Stations",
        icon: EntityIcon,
        order: 1,
        tier: 1,
      },
    ]);
    expect(routes.stationsEntity.meta).toBeUndefined();
  });

  it("declares the icon a site gives in place of its own", () => {
    const routes = createEntityRoutes(STATIONS_BINDING, {
      ...STATIONS_LENS,
      icon: SiteGlyph,
    });
    expect(collectLenses(routes).at(0)?.icon).toBe(SiteGlyph);
  });

  it("lets two bindings share one route table, each a lens of its own", () => {
    expect(Object.keys(SITE_ROUTES)).toEqual([
      "stations",
      "stationsEntity",
      "lines",
      "linesEntity",
    ]);
    expect(collectLenses(SITE_ROUTES).map(({ name }) => name)).toEqual([
      "stations",
      "lines",
    ]);
  });

  it("warms the index through the index's operation", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));
    void SITE_ROUTES.lines.warm?.(
      {},
      { view: "rows" },
      {
        signal: new AbortController().signal,
      },
    );
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityIndexQuery");
    expect(variables).toMatchObject({
      classUri: LINES_BINDING.classUri,
    });
  });

  it("warms the entity page through the namespaces first", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));
    void SITE_ROUTES.stationsEntity.warm?.(
      { uri: NORTHGATE_CURIE },
      {},
      {
        signal: new AbortController().signal,
      },
    );
    const [request] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityNamespacesQuery");
  });

  it("throws on a binding whose id cannot name a route", () => {
    expect(() =>
      createEntityRoutes(
        { id: "Stations", classUri: "metro:Station", typename: "Station" },
        STATIONS_LENS,
      ),
    ).toThrow(/lower camel case/);
  });

  it("types the table by the binding's literal id", () => {
    const routes = createEntityRoutes(STATIONS_BINDING, STATIONS_LENS);
    expectTypeOf<keyof typeof routes>().toEqualTypeOf<
      "stations" | "stationsEntity"
    >();
    expectTypeOf(routes.stationsEntity.url).toEqualTypeOf<"/stations/:uri">();

    const router = createStaticRouter(SITE_ROUTES, "/stations");
    expect(
      router.buildPath("stationsEntity", { params: { uri: NORTHGATE_CURIE } }),
    ).toBe("/stations/metro%3Anorthgate");
    expect(router.buildPath("lines")).toBe("/lines");
    // @ts-expect-error -- the entity route takes its address
    expect(() => router.buildPath("stationsEntity")).toThrow();
  });
});
