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
  readRecordedCalls,
  readRecordedLine,
} from "../../../../../testing/readRecordedViews.js";
import { homes } from "../../../../homes.js";
import { appRoutes } from "../../../../routes.js";
import CallStop from "./CallStop.js";

/** The environment the recorded answers are read from and rendered in. */
const RECORDED = createRecordedEnvironment();

describe("CallStop SSR", () => {
  it("renders an interchange's ring, link and transfer on the server", () => {
    const north = readRecordedLine(RECORDED, "north-line");
    const central = readRecordedCalls(RECORDED, "north-line")[3];
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
              <ol>
                {central === undefined ? null : (
                  <CallStop
                    colour={north.colour}
                    lineUri={north.uri}
                    node={central}
                  />
                )}
              </ol>
            </ProjectionsProvider>
          </HomesProvider>
        </RelayEnvironmentProvider>
      </RouterProvider>,
    );
    expect(html).toContain('class="ds call-stop"');
    expect(html).toContain('class="ring"');
    expect(html).toContain('href="/network/stations/metro%3Acentral-exchange"');
    expect(html).toContain("4 min transfer");
  });
});
