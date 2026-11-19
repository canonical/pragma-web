// @vitest-environment node

/**
 * The Definitions overview over the metro graph, against the graph in its
 * own process and the server-rendering cell pointed at it: the record of
 * what the overview promises. The server packs it deterministically, two
 * renders giving the same SVG; every bridge the graph serves is drawn and
 * labelled at rest, legibly at the opening zoom in a browser; each
 * relation's stroke states its weight, the served count of its heaviest
 * relation, in four widths, dashed exactly where the count is 0; the
 * served SVG fits the design canvas at the legible floor or above, its
 * nodes and regions on the 16px lattice; the overview at rest and with
 * each namespace opened draws within the graph budget; and a class's term
 * page draws its neighbourhood one hop deep across namespaces, as many
 * nodes as the served graph gives it.
 */
import { GRAPH_BUDGET } from "@canonical/prism-core";
import {
  launchBrowser,
  STRIP_VIEWPORTS,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import {
  type BridgeLabelMeasure,
  type CanvasMeasure,
  countServedBridges,
  countServedNeighbourhood,
  fetchServedGraph,
  MIN_FIT,
  measureBridgeLabels,
  measureCanvasSvg,
  measureOpenedShelf,
  measureWeightLinks,
  type OpenedShelfMeasure,
  type ServedGraph,
  type ServedWeights,
  sliceCanvasSvg,
  type WeightLinkMeasure,
  weighServedRelations,
} from "@canonical/prism-lens-definitions/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, GRAPH_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** The sub-pixel rounding a box's edge may stand past the canvas's, in px. */
const WIDTH_TOLERANCE_PX = 0.5;

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;

const served: {
  graph?: ServedGraph;
  weights?: ServedWeights;
  prefixes?: readonly string[];
  classes?: number;
} = {};
const canvases = new Map<string, string>();

/**
 * The canvas's SVG the server renders for `path`, fetched afresh.
 *
 * @note Impure: performs a network request.
 */
const serveCanvas = async (path: string): Promise<string> =>
  sliceCanvasSvg(await (await fetch(new URL(path, server.base))).text());

/** The overview at rest, then with each namespace opened. */
const listViews = (): readonly string[] => [
  "/definitions",
  ...(served.prefixes ?? []).map((prefix) => `/definitions?expand=${prefix}`),
];

/**
 * Open `path` at a viewport and measure its shelves and label rows once
 * its fonts have loaded, collecting every uncaught exception.
 *
 * @note Impure: opens a browser tab, which it closes.
 */
const measureShelfAt = async (
  path: string,
  viewport: { readonly width: number; readonly height: number },
): Promise<{ errors: string[]; shelf: OpenedShelfMeasure }> => {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const origins = [new URL(server.base).origin, new URL(graph.base).origin];
    await page.route("**/*", (route) =>
      origins.includes(new URL(route.request().url()).origin)
        ? route.continue()
        : route.fulfill({ status: 204, body: "" }),
    );
    await page.routeWebSocket(
      () => true,
      () => {
        // Left unconnected, the dev server's live-reload socket stays silent.
      },
    );
    await page.goto(new URL(path, server.base).href, {
      waitUntil: "networkidle",
      timeout: PAGE_SETTLE_MS,
    });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    return {
      errors,
      shelf: await page.evaluate(measureOpenedShelf, WIDTH_TOLERANCE_PX),
    };
  } finally {
    await page.close();
  }
};

/** Each view's canvas, as first served, measured. */
const measureViews = (): [string, CanvasMeasure][] =>
  listViews().map((path) => [path, measureCanvasSvg(canvases.get(path) ?? "")]);

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
    });
    server = await startServer("dev:bun", CWD, {
      timeoutMs: DEV_READY_MS,
      env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
    });
    browser = await launchBrowser();
    const answer = await fetchServedGraph(`${graph.base}/graphql`);
    served.graph = answer;
    served.weights = weighServedRelations(answer);
    served.prefixes = answer.ontologies.map((ontology) => ontology.prefix);
    served.classes = answer.ontologies.reduce(
      (sum, ontology) => sum + ontology.classes.length,
      0,
    );
    for (const path of listViews()) canvases.set(path, await serveCanvas(path));
  },
  GRAPH_READY_MS + DEV_READY_MS + 2 * PAGE_SETTLE_MS,
);

afterAll(async () => {
  await browser?.close();
  await server?.stop();
  await graph?.stop();
});

