import { useHome } from "@canonical/prism-core";
import type { ReactNode } from "react";
import { useProjectionLink } from "../../../../projections/index.js";
import type { NodeTitleProps } from "./types.js";

/**
 * A node's title in a table of facts: a link to the node's home through
 * the site's link, or the title alone when the node has no home.
 *
 * @implements prism.subcomponent.node_title
 * @note Impure: reads the site's homes, the router and the projection's link.
 */
export default function NodeTitle({
  typename,
  curie,
  title,
}: NodeTitleProps): ReactNode {
  const href = useHome({ __typename: typename, uri: curie });
  const LinkComponent = useProjectionLink();
  return href === undefined ? (
    title
  ) : (
    <LinkComponent href={href}>{title}</LinkComponent>
  );
}
