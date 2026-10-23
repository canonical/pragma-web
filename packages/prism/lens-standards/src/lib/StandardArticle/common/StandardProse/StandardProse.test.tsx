/**
 * A standard's prose through the real page fan-out, over the captured store
 * whose Markdown holds one link of each kind: the two that name a reference
 * become its chip, the rest stay what their author wrote.
 */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../../../testing/createStandardsPage.js";
import {
  HTML_RENDERING_STANDARD_URI,
  LINK_COMPONENT_URI,
  PROPS_STANDARD_URI,
  STANDARDS_BINDING_FIXTURE,
  STANDARDS_TEST_TIMEOUT_MS,
} from "../../../../../testing/fixtures.js";
import patchRecords from "../../../../../testing/patchRecords.js";
import standardEntityRecords from "../../../../../testing/records/standardEntityRecords.js";
import { StandardReadingPage } from "../../../StandardReadingPage/index.js";

/** The prose record the captured store holds for the exemplar. */
const PROSE_RECORD = `client:root:prose(uri:"${LINK_COMPONENT_URI}")`;

/** Render the exemplar's reading page over `records`, return its prose. */
const renderProse = (records = standardEntityRecords) => {
  const { container } = render(
    createStandardsPage(
      `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`,
      records,
      createFetchSpy(),
      <StandardReadingPage
        classUri={STANDARDS_BINDING_FIXTURE.classUri}
        params={{ uri: LINK_COMPONENT_URI }}
      />,
    ),
  );
  const prose = container.querySelector(".ds.standard-prose");
  if (!(prose instanceof HTMLElement)) {
    throw new Error("the reading page rendered no prose");
  }
  return prose;
};

/** The reading page's href for the standard at `uri`. */
const buildReadingHref = (uri: string) =>
  `/standards/${encodeURIComponent(uri)}`;

describe("StandardProse", () => {
  it("renders a link to a reference by its compact address as the reference's chip", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const chip = [...renderProse().querySelectorAll(".ds.node-chip")].at(0);

    expect(chip?.textContent).toBe("one prop");
    expect(chip?.getAttribute("data-type")).toBe("CodeStandard");
    expect(chip?.querySelector("a")?.getAttribute("href")).toBe(
      buildReadingHref(PROPS_STANDARD_URI),
    );
  });

  it("renders a link to a reference by its absolute IRI as the reference's chip", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const chips = [...renderProse().querySelectorAll(".ds.node-chip")];

    expect(chips).toHaveLength(2);
    expect(chips.at(1)?.textContent).toBe("every component that renders HTML");
    expect(chips.at(1)?.querySelector("a")?.getAttribute("href")).toBe(
      buildReadingHref(HTML_RENDERING_STANDARD_URI),
    );
  });

  it("keeps a link outside the references a plain anchor", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const prose = renderProse();
    const external = [...prose.querySelectorAll("a")].find(
      (anchor) => anchor.textContent === "React reference",
    );

    expect(external?.getAttribute("href")).toBe(
      "https://react.dev/reference/react/createElement",
    );
    expect(external?.closest(".ds.node-chip")).toBeNull();
  });

  it("keeps a link written in a code span as text", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const code = [...renderProse().querySelectorAll("code")].find((element) =>
      element.textContent?.startsWith("["),
    );

    expect(code?.textContent).toBe("[props](cs:react.component.props)");
    expect(code?.querySelector("a, .ds.node-chip")).toBeNull();
  });

  it("renders the prose's headings one level down, under the article's title", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const prose = renderProse();

    expect(prose.querySelector("h1")).toBeNull();
    expect(prose.querySelector("h2")?.textContent).toBe("Why one prop");
  });

  it("states the language the provider served the prose in", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const prose = renderProse(
      patchRecords(standardEntityRecords, { [PROSE_RECORD]: { lang: "fr" } }),
    );

    expect(prose.getAttribute("lang")).toBe("fr");
  });

  it("never renders a live javascript: link", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const prose = renderProse(
      patchRecords(standardEntityRecords, {
        [PROSE_RECORD]: { markdown: "[Run](javascript:alert(1))" },
      }),
    );
    const anchor = prose.querySelector("a");

    expect(anchor?.textContent).toBe("Run");
    expect(anchor?.getAttribute("href") ?? "").not.toMatch(/javascript/i);
  });
});
