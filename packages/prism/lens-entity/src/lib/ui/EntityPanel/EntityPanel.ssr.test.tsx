import { createEnvironment } from "@canonical/prism-core";
import { renderToString } from "react-dom/server";
import { fetchQuery } from "relay-runtime";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../../testing/createEntitySite.js";
import createFetchSpy from "../../../../testing/createFetchSpy.js";
import createRecordedFetch from "../../../../testing/createRecordedFetch.js";
import {
  CIRCLE_LINE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
} from "../../../../testing/fixtures.js";
import metroResponses from "../../../../testing/records/metroResponses.js";
import entityNamespacesQueryNode from "../../../__generated__/EntityNamespacesQuery.graphql.js";
import entityPanelQueryNode from "../../../__generated__/EntityPanelQuery.graphql.js";
import entityStatementsQueryNode from "../../../__generated__/EntityStatementsQuery.graphql.js";
import EntityPanel from "./EntityPanel.js";

const CIRCLE_LINE = "https://metro.example/onto#circle-line";

describe("EntityPanel on the server", () => {
  it("renders its groups as closed native disclosures, with no generated id", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const recorded = createRecordedFetch();
    const page = metroResponses.find(
      ({ operation, variables }) =>
        operation === "EntityPageQuery" && variables.id === CIRCLE_LINE,
    )?.response as { data: { node: unknown } };
    const fetchFn = createFetchSpy();
    fetchFn.mockImplementation((params, variables, ...rest) =>
      params.name === "EntityPanelQuery"
        ? Promise.resolve({ data: { node: structuredClone(page.data.node) } })
        : recorded(params, variables, ...rest),
    );
    const environment = createEnvironment({ fetchFn });
    await fetchQuery(environment, entityNamespacesQueryNode, {}).toPromise();
    await fetchQuery(environment, entityPanelQueryNode, {
      id: CIRCLE_LINE,
    }).toPromise();
    await fetchQuery(environment, entityStatementsQueryNode, {
      uri: CIRCLE_LINE,
    }).toPromise();
    const html = renderToString(
      createEntitySite({
        url: `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`,
        environment,
        extensions: ["source", "statements"],
        children: <EntityPanel uri={CIRCLE_LINE} />,
      }),
    );
    expect(html).toContain('<section aria-label="Circle Line" class="ds entity-panel">');
    expect(html).toContain('<details class="group"><summary class="summary">');
    expect(html).not.toContain("<details open");
    expect(html).not.toMatch(/id="(?:«|:)r/);
  });
});
