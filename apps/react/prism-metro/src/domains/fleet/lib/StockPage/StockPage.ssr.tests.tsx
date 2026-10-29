import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import { SERIES_90_CURIE } from "../../../../../testing/fixtures.js";
import StockPage from "./StockPage.js";

describe("StockPage SSR", () => {
  it("renders its article, and its loading line before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <StockPage address={SERIES_90_CURIE} />
      </RelayEnvironmentProvider>,
    );
    expect(html).toContain('class="ds stock-page"');
    expect(html).toContain("Loading…");
  });
});
