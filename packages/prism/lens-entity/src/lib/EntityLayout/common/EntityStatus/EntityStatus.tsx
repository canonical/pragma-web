import type { ReactElement } from "react";
import { useMessages } from "../../../i18n/index.js";
import useIndexStripQuery from "../../hooks/useIndexStripQuery.js";
import type { EntityStatusProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds entity-status";

/**
 * The strip's `status` tenant on the index: how many loaded entries the
 * search shows, out of how many instances the class has. It counts with the
 * same matcher the index filters by, over the same operation, so the figure
 * and the canvas cannot disagree. `aria-live` announces the change as the
 * reader types.
 *
 * It takes the native props of its `<output>` root and spreads them onto
 * it; a consumer `className` merges after its own.
 *
 * `import { EntityStatus } from "./common/EntityStatus/index.js";`
 */
export default function EntityStatus({
  binding,
  className,
  ...props
}: EntityStatusProps): ReactElement {
  const t = useMessages();
  const { count, visible } = useIndexStripQuery(binding);
  return (
    <output
      aria-live="polite"
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="entity-status"
    >
      {t("status.count", { visible, count })}
    </output>
  );
}
