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
 * nodes and regions on the 16px lattice; and the overview at rest and with
 * each namespace opened draws within the graph budget.
 */
import { GRAPH_BUDGET } from "@canonical/prism-core";
import {
  launchBrowser,
  VIEWPORTS,
} from "@canonical/prism-core/testing/browser";
import {
  type BridgeLabelMeasure,
  type CanvasMeasure,
  fetchServedGraph,
  MIN_FIT,
  measureBridgeLabels,
  measureCanvasSvg,
  type ServedWeights,
  sliceCanvasSvg,
  weighServedRelations,
} from "@canonical/prism-lens-definitions/testing/browser";
import type { Browser } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DEV_READY_MS, GRAPH_READY_MS, PAGE_SETTLE_MS } from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

let graph: RunningServer;
let server: RunningServer;
let browser: Browser;

const served: { weights?: ServedWeights; prefixes?: readonly string[] } = {};
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
    served.weights = weighServedRelations(answer);
    served.prefixes = answer.ontologies.map((ontology) => ontology.prefix);
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

  it("measures section C at the design canvas: the fit at the legible floor or above, every node and region on the 16px lattice", () => {
    for (const [path, measure] of measureViews()) {
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
});
