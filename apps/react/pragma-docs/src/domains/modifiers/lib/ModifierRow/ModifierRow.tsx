// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  findCuriePrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../../relay/__generated__/ModifierRow_node.graphql.js";
import type { ModifierRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields ModifierRow reads from the Modifier it renders: its title
 * and compact address, and its family's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment ModifierRow_node on Modifier {
    __typename
    _meta {
      title
      curie
    }
    modifierFamily {
      _meta {
        title
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds modifier-row";

/**
 * A modifier as a 32px list entry: its namespace prefix, muted with its
 * colon (`ds:`), before its title, linked to its home when the site has
 * one and inert text when it has none; and its family at the end
 * (`Anticipation`), the one fact that tells one modifier row from
 * another. A modifier whose address did not compact has no prefix, and
 * one with no family ends in its title.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { ModifierRow } from "#domains/modifiers/lib";`
 *
 * @implements docs.component.modifier_row
 * @note Impure: reads its modifier from the Relay store, its home from the
 *   site's homes and its link from the projection provider.
 */
export default function ModifierRow({
  node,
  className,
  ...props
}: ModifierRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
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
      meta={data.modifierFamily?._meta.title}
      title={title}
    />
  );
}
