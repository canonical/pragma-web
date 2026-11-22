import { CopyButton } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { EntityIcon } from "../../../EntityIcon/index.js";
import type { EntityHeaderProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds entity-header";

/**
 * The entity page's identity header: the class's mark before the entity's
 * name, the page's one level-1 heading; its summary; then the status line,
 * the class and the compact address followed by Copy, which announces
 * "Copied" through its live region. The address and Copy wrap as one, and
 * only the address is muted: the class's chip keeps its own colours.
 *
 * `import { EntityHeader } from "../EntityHeader/index.js";`
 *
 * @implements prism.subcomponent.entity_header
 */
export default function EntityHeader({
  address,
  className,
  kind,
  summary,
  title,
  ...props
}: EntityHeaderProps): ReactElement {
  return (
    <header
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <h1 className="title">
        <EntityIcon className="mark" />
        {title}
      </h1>
      {summary === undefined ? null : <p className="summary">{summary}</p>}
      <p className="status">
        <span className="kind">{kind}</span>
        <span className="locator">
          <code className="address">{address}</code>
          <CopyButton text={address} />
        </span>
      </p>
    </header>
  );
}
