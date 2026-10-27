import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import { SERIES_90_DRIVING_CURIE } from "../../../../../testing/fixtures.js";
import CarTypePage from "./CarTypePage.js";

describe("CarTypePage SSR", () => {
  it("renders its article, and its loading line before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <CarTypePage address={SERIES_90_DRIVING_CURIE} />
      </RelayEnvironmentProvider>,
    );
    expect(html).toContain('class="ds car-type-page"');
    expect(html).toContain("Loading…");
  });
});
