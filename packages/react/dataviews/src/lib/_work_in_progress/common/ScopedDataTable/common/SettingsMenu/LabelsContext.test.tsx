import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import LabelsContext from "./LabelsContext.js";

/** Shows the label the context holds for one key. */
const ReadLabel = ({ itemKey }: { readonly itemKey: string }) => (
  <output>{useContext(LabelsContext).get(itemKey)}</output>
);

describe("LabelsContext", () => {
  it("holds no labels outside a settings menu", () => {
    render(<ReadLabel itemKey="reset" />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("hands each item's content to the label under it", () => {
    render(
      <LabelsContext value={new Map([["reset", <em key="r">Reset</em>]])}>
        <ReadLabel itemKey="reset" />
      </LabelsContext>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Reset");
  });
});
