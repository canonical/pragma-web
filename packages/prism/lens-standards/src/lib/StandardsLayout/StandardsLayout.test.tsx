import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import { LINK_COMPONENT_URI } from "../../../testing/fixtures.js";
import { StandardsLayout } from "./index.js";

/** The reading page's URL for the exemplar standard. */
const READING_URL = `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`;

describe("StandardsLayout", () => {
  it("renders the site's rail and colophon around the canvas", () => {
    render(
      createStandardsPage(
        "/standards",
        undefined,
        createFetchSpy(),
        <StandardsLayout
          colophon={<footer>Colophon</footer>}
          rail={<nav aria-label="Site rail" />}
        >
          <p>Routed page</p>
        </StandardsLayout>,
      ),
    );

    expect(screen.getByRole("navigation", { name: "Site rail" })).toBeVisible();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Colophon");
    expect(screen.getByText("Routed page")).toBeInTheDocument();
  });

  it("renders no footer band when the site gives no colophon", () => {
    render(
      createStandardsPage(
        "/standards",
        undefined,
        createFetchSpy(),
        <StandardsLayout rail={null}>{null}</StandardsLayout>,
      ),
    );

    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("names the lens in the strip's trail on the index", () => {
    const { container } = render(
      createStandardsPage(
        "/standards",
        undefined,
        createFetchSpy(),
        <StandardsLayout rail={null}>{null}</StandardsLayout>,
      ),
    );

    const context = container.querySelector(
      '[data-slot="context"]',
    ) as HTMLElement;
    expect(within(context).getByText("Standards")).toBeInTheDocument();
  });

  it("adds the standard's address as the trail's last crumb on a reading page", () => {
    const { container } = render(
      createStandardsPage(
        READING_URL,
        undefined,
        createFetchSpy(),
        <StandardsLayout rail={null}>{null}</StandardsLayout>,
      ),
    );

    const context = container.querySelector(
      '[data-slot="context"]',
    ) as HTMLElement;
    expect(
      within(context).getByRole("link", { name: "Standards" }),
    ).toHaveAttribute("href", "/standards");
    expect(context).toHaveTextContent(LINK_COMPONENT_URI);
  });

  it("spreads native props onto its root and merges the site's class names after its own", () => {
    const { container } = render(
      createStandardsPage(
        "/standards",
        undefined,
        createFetchSpy(),
        <StandardsLayout
          className="site-layout"
          data-probe="layout"
          id="layout"
          rail={null}
        >
          {null}
        </StandardsLayout>,
      ),
    );

    const root = container.querySelector("#layout");
    expect(root?.className).toBe("ds document-layout site-layout");
    expect(root).toHaveAttribute("data-probe", "layout");
  });
});
