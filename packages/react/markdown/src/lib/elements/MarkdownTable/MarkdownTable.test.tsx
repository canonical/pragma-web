import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MarkdownTable from "./MarkdownTable.js";

describe("MarkdownTable", () => {
  it("renders a table with the consumer's class last", () => {
    const { container } = render(
      <MarkdownTable className="custom" node={{}}>
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </MarkdownTable>,
    );

    const table = container.querySelector("table");
    expect(table?.className).toBe("ds markdown-table custom");
    expect(table?.querySelector("td")?.textContent).toBe("Cell");
    expect(table?.hasAttribute("node")).toBe(false);
  });

  it("renders without a consumer class", () => {
    const { container } = render(<MarkdownTable />);

    expect(container.querySelector("table")?.className).toBe(
      "ds markdown-table",
    );
  });
});
