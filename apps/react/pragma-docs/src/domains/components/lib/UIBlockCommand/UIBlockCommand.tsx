// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { EntityCommand, useProjectionLink } from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "../../../../relay/__generated__/UIBlockCommand_node.graphql.js";
import type { UIBlockCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields UIBlockCommand reads from the UIBlock it renders: its title,
 * compact address, class and version, its tier's title and its first
 * documentation stage's title.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment UIBlockCommand_node on UIBlock {
    __typename
    version
    _meta {
      title
      curie
      type {
        _meta {
          title
        }
      }
    }
    tier {
      _meta {
        title
      }
    }
    documentationStages(first: 1) {
      edges {
        node {
          _meta {
            title
          }
        }
      }
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ui-block-command";

/**
 * A UI block as a 56px command-palette result: its title on the first
 * line, linked to its home when the site has one and inert text when it
 * has none; its class in its tier on the second (`Component in Global`);
 * and one vital at the end, its version (`v2.1`) when it has one, else
 * its first documentation stage.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { UIBlockCommand } from "#domains/components/lib";`
 *
 * @implements docs.component.ui_block_command
 * @note Impure: reads its block from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words
 *   from the translator in scope.
 */
export default function UIBlockCommand({
  node,
  className,
  ...props
}: UIBlockCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data._meta.type._meta.title}
      LinkComponent={LinkComponent}
      location={data.tier?._meta.title}
      title={title}
      vital={
        data.version
          ? t("block.version", { version: data.version })
          : data.documentationStages.edges.at(0)?.node._meta.title
      }
    />
  );
}
