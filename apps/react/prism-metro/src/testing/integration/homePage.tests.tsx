import { setPrefetchEnvironment } from "@canonical/prism-core";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import renderLensPage from "../../../testing/renderLensPage.js";
import startMetroGraph from "../../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../../testing/types.js";
import formatDocumentTitle from "../../formatDocumentTitle.js";

// The landing renders with its counts from the metro provider, over a real
// socket, and its doors open the lenses on the client.

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => graph.close());

/** The landing's door for the lens named `label`, once it has its count. */
const findDoor = async (label: string): Promise<HTMLElement> => {
  const heading = await screen.findByRole("heading", { level: 2, name: label });
  const door = heading.closest<HTMLElement>(".lens-card");
  if (door === null) throw new Error(`No door holds the heading "${label}"`);
  return door;
};

describe("the landing", () => {
  it("opens a lens from its door on the client", async () => {
    renderLensPage("/", graph.url);
    const door = await findDoor(MESSAGES["lens.stations"]);
    // The router took the click: the browser's own navigation was prevented
    // and the stations index rendered in place.
    expect(fireEvent.click(within(door).getByRole("link"))).toBe(false);
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: MESSAGES["lens.stations"],
      }),
    ).toBeInTheDocument();
  });

  it("names itself in the document title", async () => {
    renderLensPage("/", graph.url);
    await findDoor(MESSAGES["lens.stations"]);
    await waitFor(() => {
      expect(document.title).toBe(formatDocumentTitle(MESSAGES["home.title"]));
    });
  });
});
