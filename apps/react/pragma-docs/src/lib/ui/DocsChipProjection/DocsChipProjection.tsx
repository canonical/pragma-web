// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  NodeChip,
  OntologyClassChip,
  requireArmKey,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { UIBlockChip } from "#domains/components/lib";
import { ModifierChip, ModifierFamilyChip } from "#domains/modifiers/lib";
import { CodeStandardChip } from "#domains/standards/lib";
import nodeFragment from "../../../relay/__generated__/DocsChipProjection_node.graphql.js";
import type { DocsChipProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields DocsChipProjection reads from the Node it dispatches: its
 * typename; the package's `Node` arm, spread aliased as `Node`, for
 * every type no other arm takes; the package's ontology class arm; and the arm of each
 * design-system type, aliased by the type it is on. The three UI-block
 * types share one arm, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment DocsChipProjection_node on Node {
    __typename
    ...NodeChip_node @alias(as: "Node")
    ...OntologyClassChip_node @alias(as: "OntologyClass")
    ... on Component @alias(as: "Component") {
      ...UIBlockChip_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockChip_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockChip_node
    }
    ...ModifierChip_node @alias(as: "Modifier")
    ...ModifierFamilyChip_node @alias(as: "ModifierFamily")
    ...CodeStandardChip_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the inline mention on this site, dispatched on its type by an
 * explicit switch, the cases being `DOCS_CHIP_TYPES`: a component, a pattern
 * or a layout renders through `UIBlockChip`, a modifier through
 * `ModifierChip`, a modifier family through `ModifierFamilyChip` and a
 * code standard through `CodeStandardChip`; an ontology class through the
 * package's class arm, `OntologyClassChip`; every other node through the
 * package's `Node` arm, `NodeChip`. It spreads the package's arms, not its
 * switch: the package's switch reaches this one through the site slot, so
 * spreading it here would make a fragment cycle.
 *
 * It renders no element of its own: the arm renders the root, a `<span>`,
 * and every native prop reaches it.
 *
 * `import { DocsChipProjection } from "#lib/ui";`
 *
 * @implements docs.component.docs_chip_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function DocsChipProjection({
  node,
  ...props
}: DocsChipProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  // The arms not yet on the identity's slots take no `linked`: it reaches
  // the UI block's arm alone.
  const { linked, ...native } = props;
  switch (data.__typename) {
    case "Component":
      return (
        <UIBlockChip
          {...props}
          node={requireArmKey(data.Component, data.__typename)}
        />
      );
    case "Pattern":
      return (
        <UIBlockChip
          {...props}
          node={requireArmKey(data.Pattern, data.__typename)}
        />
      );
    case "Layout":
      return (
        <UIBlockChip
          {...props}
          node={requireArmKey(data.Layout, data.__typename)}
        />
      );
    case "Modifier":
      return (
        <ModifierChip
          {...native}
          node={requireArmKey(data.Modifier, data.__typename)}
        />
      );
    case "ModifierFamily":
      return (
        <ModifierFamilyChip
          {...native}
          node={requireArmKey(data.ModifierFamily, data.__typename)}
        />
      );
    case "CodeStandard":
      return (
        <CodeStandardChip
          {...native}
          node={requireArmKey(data.CodeStandard, data.__typename)}
        />
      );
    case "OntologyClass":
      return (
        <OntologyClassChip
          {...props}
          node={requireArmKey(data.OntologyClass, data.__typename)}
        />
      );
    default:
      return <NodeChip {...props} node={data.Node} />;
  }
}
