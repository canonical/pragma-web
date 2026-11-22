import { ChipProjection } from "@canonical/prism-projections";
import type { ReactElement, ReactNode } from "react";
import { graphql, useFragment } from "react-relay";
import groupFragment, {
  type StatementGroup_group$data,
} from "../../../../../__generated__/StatementGroup_group.graphql.js";
import { useMessages } from "../../../../i18n/index.js";
import type { StatementGroupProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields a group's values render from: the group's true total, and
 * each value by its kind: a node as its chip, a literal as its lexical form
 * in its language, a value outside the graph's namespaces as its compact
 * form, a nested value as its own values (its predicates' labels and
 * their values; a value nested past the provider's depth bound, which
 * comes with no values, as its class's chip).
 */
const declareGroupFragment = (): unknown => graphql`
  fragment StatementGroup_group on StatementGroup {
    total
    values {
      __typename
      ... on StatementNode {
        node {
          uri
          ...ChipProjection_node
        }
      }
      ... on StatementLiteral {
        lexical
        lang
      }
      ... on StatementForeign {
        curie
      }
      ... on StatementNested {
        type {
          ...ChipProjection_node
        }
        groups {
          predicateUri
          predicate {
            label
          }
          values {
            __typename
            ... on StatementNode {
              node {
                uri
                ...ChipProjection_node
              }
            }
            ... on StatementLiteral {
              lexical
              lang
            }
            ... on StatementForeign {
              curie
            }
            ... on StatementNested {
              type {
                ...ChipProjection_node
              }
            }
          }
        }
      }
    }
  }
`;
void declareGroupFragment;
/* v8 ignore stop */

const componentCssClassName = "ds statement-group";

type StatementValue = StatementGroup_group$data["values"][number];

type NestedValue = Extract<StatementValue, { __typename: "StatementNested" }>;

type HeldValue = NestedValue["groups"][number]["values"][number];

/**
 * One predicate group's values as a section's content: each node as its
 * linked chip, which links through the site's homes, once, though several
 * values the node holds (a line's routes calling at a station) name it;
 * each literal as text
 * in its language; at most the provider's bound of values (12 by default),
 * then, when the group holds more than it shows, one muted line that says
 * how many of them it shows. The group's count stands in the section's
 * title, never here.
 *
 * `import { StatementGroup } from "../StatementGroup/index.js";`
 *
 * @implements prism.subcomponent.statement_group
 * @note Impure: reads its group from the Relay store and the translator in
 *   scope.
 */
export default function StatementGroup({
  className,
  group,
  ...props
}: StatementGroupProps): ReactElement {
  const t = useMessages();
  const { total, values } = useFragment(groupFragment, group);
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <ul className="values">
        {listDistinctValues(values).map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a value has no identity but its place in the provider's order
          <li className="value" key={index}>
            {renderValue(value)}
          </li>
        ))}
      </ul>
      {total > values.length ? (
        <p className="shown">
          {t("statements.shown", { shown: values.length, total })}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The values with each node kept at its first place only: the provider
 * names a value without an IRI, such as a route, by the node that holds
 * it, so one holder can stand for several of a group's values.
 */
function listDistinctValues(
  values: readonly StatementValue[],
): readonly StatementValue[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (value.__typename !== "StatementNode") return true;
    if (seen.has(value.node.uri)) return false;
    seen.add(value.node.uri);
    return true;
  });
}

/**
 * Render one value by its kind: a nested value as its own values, each
 * after its predicate's label, or as its class when it holds none.
 */
function renderValue(value: StatementValue): ReactNode {
  if (value.__typename !== "StatementNested") return renderHeld(value);
  const held = value.groups.filter(({ values }) => values.length > 0);
  if (held.length === 0) return renderClass(value.type);
  return (
    <dl className="nested">
      {held.map(({ predicate, predicateUri, values }) => (
        <div className="pair" key={predicateUri}>
          <dt className="term">
            {predicate?.label ?? readLocalName(predicateUri)}
          </dt>
          {values.map((held, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a value has no identity but its place in the provider's order
            <dd className="held" key={index}>
              {renderHeld(held)}
            </dd>
          ))}
        </div>
      ))}
    </dl>
  );
}

/** Render a value one level down; a value of a kind it does not know is left out. */
function renderHeld(value: HeldValue): ReactNode {
  switch (value.__typename) {
    case "StatementNode":
      return <ChipProjection node={value.node} />;
    case "StatementLiteral":
      return <span lang={value.lang ?? undefined}>{value.lexical}</span>;
    case "StatementForeign":
      return <code>{value.curie}</code>;
    case "StatementNested":
      return renderClass(value.type);
    default:
      return null;
  }
}

/**
 * Render a nested value by its class: the class's chip, which links through
 * the site's homes where the site gives the class a page; nothing when the
 * provider names no class, never a filler in its place.
 */
function renderClass(type: NestedValue["type"]): ReactNode {
  return type === null || type === undefined ? null : (
    <ChipProjection node={type} />
  );
}

/** The last segment of an IRI, after its last `#` or `/`: a predicate's name when it has no label. */
function readLocalName(uri: string): string {
  return uri.slice(Math.max(uri.lastIndexOf("#"), uri.lastIndexOf("/")) + 1);
}
