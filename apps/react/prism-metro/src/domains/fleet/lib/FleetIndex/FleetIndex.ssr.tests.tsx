import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import FleetIndex from "./FleetIndex.js";

describe("FleetIndex SSR", () => {
  it("renders its heading, and its loading line before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <FleetIndex />
      </RelayEnvironmentProvider>,
    );
    expect(html).toContain('class="ds fleet-index"');
    expect(html).toContain("Fleet</h1>");
    expect(html).toContain("Loading the fleet…");
  });
});
