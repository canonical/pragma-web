// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/ModifierFamilyRow_node.graphql.js";
import type { ModifierFamilyRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierFamilyRow reads from the ModifierFamily it renders:
 * its title and compact address, and the address of each of its
 * modifiers, which it counts.
 * Every member is read in one page of the schema's largest size, 100: a
 * family holds a handful of modifiers.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierFamilyRow_node on ModifierFamily {
    __typename
    _meta {
      title
      curie
    }
    modifiers(first: 100) {
      edges {
        node {
          uri
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-family-row";

/**
 * A modifier family as a 32px list entry: its namespace prefix, muted
 * with its colon (`ds:`), before its title, linked to its home when the
 * site has one and inert text when it has none; and the count of its
 * modifiers at the end (`5 modifiers`). A family whose address did not
 * compact has no prefix.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierFamilyRow } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_family_row
 * @note Impure: reads its family from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function ModifierFamilyRow({
  node,
  className,
  ...props
}: ModifierFamilyRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const prefix = findCuriePrefix(curie);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      location={
        prefix === undefined ? undefined : (
          <code className="identifier">
            {curie.slice(0, prefix.length + 1)}
          </code>
        )
      }
      meta={t("family.modifiers", { count: data.modifiers.edges.length })}
      title={title}
    />
  );
}
