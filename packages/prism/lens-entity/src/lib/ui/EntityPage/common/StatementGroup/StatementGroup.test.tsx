import { createEnvironment } from "@canonical/prism-core";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import { fetchQuery } from "relay-runtime";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../../../../testing/createEntitySite.js";
import createFetchSpy from "../../../../../../testing/createFetchSpy.js";
import {
  CENTRAL_EXCHANGE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
} from "../../../../../../testing/fixtures.js";
import metroResponses from "../../../../../../testing/records/metroResponses.js";
import type { EntityStatementsQuery } from "../../../../../__generated__/EntityStatementsQuery.graphql.js";
import entityStatementsQueryNode from "../../../../../__generated__/EntityStatementsQuery.graphql.js";
import StatementGroup from "./StatementGroup.js";

const URI = "https://metro.example/onto#central-exchange";

/** The recorded answer for Central Exchange's statements. */
const RECORDED = metroResponses.find(
  ({ operation, variables }) =>
    operation === "EntityStatementsQuery" && variables.uri === URI,
);

/**
 * The recorded "serves lines" group, its first line kept beside a value of
 * every other kind and one of a kind the reader does not know, its total
 * past what it holds.
 */
const craftAnswer = () => {
  const answer = structuredClone(RECORDED?.response) as {
    data: {
      outgoing: {
        groups: { predicateUri: string; total: number; values: unknown[] }[];
      };
    };
  };
  const group = answer.data.outgoing.groups.find(({ predicateUri }) =>
    predicateUri.endsWith("#servesLine"),
  );
  if (group === undefined) throw new Error("craftAnswer: no servesLine group");
  group.total = 30;
  group.values = [
    group.values.at(0),
    {
      __typename: "StatementLiteral",
      lexical: "Gare centrale",
      lang: "fr",
    },
    { __typename: "StatementForeign", curie: "x:a" },
    { __typename: "StatementNested", type: null, groups: [] },
    {
      __typename: "StatementNested",
      type: { label: "Geo point" },
      groups: [
        {
          predicateUri: "https://geo.example/onto#latitude",
          predicate: { label: "latitude" },
          values: [
            {
              __typename: "StatementLiteral",
              lexical: "51.5074",
              lang: null,
            },
          ],
        },
        {
          predicateUri: "https://geo.example/onto#longitude",
          predicate: null,
          values: [
            {
              __typename: "StatementLiteral",
              lexical: "-0.1278",
              lang: null,
            },
          ],
        },
        {
          predicateUri: "https://geo.example/onto#empty",
          predicate: null,
          values: [],
        },
      ],
    },
    // A kind a later contract may add, which this reader does not know.
    { __typename: "StatementQuoted" },
  ];
  answer.data.outgoing.groups = [group];
  return answer;
};

/** The first outgoing group of the store's statements, as its section shows it. */
const FirstGroup = (): ReactElement => {
  const { outgoing } = useLazyLoadQuery<EntityStatementsQuery>(
    entityStatementsQueryNode,
    { uri: URI },
    { fetchPolicy: "store-only" },
  );
  const group = outgoing?.groups.at(0);
  if (group === undefined) throw new Error("FirstGroup: no group in the store");
  return <StatementGroup data-probe="group" group={group} />;
};

/** The group over a store holding the crafted answer. */
const renderGroup = async () => {
  const fetchFn = createFetchSpy();
  fetchFn.mockResolvedValue(craftAnswer());
  const environment = createEnvironment({ fetchFn });
  await fetchQuery(environment, entityStatementsQueryNode, {
    uri: URI,
  }).toPromise();
  return render(
    createEntitySite({
      url: `/stations/${encodeURIComponent(CENTRAL_EXCHANGE_CURIE)}`,
      environment,
      children: <FirstGroup />,
    }),
  );
};

describe("StatementGroup", () => {
  it("renders each value by its kind: a linked chip, text in its language, a compact form, none for a kind it does not know", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderGroup();
    const values = [...container.querySelectorAll(".values > .value")];
    expect(values).toHaveLength(6);
    expect(values.at(0)?.querySelector("a")?.getAttribute("href")).toBe(
      "/lines/metro%3Acircle-line",
    );
    expect(values.at(1)?.querySelector('[lang="fr"]')?.textContent).toBe(
      "Gare centrale",
    );
    expect(values.at(2)?.querySelector("code")?.textContent).toBe("x:a");
    expect(values.at(3)?.textContent).toBe("A nested value");
    expect(
      [...(values.at(4)?.querySelectorAll(".nested > .pair") ?? [])].map(
        (pair) =>
          [...pair.children].map(({ textContent }) => textContent).join(" "),
      ),
    ).toEqual(["latitude 51.5074", "longitude -0.1278"]);
    expect(values.at(5)?.childNodes).toHaveLength(0);
  });

  it("ends a group cut at its bound with how many of its values it shows, never a link", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { container } = await renderGroup();
    const group = container.querySelector('[data-probe="group"]');
    expect(group?.querySelector("a.all")).toBeNull();
    expect(group?.querySelector(":scope > p.shown")?.textContent).toBe(
      "6 of 30 shown",
    );
  });
});
