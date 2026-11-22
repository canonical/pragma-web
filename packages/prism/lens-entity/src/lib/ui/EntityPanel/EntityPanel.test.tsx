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

/**
 * The recorded statements of `uri` with the first literal of each group
 * `texts` names rewritten to the text it gives.
 */
const rewriteLiterals = (
  uri: string,
  texts: Readonly<Record<string, string>>,
): GraphQLResponse => {
  const recorded = metroResponses.find(
    ({ operation, variables }) =>
      operation === "EntityStatementsQuery" && variables.uri === uri,
  );
  if (recorded === undefined) throw new Error(`no statements for ${uri}`);
  const answer = structuredClone(recorded.response) as {
    data: {
      outgoing: {
        groups: { predicateUri: string; values: { lexical?: string }[] }[];
      };
    };
  };
  for (const group of answer.data.outgoing.groups) {
    const text = texts[group.predicateUri];
    const first = group.values.at(0);
    if (text !== undefined && first !== undefined) first.lexical = text;
  }
  return answer as GraphQLResponse;
};

type PanelSetup = {
  readonly uri: string;
  /** Where the site sits: by default a page other than the entity's own. */
  readonly url?: string;
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
  const { uri, url, extensions, node, statements, ...props } = setup;
  const environment = await fillStore(setup);
  const site = createEntitySite({
    url: url ?? "/stations",
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
    // The prominent values and the plain ones are open; a value the line
    // holds, such as its routes, is a closed group like its relations (M18).
    expect(
      [...(panel?.querySelectorAll(":scope > dl.values dt") ?? [])].map(
        ({ textContent }) => textContent,
      ),
    ).toEqual(["code", "colour"]);
    expect(
      [
        ...(panel?.querySelectorAll(":scope > details.group > summary") ?? []),
      ].map(({ textContent }) => textContent),
    ).toEqual(["Routes · 2", "Formations · 1"]);
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

  it("closes a long text under its label, its line breaks kept, out of the open values", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const long = "x".repeat(121);
    const lines = "#f2b705\n#000000";
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      statements: rewriteLiterals(CIRCLE_LINE, {
        "https://metro.example/onto#code": long,
        "https://metro.example/onto#colour": lines,
      }),
    });
    const panel = container.querySelector("section.ds.entity-panel");
    const texts = [...(panel?.querySelectorAll(":scope > details.text") ?? [])];
    expect(
      texts.map((text) => text.querySelector(":scope > summary")?.textContent),
    ).toEqual(["Code", "Colour"]);
    expect(texts.every((text) => !text.hasAttribute("open"))).toBe(true);
    expect(
      texts.map((text) => text.querySelector(".body")?.textContent),
    ).toEqual([long, lines]);
    const values = panel?.querySelector(":scope > .values")?.textContent ?? "";
    expect(values).not.toContain(long);
  });

  it("draws no Open on the entity's own page", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      url: `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`,
    });
    expect(container.querySelector(".identity .title")?.textContent).toBe(
      "Circle Line",
    );
    expect(container.querySelector("a.open")).toBeNull();
  });

  it("opens the page its host names as the entity's own, through the site's link", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      home: "/lines",
    });
    const open = container.querySelector(".identity .headline > a.open");
    expect(open?.getAttribute("href")).toBe("/lines");
    expect(open?.classList.contains("router-link")).toBe(true);
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

  it("counts a group cut below its total by the total, saying how many are shown", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const recorded = metroResponses.find(
      ({ operation, variables }) =>
        operation === "EntityStatementsQuery" && variables.uri === CIRCLE_LINE,
    );
    type Group = { total: number; values: { __typename: string }[] };
    const statements = structuredClone(recorded?.response) as {
      data: {
        outgoing: { groups: Group[] };
        incoming: { total: number; groups: Group[] };
      };
    };
    for (const group of statements.data.outgoing.groups) {
      if (group.values.at(0)?.__typename === "StatementNode") group.total = 30;
    }
    const [first] = statements.data.incoming.groups;
    if (first === undefined) throw new Error("no incoming group recorded");
    first.total = 30;
    statements.data.incoming.total = 30;
    const { container } = await renderPanel({
      uri: CIRCLE_LINE,
      statements: statements as GraphQLResponse,
    });
    const formations = [
      ...container.querySelectorAll(".entity-panel > details.group"),
    ].find(({ textContent }) => textContent?.startsWith("Formations"));
    expect(formations?.querySelector("summary")?.textContent).toBe(
      "Formations · 30",
    );
    expect(formations?.textContent).toContain("1 of 30 shown");
    const referencedBy = container.querySelector(".referenced-by");
    expect(referencedBy?.querySelector("h3.heading")?.textContent).toBe(
      "Referenced by · 30",
    );
    const incoming = referencedBy?.querySelector("details.group");
    expect(incoming?.querySelector("summary")?.textContent).toMatch(/ · 30$/);
    expect(incoming?.textContent).toContain(
      `${first.values.length} of 30 shown`,
    );
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
