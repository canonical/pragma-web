import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import { SERIES_90_UNIT_CURIE } from "../../../../../testing/fixtures.js";
import UnitPage from "./UnitPage.js";

describe("UnitPage SSR", () => {
  it("renders its article, and its loading line before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <UnitPage address={SERIES_90_UNIT_CURIE} />
      </RelayEnvironmentProvider>,
    );
    expect(html).toContain('class="ds unit-page"');
    expect(html).toContain("Loading…");
  });
});
