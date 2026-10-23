/**
 * The strip's guard over a COLD store: a tenant that suspends on the store
 * renders nothing instead of suspending the whole layout.
 */

import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import createStripHarness from "../../../../../../testing/createStripHarness.js";
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

  it("renders nothing for a tenant whose graph did not answer", () => {
    function Broken(): never {
      throw new Error("the graph did not answer");
    }
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <SocketGuard fallback={<p>Loading</p>}>
        <Broken />
      </SocketGuard>,
    );
    expect(container).toBeEmptyDOMElement();
    error.mockRestore();
  });
});