describe("the overview's record, on the metro", () => {
  it("states each canvas's task: the drawn namespaces at rest, the opened one opened, the class in focus on a term page", async () => {
    const hooksOf = (svg: string): string | undefined =>
      /<g (data-task="[^"]+" data-(?:set|focus)="[^"]+")[^>]* class="ds class-graph"/
        .exec(svg)
        ?.at(1);
    const drawn = hooksOf(canvases.get("/definitions") ?? "");
    expect(drawn).toMatch(/^data-task="shape" data-set="/);
    for (const prefix of served.prefixes ?? []) {
      expect(
        drawn?.split('data-set="').at(1)?.slice(0, -1).split(" "),
      ).toContain(prefix);
      expect(hooksOf(canvases.get(`/definitions?expand=${prefix}`) ?? "")).toBe(
        `data-task="shape" data-set="${prefix}"`,
      );
    }
    expect(hooksOf(await serveCanvas("/definitions/metro%3AStation"))).toBe(
      'data-task="neighbourhood" data-focus="metro:Station"',
    );
  });

  it("explains no chip of the explorer's bar in a tooltip, as served", async () => {
    const html = await (
      await fetch(new URL("/definitions", server.base))
    ).text();
    // The bar's fieldsets hold no <div>: the first close after its slot
    // is its own.
    const start = html.indexOf('data-slot="explorer-controls"');
    const bar = html.slice(start, html.indexOf("</div>", start));
    expect(bar.match(/<button/g)?.length).toBeGreaterThan(0);
    expect(bar).not.toContain(" title=");
  });

  it("packs the overview deterministically: two server renders give the same SVG bytes, at rest and opened", async () => {
    expect(canvases.size).toBe(1 + (served.prefixes?.length ?? 0));
    for (const path of listViews()) {
      expect(await serveCanvas(path), path).toBe(canvases.get(path));
    }
  });

  it("labels every drawn bridge at rest, as many as the site's data serves, legibly at the opening zoom", async () => {
    const rest = measureCanvasSvg(canvases.get("/definitions") ?? "");
    // Three bridges from geo into metro: location, in zone and stops.
    expect(rest.bridges).toBe(served.weights?.bridges);
    expect(rest.bridgeLabels).toBe(rest.bridges);
    // Every opened view names every bridge it draws at rest too.
    for (const [path, measure] of measureViews()) {
      expect(measure.bridgeLabels, path).toBe(measure.bridges);
    }
    const [desktop] = VIEWPORTS;
    const page = await browser.newPage({
      viewport: { width: desktop.width, height: desktop.height },
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let labels: readonly BridgeLabelMeasure[] = [];
    try {
      const origins = [new URL(server.base).origin, new URL(graph.base).origin];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.routeWebSocket(
        () => true,
        () => {
          // Left unconnected, the dev server's live-reload socket stays silent.
        },
      );
      await page.goto(new URL("/definitions", server.base).href, {
        waitUntil: "networkidle",
        timeout: PAGE_SETTLE_MS,
      });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      labels = await page.evaluate(measureBridgeLabels);
    } finally {
      await page.close();
    }
    expect(errors).toEqual([]);
    expect(labels).toHaveLength(rest.bridges);
    for (const label of labels) {
      expect(label.px, label.text).toBeGreaterThanOrEqual(
        GRAPH_BUDGET.labelPxMin,
      );
    }
  });

  it("draws no two bridges on one line, and none along three sides of a region it joins, at rest and with each namespace opened", () => {
    for (const [path, measure] of measureViews()) {
      expect(measure.sharedBridgeLines, path).toEqual([]);
      expect(measure.framingBridges, path).toEqual([]);
    }
  });

  it("states each relation's weight by its stroke, 1, 2, 4 or 8 px and dashed exactly at 0, the served count of its heaviest relation", () => {
    const prefixes = served.prefixes ?? [];
    const isClass = (term: string): boolean =>
      prefixes.includes(term.split(":").at(0) ?? "") && term.includes(":");
    let weighed = 0;
    for (const [path, measure] of measureViews()) {
      for (const relation of measure.relations) {
        const name = `${path}: ${relation.from} to ${relation.to}`;
        expect(relation.focus, name).toBe(false);
        expect([1, 2, 4, 8], name).toContain(relation.width);
        expect(relation.dashed, name).toBe(relation.weight === 0);
        if (!isClass(relation.from) || !isClass(relation.to)) continue;
        const pair = [relation.from, relation.to].sort().join(" ");
        expect(relation.weight, name).toBe(served.weights?.weights.get(pair));
        weighed += 1;
      }
    }
    expect(weighed).toBeGreaterThan(0);
  });

  it("measures section C at the design canvas: the map's fit or the legible floor, never below, every node and region on the 16px lattice", () => {
    for (const [path, measure] of measureViews()) {
      // The map's fit at the design canvas, as the canvas states it.
      const fit = Number(
        /data-fit-zoom="([^"]+)"/.exec(canvases.get(path) ?? "")?.at(1),
      );
      const isNear = (zoom: number): boolean =>
        Math.abs(measure.openingZoom - zoom) <= 1e-3;
      expect(isNear(MIN_FIT) || isNear(fit), path).toBe(true);
      expect(measure.openingZoom, path).toBeGreaterThanOrEqual(MIN_FIT);
      expect(measure.offLattice, path).toEqual([]);
    }
  });

  it("draws within the budget at rest and with each namespace opened: nodes, the largest column, bytes and elements", () => {
    for (const [path, measure] of measureViews()) {
      expect(measure.nodes, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.drawnNodesMax,
      );
      expect(measure.largestColumn, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.bandMembersMax,
      );
      expect(measure.bytes, path).toBeLessThanOrEqual(GRAPH_BUDGET.svgBytesMax);
      expect(measure.elements, path).toBeLessThanOrEqual(
        GRAPH_BUDGET.svgElementsMax,
      );
    }
  });

  // metro:Station's page draws the class, its superclass, its subclasses
  // and every class one relation away in either direction, whatever their
  // namespace, banded by namespace.
  it("draws a term page's one-hop neighbourhood across namespaces, as the served graph counts it, within the budget", async () => {
    const { graph: answer } = served;
    if (answer === undefined) throw new Error("No served graph was read.");
    const svg = await serveCanvas("/definitions/metro%3AStation");
    const measure = measureCanvasSvg(svg);
    const namespace = answer.ontologies.find(
      (ontology) => ontology.prefix === "metro",
    )?.namespace;
    expect(namespace).toBeDefined();
    expect(svg).toContain('data-id="metro:Station"');
    expect(measure.nodes).toBe(
      countServedNeighbourhood(answer, `${namespace}Station`),
    );
    expect(measure.nodes).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
    expect(measure.largestColumn).toBeLessThanOrEqual(
      GRAPH_BUDGET.bandMembersMax,
    );
  });

  // The explorer's query reads every class of every loaded namespace, and
  // nothing bounds it: a site past the budget's figure is a stated limit.
  // A counted relation's figure is drawn beside its label, clear of every
  // line and arrowhead and wholly inside the canvas's frame: on geo opened,
  // where a numeral once sat on its arrowhead, and on metro:Station's
  // page, where one was cut at the frame's edge.
  it.each(["/definitions?expand=geo", "/definitions/metro%3AStation"])(
    "draws each count's numeral on %s clear of the lines and the arrowheads, inside the frame",
    async (path) => {
      const [desktop] = VIEWPORTS;
      const page = await browser.newPage({
        viewport: { width: desktop.width, height: desktop.height },
      });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      let numerals: readonly WeightLinkMeasure[] = [];
      try {
        const origins = [
          new URL(server.base).origin,
          new URL(graph.base).origin,
        ];
        await page.route("**/*", (route) =>
          origins.includes(new URL(route.request().url()).origin)
            ? route.continue()
            : route.fulfill({ status: 204, body: "" }),
        );
        await page.routeWebSocket(
          () => true,
          () => {
            // Left unconnected, the dev server's live-reload socket stays silent.
          },
        );
        await page.goto(new URL(path, server.base).href, {
          waitUntil: "networkidle",
          timeout: PAGE_SETTLE_MS,
        });
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
        numerals = await page.evaluate(measureWeightLinks);
      } finally {
        await page.close();
      }
      expect(errors).toEqual([]);
      expect(numerals.length).toBeGreaterThan(0);
      for (const numeral of numerals) {
        expect(numeral.count, numeral.href).toBeGreaterThan(0);
        expect(numeral.inFrame, numeral.href).toBe(true);
        expect(numeral.onLine, numeral.href).toBe(false);
        expect(numeral.onHead, numeral.href).toBe(false);
      }
    },
  );

  it("crosses no box with a bridge it does not join, and states each namespace's instances on its box, at rest and with each namespace opened", () => {
    const instances = new Map(
      (served.graph?.ontologies ?? []).map((ontology) => [
        ontology.prefix,
        ontology.classes.reduce(
          (sum, klass) => sum + (klass.instanceCount ?? 0),
          0,
        ),
      ]),
    );
    let boxes = 0;
    for (const [path, measure] of measureViews()) {
      expect(measure.crossingBridges, path).toEqual([]);
      for (const box of measure.boxes) {
        boxes += 1;
        expect(box.instances, `${path} ${box.id}`).toBe(instances.get(box.id));
      }
    }
    expect(boxes).toBeGreaterThan(0);
  });

  it("names metro's bridge to geo on its label row at rest, with the relations served", async () => {
    const [desktop] = VIEWPORTS;
    const { errors, shelf } = await measureShelfAt("/definitions", desktop);
    expect(errors).toEqual([]);
    const answer = served.graph;
    if (answer === undefined) throw new Error("no served graph");
    expect(shelf.names).toEqual([
      {
        ns: "metro",
        to: "geo",
        relations: countServedBridges(answer).get("geo metro"),
      },
    ]);
    expect(shelf.namesInWayBack).toBe(false);
  });

  it.each(
    STRIP_VIEWPORTS.filter(
      ({ name }) => name === "1440" || name === "912",
    ).flatMap((viewport) =>
      ["geo", "metro"].map(
        (prefix) => [prefix, viewport.name, viewport] as const,
      ),
    ),
  )(
    "wraps the shelf under %s opened within the canvas at %s px",
    async (prefix, _width, viewport) => {
      const { errors, shelf } = await measureShelfAt(
        `/definitions?expand=${prefix}`,
        viewport,
      );
      expect(errors).toEqual([]);
      expect(shelf.boxes.length).toBeGreaterThan(0);
      expect(shelf.boxes.filter(({ across }) => !across)).toEqual([]);
      expect(shelf.namesInWayBack).toBe(false);
    },
  );

  // A boxed namespace's inspector row opens it, by a link; the opened
  // namespace's row keeps its fit button and opens nothing.
  it("opens a boxed namespace from its inspector row by a real click, its row then fitting it only", async () => {
    const [desktop] = VIEWPORTS;
    const page = await browser.newPage({
      viewport: { width: desktop.width, height: desktop.height },
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const readRows = (): Promise<{
      opens: string[];
      boxes: string[];
      fits: number;
    }> =>
      page.evaluate(() => ({
        opens: [
          ...document.querySelectorAll(
            ".ds.graph-overview .namespace-row .open",
          ),
        ].map(
          (link) =>
            new URL(
              link.getAttribute("href") ?? "",
              document.baseURI,
            ).searchParams.get("expand") ?? "",
        ),
        boxes: [
          ...document.querySelectorAll(
            '.ds.graph-canvas svg.viewport g.node[data-kind="region"]',
          ),
        ].map((node) => node.getAttribute("data-id") ?? ""),
        fits: document.querySelectorAll(
          ".ds.graph-overview .namespace-row .namespace",
        ).length,
      }));
    let before: Awaited<ReturnType<typeof readRows>> | undefined;
    let after: Awaited<ReturnType<typeof readRows>> | undefined;
    let opened: string | null = null;
    let target = "";
    try {
      const origins = [new URL(server.base).origin, new URL(graph.base).origin];
      await page.route("**/*", (route) =>
        origins.includes(new URL(route.request().url()).origin)
          ? route.continue()
          : route.fulfill({ status: 204, body: "" }),
      );
      await page.routeWebSocket(
        () => true,
        () => {
          // Left unconnected, the dev server's live-reload socket stays silent.
        },
      );
      await page.goto(new URL("/definitions?expand=geo", server.base).href, {
        waitUntil: "networkidle",
        timeout: PAGE_SETTLE_MS,
      });
      before = await readRows();
      target = before.opens.at(0) ?? "";
      await page
        .locator(".ds.graph-overview .namespace-row .open", {
          hasText: `Open ${target}`,
        })
        .click();
      await page.waitForURL(new RegExp(`[?&]expand=${target}`));
      await page.waitForLoadState("networkidle");
      opened = new URL(page.url()).searchParams.get("expand");
      after = await readRows();
    } finally {
      await page.close();
    }
    expect(errors).toEqual([]);
    expect(before?.opens).not.toContain("geo");
    expect(before?.opens.toSorted()).toEqual(before?.boxes.toSorted());
    expect(target).not.toBe("");
    expect(opened).toBe(target);
    expect(after?.opens).not.toContain(target);
    expect(after?.opens).toContain("geo");
    // Every row keeps its fit button, the opened namespace's included.
    expect(after?.fits).toBe(served.prefixes?.length);
  });

  it("fetches no more classes than the budget's figure for fetched nodes", () => {
    expect(served.classes).toBeGreaterThan(0);
    expect(served.classes).toBeLessThanOrEqual(GRAPH_BUDGET.fetchedNodesMax);
  });
});
