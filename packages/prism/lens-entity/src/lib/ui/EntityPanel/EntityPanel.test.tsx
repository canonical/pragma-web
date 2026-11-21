import { createEnvironment } from "@canonical/prism-core";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { GraphQLResponse } from "relay-runtime";
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
import type { SiteExtension } from "../../../../testing/types.js";
import entityNamespacesQueryNode from "../../../__generated__/EntityNamespacesQuery.graphql.js";
import entityPanelQueryNode from "../../../__generated__/EntityPanelQuery.graphql.js";
import entityStatementsQueryNode from "../../../__generated__/EntityStatementsQuery.graphql.js";
import EntityPanel from "./EntityPanel.js";
import type { EntityPanelProps } from "./types.js";

const CIRCLE_LINE = "https://metro.example/onto#circle-line";

const NOWHERE = "https://metro.example/onto#nowhere";

/** The recorded page answer for `uri`, whose node the panel's read selects a part of. */
const readNodeAnswer = (uri: string): GraphQLResponse => {
  const recorded = metroResponses.find(
    ({ operation, variables }) =>
      operation === "EntityPageQuery" && variables.id === uri,
  );
  if (recorded === undefined) throw new Error(`no page record for ${uri}`);
  const { data } = recorded.response as { data: { node: unknown } };
  return { data: { node: structuredClone(data.node) } };
};

type PanelSetup = {
  readonly uri: string;
  readonly extensions?: readonly SiteExtension[];
  readonly node?: GraphQLResponse;
  readonly statements?: GraphQLResponse;
} & Omit<EntityPanelProps, "uri">;

/** A store holding the panel's three reads, the recorded ones unless given. */
const fillStore = async ({ uri, node, statements }: PanelSetup) => {
  const recorded = createRecordedFetch();
  const fetchFn = createFetchSpy();
  fetchFn.mockImplementation((params, variables, ...rest) => {
    if (params.name === "EntityPanelQuery") {
      return Promise.resolve(node ?? readNodeAnswer(String(variables.id)));
    }
    if (params.name === "EntityStatementsQuery" && statements !== undefined) {
      return Promise.resolve(structuredClone(statements));
    }
    return recorded(params, variables, ...rest);
  });
  const environment = createEnvironment({ fetchFn });
  await fetchQuery(environment, entityNamespacesQueryNode, {}).toPromise();
  await fetchQuery(environment, entityPanelQueryNode, { id: uri }).toPromise();
  await fetchQuery(environment, entityStatementsQueryNode, {
    uri,
  }).toPromise();
  return environment;
};

/** The panel as a site renders it, over a store its reads filled. */
const renderPanel = async (setup: PanelSetup) => {
  const { uri, extensions, node, statements, ...props } = setup;
  const environment = await fillStore(setup);
  const site = createEntitySite({
    url: `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`,
    environment,
    extensions: extensions ?? ["source", "statements"],
    children: <EntityPanel {...props} uri={uri} />,
  });
  return { ...render(site), html: renderToString(site) };
};

describe("EntityPanel", () => {
  it("opens on the identity and the values, every group closed and counted, Referenced by among them (W6b-A6)", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container, html } = await renderPanel({ uri: CIRCLE_LINE });
    const panel = container.querySelector("section.ds.entity-panel");
    expect(panel?.getAttribute("aria-label")).toBe("Circle Line");
    expect(panel?.querySelector(".identity h2.title")?.textContent).toBe(
      "Circle Line",
    );
    const open = panel?.querySelector(".identity .headline > a.open");
    expect(open?.getAttribute("href")).toBe("/lines/metro%3Acircle-line");
    expect(open?.textContent).toBe("Open");
    // The panel links to the entity's home and is never one itself (W6b-A7).
    expect(container.querySelector("[data-canonical]")).toBeNull();
    expect(panel?.querySelector(".identity .address")?.textContent).toBe(
      CIRCLE_LINE_CURIE,
    );
    expect(panel?.querySelector(":scope > dl.values")).not.toBeNull();
    const groups = [...(panel?.querySelectorAll("details.group") ?? [])];
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.hasAttribute("open")).toBe(false);
      expect(group.querySelector(":scope > summary")?.textContent).toMatch(
        / · \d+$/,
      );
      expect(
        group.querySelector(":scope > .ds.statement-group"),
      ).not.toBeNull();
    }
    const referencedBy = panel?.querySelector(":scope > .referenced-by");
    expect(referencedBy?.querySelector("h3.heading")?.textContent).toMatch(
      /^Referenced by · \d+$/,
    );
    expect(
      referencedBy?.querySelectorAll(":scope > details.group").length,
    ).toBeGreaterThan(0);
    // No generated id, so the server's markup hydrates as it is.
    expect(html).not.toMatch(/id="(?:«|:)r/);
  });

  it("sets its headings a level down under a heading of its own", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      headingLevel: 3,
    });
    expect(container.querySelector(".identity h3.title")).not.toBeNull();
    expect(
      container.querySelector(".referenced-by > h4.heading"),
    ).not.toBeNull();
  });

  it("gives a site without statements the identity alone, saying nothing is missing", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      extensions: ["source"],
      statements: { data: { outgoing: null, incoming: null } },
    });
    const panel = container.querySelector("section.ds.entity-panel");
    expect(panel?.querySelector(".identity")).not.toBeNull();
    expect(panel?.querySelector("dl.values")).toBeNull();
    expect(panel?.querySelector("details")).toBeNull();
    expect(panel?.querySelector(".referenced-by")).toBeNull();
  });

  it("draws no Open for a node without a home, nor Referenced by when nothing points at it", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const node = readNodeAnswer(CIRCLE_LINE) as {
      data: { node: { __typename: string } };
    };
    node.data.node.__typename = "Unhomed";
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      node,
      statements: {
        data: {
          outgoing: { total: 0, groups: [] },
          incoming: { total: 0, groups: [] },
        },
      },
    });
    expect(container.querySelector("a.open")).toBeNull();
    expect(container.querySelector(".referenced-by")).toBeNull();
  });

  it("words an incoming group whose property names no inverse from the entity's side", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const recorded = metroResponses.find(
      ({ operation, variables }) =>
        operation === "EntityStatementsQuery" && variables.uri === CIRCLE_LINE,
    );
    const statements = structuredClone(recorded?.response) as {
      data: {
        incoming: {
          groups: { predicate: Record<string, unknown> | null }[];
        };
      };
    };
    for (const group of statements.data.incoming.groups) {
      if (group.predicate !== null) {
        group.predicate.inverseLabel = null;
        group.predicate.inversePluralLabel = null;
      }
    }
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      statements: statements as GraphQLResponse,
    });
    expect(
      container.querySelector(".referenced-by summary")?.textContent,
    ).toMatch(/\(inverse\) · \d+$/);
  });

  it("renders the not-found status for an IRI nothing answers to", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: NOWHERE,
      node: { data: { node: null } },
      statements: { data: { outgoing: null, incoming: null } },
    });
    const status = container.querySelector(
      "section.ds.entity-panel > .not-found",
    );
    expect(status?.getAttribute("role")).toBe("status");
    expect(status?.textContent).toContain(NOWHERE);
  });

  it("says what its host gives it for an IRI nothing answers to", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: NOWHERE,
      node: { data: { node: null } },
      statements: { data: { outgoing: null, incoming: null } },
      notFound: <p className="unknown">Unknown term</p>,
    });
    const panel = container.querySelector("section.ds.entity-panel");
    expect(panel?.querySelector(".not-found")).toBeNull();
    expect(panel?.querySelector(".unknown")?.textContent).toBe("Unknown term");
  });
});
