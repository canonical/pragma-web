/**
 * The lens's components take the native props of their root element and
 * spread them onto it, so a site can give any of them an `id`, a `data-*`
 * hook or an `aria-*` attribute, and they merge a given class with their
 * own.
 */

import { render } from "@testing-library/react";
import { useLazyLoadQuery } from "react-relay";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createStandardsPage from "../../../testing/createStandardsPage.js";
import {
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
  STANDARDS_TEST_TIMEOUT_MS,
} from "../../../testing/fixtures.js";
import standardEntityRecords from "../../../testing/records/standardEntityRecords.js";
import standardsIndexRecords from "../../../testing/records/standardsIndexRecords.js";
import type { StandardEntityQuery } from "../../__generated__/StandardEntityQuery.graphql.js";
import standardEntityQueryNode from "../../__generated__/StandardEntityQuery.graphql.js";
import type { StandardsIndexQuery } from "../../__generated__/StandardsIndexQuery.graphql.js";
import standardsIndexQueryNode from "../../__generated__/StandardsIndexQuery.graphql.js";
import { StandardArticle } from "../../lib/StandardArticle/index.js";
import { StandardReadingPage } from "../../lib/StandardReadingPage/index.js";
import { StandardsIcon } from "../../lib/StandardsIcon/index.js";
import { StandardsIndex } from "../../lib/StandardsIndex/index.js";
import { StandardsPage } from "../../lib/StandardsPage/index.js";
import { buildStandardEntityVariables } from "../../lib/standardEntityQuery.js";
import { buildStandardsIndexVariables } from "../../lib/standardsIndexQuery.js";

const { classUri } = STANDARDS_BINDING_FIXTURE;

/** The index over the warm store, given native props. */
const IndexProbe = () => {
  const data = useLazyLoadQuery<StandardsIndexQuery>(
    standardsIndexQueryNode,
    buildStandardsIndexVariables(classUri),
  );
  return (
    <StandardsIndex
      className="probe"
      data-probe="index"
      id="index"
      query={data}
    />
  );
};

/** The article over the warm store, given native props. */
const ArticleProbe = () => {
  const data = useLazyLoadQuery<StandardEntityQuery>(
    standardEntityQueryNode,
    buildStandardEntityVariables(classUri, LINK_COMPONENT_URI),
  );
  if (!data.node) throw new Error("the store must hold the standard");
  return (
    <StandardArticle
      className="probe"
      data-probe="article"
      id="article"
      standard={data.node}
    />
  );
};

describe("native props", () => {
  it("reach the root of the index page and the index", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createStandardsPage(
        "/standards",
        standardsIndexRecords,
        createFetchSpy(),
        <>
          <StandardsPage classUri={classUri} className="probe" id="page" />
          <IndexProbe />
        </>,
      ),
    );

    expect(container.querySelector("#page")).toHaveClass(
      "ds",
      "standards-page",
      "probe",
    );
    expect(container.querySelector("#page")).toHaveAttribute(
      "aria-labelledby",
      "lens-standards-title",
    );
    expect(container.querySelector("#index")).toHaveClass(
      "ds",
      "standards-index",
      "probe",
    );
    expect(container.querySelector("#index")).toHaveAttribute(
      "data-probe",
      "index",
    );
  });

  it("reach the root of the reading page and the article", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const { container } = render(
      createStandardsPage(
        `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`,
        standardEntityRecords,
        createFetchSpy(),
        <>
          <StandardReadingPage
            classUri={classUri}
            className="probe"
            data-probe="reading"
            id="reading"
            params={{ uri: LINK_COMPONENT_URI }}
          />
          <ArticleProbe />
        </>,
      ),
    );

    expect(container.querySelector("#reading")).toHaveClass(
      "ds",
      "standard-reading",
      "probe",
    );
    expect(container.querySelector("#reading")).toHaveAttribute(
      "data-view",
      "standard-reading",
    );
    expect(container.querySelector("#article")).toHaveClass(
      "ds",
      "standard-article",
      "probe",
    );
    expect(container.querySelector("#article")).toHaveAttribute(
      "data-slot",
      "reading-canvas",
    );
  });

  it("reach the root of the rail glyph", () => {
    const { container } = render(<StandardsIcon data-probe="glyph" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-probe",
      "glyph",
    );
  });
});
