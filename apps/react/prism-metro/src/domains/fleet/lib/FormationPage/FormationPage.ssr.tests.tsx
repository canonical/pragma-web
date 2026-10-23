import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import { SERIES_90_SIX_CAR_CURIE } from "../../../../../testing/fixtures.js";
import FormationPage from "./FormationPage.js";

describe("FormationPage SSR", () => {
  it("renders its article, and its loading line before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <FormationPage address={SERIES_90_SIX_CAR_CURIE} />
      </RelayEnvironmentProvider>,
    );
    expect(html).toContain('class="ds formation-page"');
    expect(html).toContain("Loading…");
  });
});
