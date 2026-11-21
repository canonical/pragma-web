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
 * form, a nested value as its class.
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
          label
        }
      }
    }
  }
`;
void declareGroupFragment;
/* v8 ignore stop */

const componentCssClassName = "ds statement-group";

type StatementValue = StatementGroup_group$data["values"][number];

/**
 * One predicate group's values as a section's content: each node as its
 * linked chip, which links through the site's homes; each literal as text
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
        {values.map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a value has no identity but its place in the provider's order
          <li className="value" key={index}>
            {renderValue(value, t("statements.nested"))}
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

/** Render one value by its kind; a value of a kind it does not know is left out. */
function renderValue(value: StatementValue, nested: string): ReactNode {
  switch (value.__typename) {
    case "StatementNode":
      return <ChipProjection node={value.node} />;
    case "StatementLiteral":
      return <span lang={value.lang ?? undefined}>{value.lexical}</span>;
    case "StatementForeign":
      return <code>{value.curie}</code>;
    case "StatementNested":
      return value.type?.label ?? nested;
    default:
      return null;
  }
}
