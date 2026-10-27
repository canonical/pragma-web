// Scaffolded by @canonical/summon-component:react v0.43.0

import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { ProjectionsProvider } from "@canonical/prism-projections";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import { metroProjectionMaps } from "#domains/metro";
import {
  createRecordedEnvironment,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import { homes } from "../../../../homes.js";
import { appRoutes } from "../../../../routes.js";
import RouteStrip from "./RouteStrip.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

describe("RouteStrip SSR", () => {
  it("renders both directions and no toggle without script", () => {
    const circle = readRecordedLine(RECORDED, "circle-line");
    const html = renderToString(
      <RouterProvider
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/network"),
        })}
      >
        <RelayEnvironmentProvider environment={RECORDED}>
          <HomesProvider homes={homes}>
            <ProjectionsProvider
              LinkComponent={RouterLink}
              maps={metroProjectionMaps}
            >
              <RouteStrip
                colour={circle.colour}
                lineUri={circle.uri}
                node={
                  (circle.strips.at(0) as (typeof circle.strips)[number]).route
                }
              />
            </ProjectionsProvider>
          </HomesProvider>
        </RelayEnvironmentProvider>
      </RouterProvider>,
    );
    expect(html).toContain(">Clockwise</h2>");
    expect(html).toContain(">Anticlockwise</h2>");
    expect(html).not.toContain("<button");
    expect(html).toContain('href="/network/stations/metro%3Akilnwood"');
  });
});
