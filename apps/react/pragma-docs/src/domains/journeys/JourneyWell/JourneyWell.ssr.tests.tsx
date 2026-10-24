/**
 * The SSR keystone for this lens: the well renders its FULL node and edge
 * SVG to a string, with no browser API in the path, because every position
 * comes from the deterministic layout and the component holds no
 * client-only state.
 */

import { createStaticRouter } from "@canonical/prism-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { appRoutes, middleware, notFoundRoute } from "../../../routes.js";
import { JOURNEY_MODEL } from "../__fixtures__/journeyModel.js";
import JourneyWell from "./JourneyWell.js";

const renderWell = (job: string | undefined): string =>
  renderToString(
    <RouterProvider
      router={createStaticRouter(appRoutes, "/journeys", {
        middleware: [...middleware],
        notFound: notFoundRoute,
      })}
    >
      <JourneyWell coordinates={JOURNEY_MODEL} job={job} />
    </RouterProvider>,
  );

describe("JourneyWell SSR", () => {
  it("renders the node AND edge DOM to a string", () => {
    const html = renderWell(undefined);
    expect(html).toContain('data-slot="journeys-canvas"');
    // All eleven hops, server-rendered.
    expect((html.match(/<g class="hop[ "]/g) ?? []).length).toBe(11);
    // Edges too: their paths are computed from the layout, no measurement.
    expect(html).toContain('<g class="edges">');
    expect(html).toMatch(/<path class="edge[ "][^>]* d="M /);
    // The camera's transform is the client's to write.
    expect(html).toContain('<g class="camera">');
  });

  it("server-renders the selection, because it comes from the URL", () => {
    // Selection is URL state, identical on both sides, so it belongs in
    // the first paint rather than arriving after hydration.
    expect(renderWell(JOURNEY_MODEL[0]?.jobs[0]?.uri)).toContain("is-selected");
    expect(renderWell(undefined)).not.toContain("is-selected");
  });

  it("is byte-identical across repeated renders — the hydration contract", () => {
    // The property the hydration suite depends on, asserted directly: two
    // renders of the same props produce the same bytes. Were any position
    // measured, or any state client-only, this would drift.
    expect(renderWell(undefined)).toBe(renderWell(undefined));
  });
});
