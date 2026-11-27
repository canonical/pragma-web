import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import useWindowFitment from "./useWindowFitment.js";

/** Prints what the hook gives on the server. */
const Probe = () => {
  const { bestPosition, direction, popupPositionStyle } = useWindowFitment({
    preferredDirections: ["block-end"],
  });
  return (
    <p>
      {direction} {String(bestPosition)} {popupPositionStyle.top}
    </p>
  );
};

describe("useWindowFitment SSR", () => {
  it("reads left-to-right and places nothing on the server", () => {
    expect(renderToString(<Probe />)).toBe(
      "<p>ltr<!-- --> <!-- -->undefined<!-- --> <!-- -->0</p>",
    );
  });
});
