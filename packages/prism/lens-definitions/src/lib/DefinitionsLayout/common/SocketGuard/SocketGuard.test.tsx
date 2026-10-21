/**
 * The strip's guard over a COLD store: a tenant that suspends on the store
 * renders nothing instead of suspending the whole layout.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../testing/createStripHarness.js";
import { Controls } from "../Controls/index.js";
import { Status } from "../Status/index.js";
import { SocketGuard } from "./index.js";

describe("SocketGuard", () => {
  it("degrades its tenant to an empty socket on a cold store", () => {
    const html = renderToString(
      createStripHarness(
        "/definitions",
        undefined,
        createFetchSpy(),
        <>
          <p>Strip band</p>
          <SocketGuard>
            <Controls />
          </SocketGuard>
          <SocketGuard>
            <Status />
          </SocketGuard>
        </>,
      ),
    );

    // Rendered without throwing: the band stays, the sockets are empty.
    expect(html).toContain("Strip band");
    expect(html).not.toContain('data-slot="explorer-controls"');
    expect(html).not.toContain('data-slot="explorer-status"');
  });
});
