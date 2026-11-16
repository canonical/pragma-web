import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LabelsContext from "../../LabelsContext.js";
import ItemLabel from "./ItemLabel.js";

describe("ItemLabel", () => {
  it("renders the content the menu keeps for its item's key", () => {
    const { container } = render(
      <LabelsContext
        value={new Map([["hide:status", <em key="s">Status</em>]])}
      >
        <ItemLabel item={{ key: "hide:status" }} />
      </LabelsContext>,
    );
    expect(container.querySelector(".label > em")).toHaveTextContent("Status");
  });

  it("renders an empty label for a key the menu keeps nothing for", () => {
    const { container } = render(<ItemLabel item={{ key: "reset" }} />);
    expect(container.querySelector(".label")).toBeEmptyDOMElement();
  });
});
