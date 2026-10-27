import { describe, expect, it } from "vitest";
import computeRevealTransform from "./computeRevealTransform.js";

const VISIBLE = { x: 0, y: 0, width: 800, height: 600 };
const IDENTITY = { k: 1, x: 0, y: 0 };

describe("computeRevealTransform", () => {
  it("leaves the camera alone when the box is fully in view", () => {
    expect(
      computeRevealTransform(VISIBLE, IDENTITY, {
        x: 100,
        y: 100,
        width: 96,
        height: 32,
      }),
    ).toBeUndefined();
  });

  it("centres a box that is out of view, at the same zoom", () => {
    expect(
      computeRevealTransform(
        VISIBLE,
        { k: 2, x: 0, y: 0 },
        {
          x: 600,
          y: 400,
          width: 100,
          height: 50,
        },
      ),
    ).toEqual({ k: 2, x: 400 - 2 * 650, y: 300 - 2 * 425 });
  });

  it("centres a box that is only partly in view", () => {
    expect(
      computeRevealTransform(VISIBLE, IDENTITY, {
        x: 780,
        y: 0,
        width: 40,
        height: 20,
      }),
    ).toEqual({ k: 1, x: 400 - 800, y: 300 - 10 });
  });
});
