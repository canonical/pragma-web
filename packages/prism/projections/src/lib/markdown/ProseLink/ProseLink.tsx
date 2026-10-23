import type { ReactElement } from "react";
import { ChipProjection } from "../../ChipProjection/index.js";
import { useProseReference } from "../ProseReferences/index.js";
import type { ProseLinkProps } from "./types.js";

/**
 * A link in prose. When its href names one of the page's prose references,
 * by absolute IRI or compact address, it renders that node's chip, labelled
 * with the author's text and linked to the node's home. Otherwise it is the
 * plain anchor its author wrote.
 *
 * Its root depends on the page's references, not on a prop: the chip arm's
 * `<span>` for a reference, an `<a>` with the given props for anything
 * else.
 *
 * Reachable as `markdownComponents.a`.
 */
export default function ProseLink({
  node: _node,
  href,
  children,
  ...props
}: ProseLinkProps): ReactElement {
  const reference = useProseReference(href);
  if (reference === undefined) {
    return (
      <a {...props} href={href}>
        {children}
      </a>
    );
  }
  return <ChipProjection node={reference}>{children}</ChipProjection>;
}
