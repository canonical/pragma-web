// Scaffolded by @canonical/summon-component:react v0.43.0

import { RowProjection, requireArmKey } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { UIBlockRow } from "#domains/components/lib";
import { ModifierFamilyRow, ModifierRow } from "#domains/modifiers/lib";
import { CodeStandardRow } from "#domains/standards/lib";
import nodeFragment from "../../../relay/__generated__/DocsRowProjection_node.graphql.js";
import type { DocsRowProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields DocsRowProjection reads from the Node it dispatches: its
 * typename; the package's row switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each
 * design-system type, aliased by the type it is on. The three UI-block
 * types share one arm, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment DocsRowProjection_node on Node {
    __typename
    ...RowProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockRow_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockRow_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockRow_node
    }
    ...ModifierRow_node @alias(as: "Modifier")
    ...ModifierFamilyRow_node @alias(as: "ModifierFamily")
    ...CodeStandardRow_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 32px list entry on this site, dispatched on its type by an
 * explicit switch, the cases being `DOCS_ROW_TYPES`: a component, a pattern
 * or a layout renders through `UIBlockRow`, a modifier through
 * `ModifierRow`, a modifier family through `ModifierFamilyRow` and a
 * code standard through `CodeStandardRow`; every other node through the
 * package's `RowProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`,
 * and every native prop reaches it.
 *
 * `import { DocsRowProjection } from "#lib/ui";`
 *
 * @implements docs.component.docs_row_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function DocsRowProjection({
  node,
  ...props
}: DocsRowProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  // The arms not yet on the identity's slots take no `lines`: it reaches
  // the UI block's arm alone.
  const { lines, ...native } = props;
  switch (data.__typename) {
    case "Component":
      return (
        <UIBlockRow
          {...props}
          node={requireArmKey(data.Component, data.__typename)}
        />
      );
    case "Pattern":
      return (
        <UIBlockRow
          {...props}
          node={requireArmKey(data.Pattern, data.__typename)}
        />
      );
    case "Layout":
      return (
        <UIBlockRow
          {...props}
          node={requireArmKey(data.Layout, data.__typename)}
        />
      );
    case "Modifier":
      return (
        <ModifierRow
          {...native}
          node={requireArmKey(data.Modifier, data.__typename)}
        />
      );
    case "ModifierFamily":
      return (
        <ModifierFamilyRow
          {...native}
          node={requireArmKey(data.ModifierFamily, data.__typename)}
        />
      );
    case "CodeStandard":
      return (
        <CodeStandardRow
          {...native}
          node={requireArmKey(data.CodeStandard, data.__typename)}
        />
      );
    default:
      return <RowProjection {...props} node={data.Node} />;
  }
}
