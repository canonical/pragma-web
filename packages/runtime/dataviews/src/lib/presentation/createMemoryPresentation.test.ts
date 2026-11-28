import { describe, expect, it } from "vitest";
import createMemoryPresentation from "./createMemoryPresentation.js";

describe("createMemoryPresentation", () => {
  it("keeps an arrangement in memory, on no view and saved nowhere", () => {
    const presentation = createMemoryPresentation();
    presentation.arrange({ "table.t.hidden": ["owner"] });
    expect(presentation.state.get().presentation).toEqual({
      "table.t.hidden": ["owner"],
    });
    expect(presentation.state.get().presentationReason).toBeNull();
  });
});
