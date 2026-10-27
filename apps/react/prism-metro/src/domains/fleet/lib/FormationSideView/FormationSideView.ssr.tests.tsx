import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SERIES_90_SIX_CAR } from "../../../../../testing/fixtures.js";
import orientCars from "../orientCars.js";
import FormationSideView from "./FormationSideView.js";

describe("FormationSideView SSR", () => {
  it("renders the drawing and its text on the server", () => {
    const html = renderToString(
      <FormationSideView cars={orientCars(SERIES_90_SIX_CAR)} />,
    );
    expect(html).toContain('class="ds formation-side-view"');
    expect(html).toContain('<svg aria-hidden="true" class="drawing"');
    expect(html.match(/<path class="car"/g)).toHaveLength(6);
    expect(html).toContain("Unit 2");
  });
});
