import { Announcement } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { isAdmonitionKind } from "../../admonitions/index.js";
import type { MarkdownElementProps } from "../../types.js";
import { ADMONITION_PRESENTATION } from "./constants.js";

/**
 * Render a Markdown blockquote. An admonition (`> [!NOTE]`, `> [!WARNING]`, …)
 * becomes a design-system announcement whose criticality and heading follow
 * its kind; any other quote stays a `<blockquote>` carrying its own attributes.
 * The announcement is a different element, so a quote's attributes (such as
 * `cite`) do not carry over to it.
 */
export default function MarkdownBlockquote({
  node: _node,
  children,
  "data-admonition": admonition,
  ...props
}: MarkdownElementProps<"blockquote"> & {
  readonly "data-admonition"?: unknown;
}): ReactElement {
  if (!isAdmonitionKind(admonition)) {
    return <blockquote {...props}>{children}</blockquote>;
  }

  const { criticality, label } = ADMONITION_PRESENTATION[admonition];

  return (
    <Announcement criticality={criticality} heading={label}>
      {children}
    </Announcement>
  );
}
