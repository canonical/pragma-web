import { describe, expect, it } from "vitest";
import { renderDecorated } from "../../../testing/index.js";
import withFlexColumn from "./withFlexColumn.js";

describe("withFlexColumn", () => {
  it("renders the story in a column flex box of the given height", () => {
    const column = renderDecorated(withFlexColumn("16rem"));
    expect(column?.style.display).toBe("flex");
    expect(column?.style.flexDirection).toBe("column");
    expect(column?.style.height).toBe("16rem");
  });
});
