/**
 * The well's camera, driven through the real page over the captured
 * records: a drag that starts on the floor pans the diagram, a press on a
 * node is a click and never pans, and the wheel zooms toward the cursor
 * within the zoom bounds.
 */

import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createDefinitionsPage from "../../../testing/createDefinitionsPage.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  DEFINITIONS_TEST_TIMEOUT_MS,
  UIBLOCK_TERM,
} from "../../../testing/fixtures.js";
import definitionsExplorerRecords from "../../../testing/records/definitionsExplorerRecords.js";

/** Mount the page and return the well's canvas and camera layer. */
const renderCamera = (): { canvas: HTMLElement; camera: HTMLElement } => {
  const { container } = render(
    createDefinitionsPage(
      UIBLOCK_TERM,
      definitionsExplorerRecords,
      createFetchSpy(),
    ),
  );
  const canvas = container.querySelector<HTMLElement>(
    ".ds.hierarchy-well .canvas",
  );
  const camera = container.querySelector<HTMLElement>(
    ".ds.hierarchy-well .camera",
  );
  if (canvas === null || camera === null) {
    throw new Error("the well rendered no canvas");
  }
  return { canvas, camera };
};

/** Read the camera's translate and scale off its transform. */
const readCamera = (camera: HTMLElement) => {
  const match = camera.style.transform.match(
    /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([-\d.e]+)\)/,
  );
  if (match === null) {
    throw new Error(`unexpected transform "${camera.style.transform}"`);
  }
  return { x: Number(match[1]), y: Number(match[2]), k: Number(match[3]) };
};

describe("HierarchyWell camera", () => {
  // jsdom implements no pointer capture; the well captures on pan start.
  const original = HTMLElement.prototype.setPointerCapture;
  beforeEach(() => {
    HTMLElement.prototype.setPointerCapture = vi.fn();
  });
  afterEach(() => {
    HTMLElement.prototype.setPointerCapture = original;
  });

  it("pans on a drag from the floor, and not from a node", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { canvas, camera } = renderCamera();
    const start = readCamera(camera);

    const node = canvas.querySelector(".ds.term-node a");
    if (node === null) throw new Error("the well drew no node");
    fireEvent.pointerDown(node, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 30 });
    expect(readCamera(camera)).toEqual(start);

    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 40 });
    fireEvent.pointerUp(canvas);
    expect(readCamera(camera)).toEqual({
      ...start,
      x: start.x + 40,
      y: start.y + 30,
    });

    // Released: a further move no longer pans.
    fireEvent.pointerMove(canvas, { clientX: 90, clientY: 90 });
    expect(readCamera(camera).x).toBe(start.x + 40);
  });

  it("zooms toward the cursor on the wheel, within its bounds", {
    timeout: DEFINITIONS_TEST_TIMEOUT_MS,
  }, () => {
    const { canvas, camera } = renderCamera();
    const start = readCamera(camera);

    fireEvent.wheel(canvas, { clientX: 0, clientY: 0, deltaY: -100 });
    const zoomed = readCamera(camera);
    expect(zoomed.k).toBeGreaterThan(start.k);
    // The point under the cursor (the canvas origin) stays put.
    expect(zoomed.x).toBeCloseTo(start.x * (zoomed.k / start.k));

    for (let step = 0; step < 40; step += 1) {
      fireEvent.wheel(canvas, { clientX: 0, clientY: 0, deltaY: -500 });
    }
    expect(readCamera(camera).k).toBe(2);
    for (let step = 0; step < 80; step += 1) {
      fireEvent.wheel(canvas, { clientX: 0, clientY: 0, deltaY: 500 });
    }
    expect(readCamera(camera).k).toBe(0.25);
  });
});
