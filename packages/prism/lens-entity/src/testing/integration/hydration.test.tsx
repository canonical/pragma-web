/**
 * The browser hydrates the server's markup from the records the server
 * serialised, without a request and without a mismatch: the store answers
 * every read, and the layout's strip renders the same on both sides.
 */

import { createEnvironment } from "@canonical/prism-core";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATIONS_BINDING,
} from "../../../testing/fixtures.js";
import renderServerMarkup from "../../../testing/renderServerMarkup.js";

const LAYOUT = { binding: STATIONS_BINDING, label: "Stations" } as const;

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

/** Hydrate the server's markup for `url` and report what it cost. */
const hydrate = async (url: string) => {
  const { html, records } = await renderServerMarkup(url, LAYOUT);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const consoleError = vi.spyOn(console, "error");
  const recoverableErrors: unknown[] = [];
  const fetchFn = createFetchSpy();
  const environment = createEnvironment({ records, fetchFn });

  const root = await act(async () =>
    hydrateRoot(
      container,
      createEntitySite({ url, environment, layout: LAYOUT }),
      {
        onRecoverableError: (error) => {
          recoverableErrors.push(error);
        },
      },
    ),
  );
  act(() => {
    root.unmount();
  });
  return { consoleError, fetchFn, recoverableErrors };
};

describe("hydration", () => {
  it.each([
    ["the stations index", "/stations"],
    ["a station's page", "/stations/metro%3Anorthgate"],
  ])(
    "hydrates %s with no request and no mismatch",
    {
      timeout: ENTITY_TEST_TIMEOUT_MS,
    },
    async (_name, url) => {
      const { consoleError, fetchFn, recoverableErrors } = await hydrate(url);

      expect(fetchFn).not.toHaveBeenCalled();
      expect(recoverableErrors).toEqual([]);
      expect(consoleError).not.toHaveBeenCalled();
    },
  );
});
