// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderArm } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../relay/__generated__/SiteCommandProjection_node.graphql.js";
import { siteProjectionMaps } from "../constants.js";
import type { SiteCommandProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields SiteCommandProjection reads from the Node it dispatches: its
 * typename; the package's command composite, spread aliased as `Node`, for
 * every type the site does not project itself; and the projection of each
 * design-system type, aliased by the type it is on. The three UI-block types
 * share one projection, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment SiteCommandProjection_node on Node {
    __typename
    ...CommandProjection_node @alias(as: "Node")
    ... on Component @alias(as: "Component") {
      ...UIBlockCommand_node
    }
    ... on Pattern @alias(as: "Pattern") {
      ...UIBlockCommand_node
    }
    ... on Layout @alias(as: "Layout") {
      ...UIBlockCommand_node
    }
    ...ModifierCommand_node @alias(as: "Modifier")
    ...ModifierFamilyCommand_node @alias(as: "ModifierFamily")
    ...CodeStandardCommand_node @alias(as: "CodeStandard")
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * Any graph node as the 56px command-palette result on this site, dispatched on
 * its type: a component, a pattern or a layout renders through
 * `UIBlockCommand`, a modifier through `ModifierCommand`, a modifier family
 * through
 * `ModifierFamilyCommand` and a code standard through `CodeStandardCommand`;
 * every other node through the package's `CommandProjection`, which renders an
 * ontology class through its own arm and any other node through the arm the
 * site's provided maps hold for it.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`, and
 * every native prop reaches it.
 *
 * `import { SiteCommandProjection } from "#lib/ui";`
 *
 * @implements docs.component.site_command_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function SiteCommandProjection({
  node,
  ...props
}: SiteCommandProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  return renderArm(siteProjectionMaps.command, data, props);
}
