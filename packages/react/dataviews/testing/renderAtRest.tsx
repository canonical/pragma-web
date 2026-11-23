import { waitForState } from "@canonical/dataviews-core/testing";
import {
  act,
  getConfig,
  type RenderResult,
  render,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";
import subscribeToBusy from "./subscribeToBusy.js";

/**
 * Render `ui`, then resolve once its container holds no element marked
 * `aria-busy="true"`. Rejects under a fake clock, which would stall the
 * wait's drain.
 *
 * @note Impure: renders into the document and observes its mutations.
 */
export default async function renderAtRest(
  ui: ReactElement,
): Promise<RenderResult> {
  if (vi.isFakeTimers()) {
    throw new Error("renderAtRest needs the real clock");
  }
  const rendered = await act(async () => render(ui));
  const { container } = rendered;
  await getConfig().asyncWrapper(() =>
    waitForState(
      subscribeToBusy(container),
      // Cleanup removes the container, and an empty one is not at rest.
      () =>
        container.isConnected &&
        container.querySelector('[aria-busy="true"]') === null,
      "no busy element in the render",
    ),
  );
  return rendered;
}
