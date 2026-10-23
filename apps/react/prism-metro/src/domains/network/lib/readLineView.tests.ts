// @vitest-environment node

import { describe, expect, it } from "vitest";
import createMetroExecute from "../../../../testing/createMetroExecute.js";
import { METRO_NAMESPACE } from "../../../../testing/fixtures.js";
import networkLineQueryNode, {
  type NetworkLineQuery$data,
} from "../../../relay/__generated__/NetworkLineQuery.graphql.js";
import readLineView from "./readLineView.js";

/** Read the node at `local` through the line query. */
const readNode = async (
  local: string,
): Promise<NonNullable<NetworkLineQuery$data["node"]>> => {
  const { data } = await createMetroExecute()(
    networkLineQueryNode.params.text as string,
    { id: `${METRO_NAMESPACE}${local}` },
  );
  return (data as unknown as NetworkLineQuery$data).node as NonNullable<
    NetworkLineQuery$data["node"]
  >;
};

describe("readLineView", () => {
  it("pairs a loop run both ways into one strip with its reverse", async () => {
    const view = readLineView(await readNode("circle-line"));
    expect(view).toMatchObject({
      curie: "metro:circle-line",
      title: "Circle Line",
      code: "2",
      colour: "#f2b705",
      isLoop: true,
      stopCount: 6,
      ends: undefined,
    });
    expect(view?.strips).toHaveLength(1);
    expect(view?.strips.at(0)?.label).toBe("Clockwise");
    expect(view?.strips.at(0)?.reverse?.label).toBe("Anticlockwise");
  });

  it("lists the interchanges in the first route's order", async () => {
    const view = readLineView(await readNode("circle-line"));
    expect(view?.interchanges).toEqual([
      {
        curie: "metro:central-exchange",
        title: "Central Exchange",
        transferMinutes: 4,
      },
      {
        curie: "metro:tannery-lane",
        title: "Tannery Lane",
        transferMinutes: 3,
      },
      {
        curie: "metro:riverside-junction",
        title: "Riverside Junction",
        transferMinutes: 7,
      },
    ]);
  });

  it("shows each stop's other lines, never its own", async () => {
    const view = readLineView(await readNode("circle-line"));
    const central = view?.strips.at(0)?.stops.at(0);
    expect(central?.isInterchange).toBe(true);
    expect(central?.connections.map((line) => line.code)).toEqual(["1", "3"]);
  });

  it("names a linear line's two ends", async () => {
    const view = readLineView(await readNode("north-line"));
    expect(view?.isLoop).toBe(false);
    expect(view?.ends).toEqual([
      { curie: "metro:northgate", title: "Northgate" },
      { curie: "metro:marsh-end", title: "Marsh End" },
    ]);
    expect(view?.strips.at(0)?.reverse?.label).toBe("To Northgate");
  });

  it("draws a ring line with no reverse as one strip alone", async () => {
    const view = readLineView(await readNode("ringway-clockwise"));
    expect(view?.strips).toHaveLength(1);
    expect(view?.strips.at(0)?.reverse).toBeUndefined();
  });

  it("reads no view of a node that is not a line", async () => {
    expect(readLineView(await readNode("northgate"))).toBeUndefined();
  });

  it("reads a line with no routes as one with no strips", async () => {
    const node = await readNode("north-line");
    const empty = { ...node, routes: [] } as typeof node;
    expect(readLineView(empty)).toMatchObject({
      isLoop: false,
      strips: [],
      stopCount: 0,
      ends: undefined,
      interchanges: [],
    });
  });
});
