import { Markdown } from "@canonical/react-markdown";
import type { ReactElement } from "react";
import { PROSE_COMPONENTS } from "./constants.js";
import type { ComponentProseProps } from "./types.js";

const componentCssClassName = "ds component-prose editorial content-flow";

/**
 * One Markdown text of a component, its usage or its guidelines, as the
 * content of a section of the component page, which carries the heading.
 * The text's own headings start at level 3.
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
  className,
  ...props
}: ComponentProseProps): ReactElement {
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <Markdown components={PROSE_COMPONENTS} source={source} />
    </div>
  );
}
