import { cleanup, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import renderRefusingTable from "./renderRefusingTable.js";

afterEach(cleanup);

describe("renderRefusingTable", () => {
  it("draws a table sorted by Name whose Status, added with Shift, is refused", () => {
    const { provider, status, findReason } = renderRefusingTable();
    expect(provider.state.get().slice.sort).toEqual([
      { field: "name", direction: "asc" },
    ]);
    expect(findReason()).toHaveTextContent("");
    fireEvent.click(status, { shiftKey: true });
    expect(findReason()?.textContent).not.toBe("");
  });

  it("finds no reason once the table is gone", () => {
    const { findReason } = renderRefusingTable();
    cleanup();
    expect(findReason()).toBeNull();
  });
});
