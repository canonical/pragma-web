import type { ReactElement } from "react";
import { useMessages } from "../../../i18n/index.js";
import useIndexStripQuery from "../../hooks/useIndexStripQuery.js";
import type { StatusProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds entity-status";

/**
 * The strip's `status` tenant on the index: how many loaded entries the
 * search shows, out of how many instances the class has. It counts with the
 * same matcher the index filters by, over the same operation, so the figure
 * and the canvas cannot disagree. `aria-live` announces the change as the
 * reader types.
 *
 * `import { Status } from "./common/Status/index.js";`
 */
export default function Status({ binding }: StatusProps): ReactElement {
  const t = useMessages();
  const { count, visible } = useIndexStripQuery(binding);
  return (
    <output
      aria-live="polite"
      className={componentCssClassName}
      data-slot="entity-status"
    >
      {t("status.count", { visible, count })}
    </output>
  );
}
