import type React from "react";
import { ABSTRACTION_VALUES } from "../../../constants.js";
import { useMessages } from "../../../i18n/index.js";
import "./styles.css";

const componentCssClassName = "ds well-legend";

/**
 * The well's legend — canvas-local furniture, bottom-left. It exists because
 * the graph encodes things VISUALLY (a dashed italic node is abstract; an arrow
 * runs subclass → superclass) and an encoding nobody can read is decoration.
 *
 * Deliberately small and static: it explains the two encodings the well
 * actually uses and nothing else. The chip toolbar in the mode strip
 * carries the namespace axis, which is named there in words, so repeating
 * it here would be noise rather than help.
 *
 * Static content means no client state, so it server-renders with the rest
 * of the well and takes no part in the hydration argument.
 *
 * `import { WellLegend } from "./common/WellLegend/index.js";`
 */
export default function WellLegend(): React.ReactElement {
  const t = useMessages();
  return (
    <dl aria-label={t("legend.label")} className={componentCssClassName}>
      {ABSTRACTION_VALUES.map((value) => (
        <div className="row" key={value}>
          <dt>
            <span aria-hidden="true" className={["swatch", value].join(" ")} />
          </dt>
          <dd>
            {t(value === "abstract" ? "legend.abstract" : "legend.concrete")}
          </dd>
        </div>
      ))}
      <div className="row">
        <dt>
          <span aria-hidden="true" className="edge" />
        </dt>
        <dd>{t("legend.superclass")}</dd>
      </div>
      <div className="row">
        <dt>
          <span aria-hidden="true" className="edge relation" />
        </dt>
        <dd>{t("legend.relation")}</dd>
      </div>
    </dl>
  );
}
