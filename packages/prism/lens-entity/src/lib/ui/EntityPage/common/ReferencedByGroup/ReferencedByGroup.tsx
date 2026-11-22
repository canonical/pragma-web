import type { ReactElement } from "react";
import { StatementGroup } from "../StatementGroup/index.js";
import type { ReferencedByGroupProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds referenced-by-group";

/**
 * One group of what references the entity, under its page's Referenced by
 * section: its title, then its values, both across every column of the
 * section, so a long label stays on one line and the chips wrap across
 * the measure.
 *
 * `import { ReferencedByGroup } from "../ReferencedByGroup/index.js";`
 *
 * @implements prism.subcomponent.referenced_by_group
 */
export default function ReferencedByGroup({
  className,
  group,
  title,
  ...props
}: ReferencedByGroupProps): ReactElement {
  return (
    <section
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <h3 className="title">{title}</h3>
      <StatementGroup group={group} />
    </section>
  );
}
