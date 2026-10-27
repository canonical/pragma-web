import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { RelayEnvironmentProvider } from "react-relay";
import { describe, expect, it } from "vitest";
import FleetFacts from "./FleetFacts.js";

describe("FleetFacts SSR", () => {
  it("renders no section before the data", () => {
    const html = renderToString(
      <RelayEnvironmentProvider
        environment={createEnvironment({
          fetchFn: () => new Promise<never>(() => {}),
        })}
      >
        <FleetFacts address="metro:series-90" kind="stock" />
      </RelayEnvironmentProvider>,
    );
    expect(html).not.toContain("<section");
    expect(html).not.toContain("Facts</h2>");
  });
});
