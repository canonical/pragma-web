import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { sampleMdxHeading } from "../../../testing/fixtures.js";
import SamplePage from "../../../testing/sample.mdx";
import { defaultComponents, extractHeadings } from "../../index.js";
import { MdxProvider } from "../../lib/MdxProvider/index.js";
import type { MarkdownElementProps } from "../../lib/types.js";

/** A link override that shows which href it was handed. */
function ProbeLink({
  node: _node,
  href,
  children,
}: MarkdownElementProps<"a">): ReactElement {
  return (
    <span data-probe-href={href} className="probe">
      {children}
    </span>
  );
}

const linkComponents = { ...defaultComponents, a: ProbeLink };

describe("MDX pages", () => {
  it("render design-system elements with no provider", () => {
    const { container } = render(<SamplePage />);

    expect(
      container.querySelector("pre.ds.markdown-code-block > code.language-sh"),
    ).not.toBeNull();
    expect(container.querySelector("table.ds.markdown-table")).not.toBeNull();
    expect(container.querySelector("td code.ds.inline-code")).not.toBeNull();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/guide",
    );
  });

  it("render admonitions as announcements", () => {
    const { container } = render(<SamplePage />);

    const announcement = container.querySelector(".ds.announcement.success");
    expect(announcement?.querySelector(".heading")?.textContent).toBe("Tip");
    expect(announcement?.querySelector(".content")?.textContent?.trim()).toBe(
      "Install the package first.",
    );
  });

  it("give headings the ids extractHeadings lists for the same Markdown", () => {
    const { container } = render(<SamplePage />);

    expect(container.querySelector("h1")?.id).toBe(
      extractHeadings(sampleMdxHeading).at(0)?.id,
    );
    expect(container.querySelector("h1")?.id).toBe(
      "user-content-getting-started",
    );
  });

  it("render through the components of the nearest MdxProvider", () => {
    const { container } = render(
      <MdxProvider components={linkComponents}>
        <SamplePage />
      </MdxProvider>,
    );

    const probe = container.querySelector(".probe");
    expect(probe?.getAttribute("data-probe-href")).toBe(
      "https://example.com/guide",
    );
    expect(probe?.textContent).toBe("guide");
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("table.ds.markdown-table")).not.toBeNull();
  });
});
