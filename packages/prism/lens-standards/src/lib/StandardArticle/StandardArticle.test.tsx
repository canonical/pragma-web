/**
 * StandardArticle through the real page fan-out: the reading column's
 * identity header and its body all render from the captured store, never
 * the network. The body is the standard's prose when it has some; without
 * prose it is the description, where blank lines split paragraphs, single
 * newlines stay inside one (`pre-line`), and inline code marks show
 * verbatim.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import {
  LINK_COMPONENT_CURIE,
  LINK_COMPONENT_PROSE_KEY,
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
  STANDARDS_TEST_TIMEOUT_MS,
} from "../../../testing/fixtures.js";
import patchRecords from "../../../testing/patchRecords.js";
import standardEntityRecords from "../../../testing/records/standardEntityRecords.js";
import { StandardReadingPage } from "../StandardReadingPage/index.js";

/** The `_meta` record of the exemplar standard in the captured store. */
const EXEMPLAR_META = `client:${LINK_COMPONENT_URI}:_meta`;

/** The captured store with the exemplar's prose taken away. */
const recordsWithoutProse = patchRecords(standardEntityRecords, {
  "client:root": { [LINK_COMPONENT_PROSE_KEY]: null },
});

/** The reading page at the exemplar standard over `records`. */
const renderExemplar = (records: Parameters<typeof patchRecords>[0]) =>
  render(
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

describe("StandardArticle", () => {
  it("renders the standard's prose in place of its description", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = renderExemplar(standardEntityRecords);

    const article = container.querySelector(".ds.standard-article");
    expect(article?.querySelector(".ds.standard-prose")).not.toBeNull();
    expect(article?.querySelector(".paragraph")).toBeNull();
    expect(article?.textContent).not.toContain("A *complex* component");
  });

  it("renders the header and, with no prose, the description's paragraph blocks", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = renderExemplar(recordsWithoutProse);

    const article = container.querySelector(".ds.standard-article");
    expect(article).not.toBeNull();
    // The article is the reading column.
    expect(article?.getAttribute("data-slot")).toBe("reading-canvas");
    // Identity: the compact form in code voice inside the meta line; the
    // absolute IRI belongs in the address bar, not in front of a reader.
    expect(article?.querySelector(".meta code")?.textContent).toBe(
      LINK_COMPONENT_CURIE,
    );
    expect(article?.querySelector(".class")?.textContent).toBe(
      "class: CodeStandard",
    );
    // The description holds blank-line breaks, so the split yields several
    // paragraphs; the source's inline marks survive verbatim.
    const blocks = [...(article?.querySelectorAll(".prose .paragraph") ?? [])];
    expect(blocks.length).toBeGreaterThan(1);
    expect(blocks.at(0)?.textContent).toContain("A *complex* component");
    expect(article?.textContent).toContain("`LinkComponentProps`");
    expect(
      screen.queryByRole("heading", { level: 2, name: "Extends" }),
    ).not.toBeInTheDocument();
  });

  it("says so when the standard records no description", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = renderExemplar(
      patchRecords(recordsWithoutProse, {
        [EXEMPLAR_META]: { definition: null },
      }),
    );

    expect(container.querySelector(".prose")?.textContent).toBe(
      "No description recorded.",
    );
    expect(container.querySelector(".paragraph")).toBeNull();
  });
});
