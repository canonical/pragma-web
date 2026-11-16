// Scaffolded by @canonical/summon-component:react v0.43.0

import { CommandProjection, requireArmKey } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { UIBlockCommand } from "#domains/components/lib";
import { ModifierCommand, ModifierFamilyCommand } from "#domains/modifiers/lib";
import { CodeStandardCommand } from "#domains/standards/lib";
import nodeFragment from "../../../relay/__generated__/DocsCommandProjection_node.graphql.js";
import type { DocsCommandProjectionProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields DocsCommandProjection reads from the Node it dispatches: its
 * typename; the package's command switch, spread aliased as `Node`, for
 * every type the site does not project itself; and the arm of each
 * design-system type, aliased by the type it is on. The three UI-block
 * types share one arm, each narrowed by an inline fragment, so each alias
 * holds a key for its own type alone.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment DocsCommandProjection_node on Node {
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
 * Any graph node as the palette's result row on this site, dispatched on its type by an
 * explicit switch, the cases being `DOCS_COMMAND_TYPES`: a component, a pattern
 * or a layout renders through `UIBlockCommand`, a modifier through
 * `ModifierCommand`, a modifier family through `ModifierFamilyCommand` and a
 * code standard through `CodeStandardCommand`; every other node through the
 * package's `CommandProjection`, which renders an ontology class through its
 * own arm and any other node through its `Node` arm.
 *
 * It renders no element of its own: the arm renders the root, an `<li>`,
 * and every native prop reaches it.
 *
 * `import { DocsCommandProjection } from "#lib/ui";`
 *
 * @implements docs.component.docs_command_projection
 * @note Impure: reads its node from the Relay store.
 */
export default function DocsCommandProjection({
  node,
  ...props
}: DocsCommandProjectionProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  switch (data.__typename) {
    case "Component":
      return (
        <UIBlockCommand
          {...props}
          node={requireArmKey(data.Component, data.__typename)}
        />
      );
    case "Pattern":
      return (
        <UIBlockCommand
          {...props}
          node={requireArmKey(data.Pattern, data.__typename)}
        />
      );
    case "Layout":
      return (
        <UIBlockCommand
          {...props}
          node={requireArmKey(data.Layout, data.__typename)}
        />
      );
    case "Modifier":
      return (
        <ModifierCommand
          {...props}
          node={requireArmKey(data.Modifier, data.__typename)}
        />
      );
    case "ModifierFamily":
      return (
        <ModifierFamilyCommand
          {...props}
          node={requireArmKey(data.ModifierFamily, data.__typename)}
        />
      );
    case "CodeStandard":
      return (
        <CodeStandardCommand
          {...props}
          node={requireArmKey(data.CodeStandard, data.__typename)}
        />
      );
    default:
      return <CommandProjection {...props} node={data.Node} />;
  }
}
