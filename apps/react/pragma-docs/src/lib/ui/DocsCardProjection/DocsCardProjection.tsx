// Scaffolded by @canonical/summon-component:react v0.43.0

import { CardProjection, requireArmKey } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { UIBlockCard } from "#domains/components/lib";
import { ModifierCard, ModifierFamilyCard } from "#domains/modifiers/lib";
import { CodeStandardCard } from "#domains/standards/lib";
import nodeFragment from "../../../relay/__generated__/DocsCardProjection_node.graphql.js";
import type { DocsCardProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields DocsCardProjection reads from the Node it dispatches: its
 * typename; the package's card switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each
 * design-system type, aliased by the type it is on. The three UI-block
 * types share one arm, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment DocsCardProjection_node on Node {
    __typename
    ...CardProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockCard_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockCard_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockCard_node
    }
    ...ModifierCard_node @alias(as: "Modifier")
    ...ModifierFamilyCard_node @alias(as: "ModifierFamily")
    ...CodeStandardCard_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the card on this site, dispatched on its type by an
 * explicit switch, the cases being `DOCS_CARD_TYPES`: a component, a pattern
 * or a layout renders through `UIBlockCard`, a modifier through
 * `ModifierCard`, a modifier family through `ModifierFamilyCard` and a
 * code standard through `CodeStandardCard`; every other node through the
 * package's `CardProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, a `<div>`,
 * and every native prop reaches it.
 *
 * `import { DocsCardProjection } from "#lib/ui";`
 *
 * @implements docs.component.docs_card_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function DocsCardProjection({
  node,
  ...props
}: DocsCardProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Component":
      return (
        <UIBlockCard
          {...props}
          node={requireArmKey(data.Component, data.__typename)}
        />
      );
    case "Pattern":
      return (
        <UIBlockCard
          {...props}
          node={requireArmKey(data.Pattern, data.__typename)}
        />
      );
    case "Layout":
      return (
        <UIBlockCard
          {...props}
          node={requireArmKey(data.Layout, data.__typename)}
        />
      );
    case "Modifier":
      return (
        <ModifierCard
          {...props}
          node={requireArmKey(data.Modifier, data.__typename)}
        />
      );
    case "ModifierFamily":
      return (
        <ModifierFamilyCard
          {...props}
          node={requireArmKey(data.ModifierFamily, data.__typename)}
        />
      );
    case "CodeStandard":
      return (
        <CodeStandardCard
          {...props}
          node={requireArmKey(data.CodeStandard, data.__typename)}
        />
      );
    default:
      return <CardProjection {...props} node={data.Node} />;
  }
}
