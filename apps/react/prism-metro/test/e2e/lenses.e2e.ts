// @vitest-environment node

/**
 * The landing and the three lenses against the metro provider, end to end:
 * the metro graph in its own process, and each server-rendering web cell
 * pointed at it. Each page is fetched as a crawler would, so what is
 * asserted is the HTML the server rendered from the data it prepared.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { LINE_COUNT, STATION_COUNT } from "../../testing/fixtures.js";
import { DEV_READY_MS, GRAPH_READY_MS, PREVIEW_READY_MS } from "./constants.js";
import startServer from "./startServer.js";
import type { RunningServer } from "./types.js";

const CWD = process.cwd();

/** The bootstrap script the renderer embeds the initial data with. */
const INITIAL_DATA_PATTERN = /window\.__INITIAL_DATA__ = (.*?)<\/script>/s;

/** An instance chip of the term inspector, linking to the stations lens. */
const INSTANCE_CHIP_PATTERN =
  /<a class="ds router-link title" href="(\/stations\/metro%3A[\w-]+)">([^<]+)<\/a>/;

const CELLS = [
  { script: "dev:bun", timeoutMs: DEV_READY_MS },
  { script: "preview:bun", timeoutMs: PREVIEW_READY_MS },
] as const;

let graph: RunningServer;
const servers = new Map<string, RunningServer>();

/**
 * Fetch `path` from the cell's server.
 *
 * @returns The status and the document.
 * @note Impure: performs a network request.
 */
const fetchPage = async (
  script: string,
  path: string,
): Promise<{ readonly status: number; readonly html: string }> => {
  const server = servers.get(script);
  if (server === undefined) {
    throw new Error(`${script} is not running`);
  }
  const response = await fetch(new URL(path, server.base));
  return { status: response.status, html: await response.text() };
};

beforeAll(
  async () => {
    graph = await startServer("graph", CWD, {
      timeoutMs: GRAPH_READY_MS,
      portEnv: "GRAPH_PORT",
      hostname: "127.0.0.1",
    });
    for (const { script, timeoutMs } of CELLS) {
      servers.set(
        script,
        await startServer(script, CWD, {
          timeoutMs,
          env: { VITE_GRAPHQL_URL: `${graph.base}/graphql` },
        }),
      );
    }
  },
  GRAPH_READY_MS + DEV_READY_MS + PREVIEW_READY_MS,
);

afterAll(async () => {
  for (const server of servers.values()) {
    await server.stop();
  }
  await graph.stop();
});

describe.each(CELLS)("$script over the metro graph", ({ script }) => {
  it("renders the landing with a door and a count per lens", async () => {
    const { status, html } = await fetchPage(script, "/");
    expect(status).toBe(200);
    const doors = html.split('class="ds card ds lens-card"').slice(1);
    expect(doors).toHaveLength(3);
    expect(doors.at(0)).toContain('href="/stations"');
    expect(doors.at(1)).toContain('href="/lines"');
    expect(doors.at(2)).toContain('href="/definitions"');
    expect(html).toContain(
      `<data value="${STATION_COUNT}">${STATION_COUNT} stations</data>`,
    );
    expect(html).toContain(
      `<data value="${LINE_COUNT}">${LINE_COUNT} lines</data>`,
    );
    const embedded = INITIAL_DATA_PATTERN.exec(html)?.at(1);
    const records = JSON.parse(String(embedded)).relay?.records ?? {};
    expect(Object.keys(records).length).toBeGreaterThan(0);
  });

  it("renders the stations index with its data", async () => {
    const { status, html } = await fetchPage(script, "/stations");
    expect(status).toBe(200);
    expect(html).toContain('href="/stations/metro%3Anorthgate">Northgate</a>');
    const embedded = INITIAL_DATA_PATTERN.exec(html)?.at(1);
    const records = JSON.parse(String(embedded)).relay?.records ?? {};
    expect(Object.keys(records).length).toBeGreaterThan(0);
  });

  it("renders a station's page with its fields", async () => {
    const { status, html } = await fetchPage(
      script,
      "/stations/metro%3Anorthgate",
    );
    expect(status).toBe(200);
    expect(html).toMatch(/<h1[^>]*>Northgate<\/h1>/);
    expect(html).toContain('class="ds field-list"');
  });

  it("renders the lines index with the line rows", async () => {
    const { status, html } = await fetchPage(script, "/lines");
    expect(status).toBe(200);
    expect(html).toMatch(
      /<li class="ds entity-row ds node-row ds line-row"[^>]*>.*?Circle Line/s,
    );
  });

  it("renders the Definitions lens with the ontology's terms", async () => {
    const { status, html } = await fetchPage(script, "/definitions");
    expect(status).toBe(200);
    expect(html).toMatch(
      /class="ds term-rail".*?href="\/definitions\/metro%3AStation">Station<\/a>/s,
    );
    const embedded = INITIAL_DATA_PATTERN.exec(html)?.at(1);
    const records = JSON.parse(String(embedded)).relay?.records ?? {};
    expect(Object.keys(records).length).toBeGreaterThan(0);
  });

  it("lands an instance chip of the term inspector on the stations lens", async () => {
    const { status, html } = await fetchPage(
      script,
      "/definitions/metro%3AStation",
    );
    expect(status).toBe(200);
    expect(html).toContain('class="ds term-inspector"');
    const chip = INSTANCE_CHIP_PATTERN.exec(html);
    expect(chip, "the inspector should mention a station").not.toBeNull();
    const [, href, title] = chip ?? [];
    const landing = await fetchPage(script, String(href));
    expect(landing.status).toBe(200);
    expect(landing.html).toContain(String(title));
  });

  it.each(["/nowhere", "/stations/%ZZ", "/definitions/%E0%A4%A"])(
    "answers %s with 404",
    async (path) => {
      const { status } = await fetchPage(script, path);
      expect(status).toBe(404);
    },
  );
});
