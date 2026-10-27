import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SERIES_90_SIX_CAR } from "../../../../../testing/fixtures.js";
import orientCars from "../orientCars.js";
import FormationStack from "./FormationStack.js";

describe("FormationStack SSR", () => {
  it("renders its trains on the server", () => {
    const html = renderToString(
      <FormationStack
        trains={[{ key: "six", cars: orientCars(SERIES_90_SIX_CAR) }]}
      />,
    );
    expect(html).toContain('class="ds formation-stack"');
    expect(html).toContain('class="ds formation-side-view formation"');
  });
});
