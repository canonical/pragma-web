// @vitest-environment node

import { describe, expect, it } from "vitest";
import buildNetworkLines from "../../../../testing/buildNetworkLines.js";
import createMetroExecute from "../../../../testing/createMetroExecute.js";
import networkMapQueryNode, {
  type NetworkMapQuery$data,
} from "../../../relay/__generated__/NetworkMapQuery.graphql.js";
import buildNetworkMapVariables from "../buildNetworkMapVariables.js";
import type { DiagramLine } from "./geometry/index.js";
import readDiagramLines from "./readDiagramLines.js";

/** Run the map query against the metro provider. */
const readMap = async (): Promise<NetworkMapQuery$data> => {
  const { data } = await createMetroExecute()(
    networkMapQueryNode.params.text as string,
    buildNetworkMapVariables(),
  );
  return data as unknown as NetworkMapQuery$data;
};

/** A line node as the map query reads it, with `overrides` applied. */
const makeLineNode = (overrides: Record<string, unknown>) => ({
  node: {
    uri: "urn:line",
    _meta: { title: "Line", curie: "metro:line" },
    code: "9",
    colour: "#000000",
    routes: [],
    ...overrides,
  },
});

/** A stop as a call reads it, at `x`, `y` or with no position. */
const makeCall = (
  position: number,
  name: string,
  place?: [number, number],
) => ({
  position,
  stop: {
    uri: `urn:${name}`,
    __typename: "Station",
    _meta: { title: name, curie: `metro:${name}` },
    diagramPosition: place ? { x: place[0], y: place[1] } : null,
  },
});

describe("readDiagramLines", () => {
  it("reads the graph's network as the diagram fixtures state it", async () => {
    // The graph serves instances in IRI order; the fixtures in authored order.
    const byUri = (lines: readonly DiagramLine[]) =>
      [...lines].sort((a, b) => a.uri.localeCompare(b.uri));
    expect(byUri(readDiagramLines(await readMap()))).toEqual(
      byUri(buildNetworkLines()),
    );
  });

  it("reads no lines when the graph does not know the line class", () => {
    expect(readDiagramLines({ ontologyClass: null })).toEqual([]);
  });

  it("skips an instance that is not a line", () => {
    const data = {
      ontologyClass: {
        instances: {
          edges: [
            makeLineNode({ code: undefined }),
            makeLineNode({ colour: undefined }),
            makeLineNode({ routes: undefined }),
          ],
        },
      },
    } as unknown as NetworkMapQuery$data;
    expect(readDiagramLines(data)).toEqual([]);
  });

  it("orders calls by position and leaves off stops with no place", () => {
    const route = {
      label: "Out",
      isLoop: false,
      reverse: null,
      calls: [
        makeCall(3, "c", [2, 0]),
        makeCall(1, "a", [0, 0]),
        makeCall(2, "b"),
      ],
    };
    const data = {
      ontologyClass: {
        instances: { edges: [makeLineNode({ routes: [route] })] },
      },
    } as unknown as NetworkMapQuery$data;
    const [line] = readDiagramLines(data);
    expect(line?.routes.at(0)?.stops.map((stop) => stop.title)).toEqual([
      "a",
      "c",
    ]);
    expect(line?.routes.at(0)?.reverseLabel).toBeNull();
  });

  it("does not draw a route left with fewer than two placed stops", () => {
    const route = {
      label: "Out",
      isLoop: false,
      reverse: null,
      calls: [makeCall(1, "a", [0, 0]), makeCall(2, "b")],
    };
    const data = {
      ontologyClass: {
        instances: { edges: [makeLineNode({ routes: [route] })] },
      },
    } as unknown as NetworkMapQuery$data;
    expect(readDiagramLines(data).at(0)?.routes).toEqual([]);
  });
});
