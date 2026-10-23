// @vitest-environment node

import { describe, expect, it } from "vitest";
import createMetroExecute from "../../../../testing/createMetroExecute.js";
import { METRO_NAMESPACE } from "../../../../testing/fixtures.js";
import networkStationQueryNode, {
  type NetworkStationQuery$data,
} from "../../../relay/__generated__/NetworkStationQuery.graphql.js";
import readStationView from "./readStationView.js";

/** Read the node at `local` through the station query. */
const readNode = async (
  local: string,
): Promise<NonNullable<NetworkStationQuery$data["node"]>> => {
  const { data } = await createMetroExecute()(
    networkStationQueryNode.params.text as string,
    { id: `${METRO_NAMESPACE}${local}` },
  );
  return (data as unknown as NetworkStationQuery$data).node as NonNullable<
    NetworkStationQuery$data["node"]
  >;
};

describe("readStationView", () => {
  it("reads an interchange's facts", async () => {
    const view = readStationView(await readNode("central-exchange"));
    expect(view).toMatchObject({
      curie: "metro:central-exchange",
      title: "Central Exchange",
      kind: "Interchange",
      zone: "Central Zone",
      platformCount: 8,
      transferMinutes: 4,
    });
  });

  it("finds the stops either side on every route of every line", async () => {
    const view = readStationView(await readNode("tannery-lane"));
    expect(view?.routes).toHaveLength(6);
    expect(
      view?.routes.find((route) => route.label === "Clockwise"),
    ).toMatchObject({
      line: { curie: "metro:circle-line", code: "2", colour: "#f2b705" },
      previous: { curie: "metro:quarry-hill", title: "Quarry Hill" },
      next: { curie: "metro:willowbank", title: "Willowbank" },
    });
  });

  it("leaves the open side of a terminus empty", async () => {
    const view = readStationView(await readNode("northgate"));
    const southbound = view?.routes.find(
      (route) => route.label === "To Marsh End",
    );
    expect(southbound?.previous).toBeUndefined();
    expect(southbound?.next?.title).toBe("Verge Park");
    expect(view?.kind).toBe("Station");
    expect(view?.transferMinutes).toBeUndefined();
  });

  it("reads no view of a node that is not a station", async () => {
    expect(readStationView(await readNode("circle-line"))).toBeUndefined();
  });

  it("leaves out a route that does not call at the station", async () => {
    const node = await readNode("tannery-lane");
    const elsewhere = {
      ...node,
      uri: `${METRO_NAMESPACE}nowhere`,
    } as typeof node;
    expect(readStationView(elsewhere)?.routes).toEqual([]);
  });

  it("reads a station with no zone, platforms or lines", async () => {
    const node = await readNode("tannery-lane");
    const bare = {
      ...node,
      __typename: "Station",
      inZone: null,
      platformCount: null,
      servesLine: [],
    } as unknown as typeof node;
    expect(readStationView(bare)).toMatchObject({
      zone: undefined,
      platformCount: undefined,
      routes: [],
    });
  });
});
