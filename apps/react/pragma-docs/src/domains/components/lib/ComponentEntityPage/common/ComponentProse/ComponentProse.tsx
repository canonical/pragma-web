import { Markdown } from "@canonical/react-markdown";
import { type ReactElement, useMemo } from "react";
import buildProseComponents from "./buildProseComponents.js";
import type { ComponentProseProps } from "./types.js";

const componentCssClassName = "ds component-prose editorial content-flow";

/**
 * One Markdown text of a component, its usage or its guidelines, as the
 * content of a section of the component page, which carries the heading.
 * The text's shallowest heading renders at level 3, whatever level it was
 * written at, and the others keep their steps below it. Its headings' ids
 * carry the section's id as a prefix (`usage-user-content-when-to-use`),
 * so a heading that two texts share is still one id each.
 *
 * Its root carries `.editorial` and `.content-flow`, so the typography
 * layer spaces the headings and paragraphs, and it is the section body's
 * direct child, where the view gives it every column and the 75-character
 * reading measure.
 *
 * `import { ComponentProse } from "../ComponentProse/index.js";`
 *
 * @implements docs.subcomponent.component_prose
 */
export default function ComponentProse({
  source,
  scope,
  className,
  ...props
}: ComponentProseProps): ReactElement {
  const components = useMemo(
    () => buildProseComponents(source, scope),
    [source, scope],
  );
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Markdown components={components} source={source} />
    </div>
  );
}
