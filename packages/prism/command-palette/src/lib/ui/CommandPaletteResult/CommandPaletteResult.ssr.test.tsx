// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it } from "vitest";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { COMPONENT_NODE } from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type CommandPaletteResultSsrTestQuery,
} from "../../../__generated__/CommandPaletteResultSsrTestQuery.graphql.js";
import { CommandPaletteTitle } from "../CommandPaletteTitle/index.js";
import CommandPaletteResult from "./CommandPaletteResult.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The operation the SSR test renders CommandPaletteResult under: one Node,
 * read through the `node` field. The spread is aliased because that field
 * is typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query CommandPaletteResultSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CommandPaletteResult_node @alias
    }
  }
`;
void declareSsrTestQuery;
/* v8 ignore stop */

/** Run the SSR test operation and render the result over its node. */
const ResultOverNode = (): ReactElement => {
  const data = useLazyLoadQuery<CommandPaletteResultSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.CommandPaletteResult_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return (
    <CommandPaletteResult
      aria-selected
      id="results-0"
      node={node}
      onChoose={() => undefined}
      role="option"
    />
  );
};

describe("CommandPaletteResult SSR", () => {
  it("renders the option's row on the server, its title as text", () => {
    const environment = createSearchEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, { Node: () => COMPONENT_NODE }),
    );
    const html = renderToString(
      createSiteTree({
        environment,
        router: createSiteRouter(),
        children: (
          <ProjectionsProvider
            LinkComponent={CommandPaletteTitle}
            maps={defaultProjectionMaps}
          >
            <ResultOverNode />
          </ProjectionsProvider>
        ),
      }),
    );
    expect(html).toContain('role="option"');
    expect(html).toContain('id="results-0"');
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain(
      '<span class="ds command-palette-title title">Layout switcher</span>',
    );
    expect(html).not.toContain("<a ");
  });
});
