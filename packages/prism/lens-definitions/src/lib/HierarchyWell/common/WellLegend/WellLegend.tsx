import type React from "react";
import { ABSTRACTION_VALUES } from "../../../constants.js";
import { useMessages } from "../../../i18n/index.js";

/**
 * The well's legend — canvas-local furniture, bottom-left, exactly where
 * the exhibit puts it. It exists because the graph encodes things
 * VISUALLY (a dashed italic node is abstract; an arrow runs subclass →
 * superclass) and an encoding nobody can read is decoration.
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
const WellLegend = (): React.ReactElement => {
  const t = useMessages();
  return (
    <dl
      aria-label={t("legend.label")}
      className="hierarchy-furniture hierarchy-legend"
    >
      {ABSTRACTION_VALUES.map((value) => (
        <div className="hierarchy-legend-row" key={value}>
          <dt>
            <span
              aria-hidden="true"
              className={`hierarchy-legend-swatch hierarchy-legend-swatch-${value}`}
            />
          </dt>
          <dd>
            {t(value === "abstract" ? "legend.abstract" : "legend.concrete")}
          </dd>
        </div>
      ))}
      <div className="hierarchy-legend-row">
        <dt>
          <span aria-hidden="true" className="hierarchy-legend-edge" />
        </dt>
        <dd>{t("legend.superclass")}</dd>
      </div>
      <div className="hierarchy-legend-row">
        <dt>
          <span
            aria-hidden="true"
            className="hierarchy-legend-edge hierarchy-legend-edge-relation"
          />
        </dt>
        <dd>{t("legend.relation")}</dd>
      </div>
    </dl>
  );
};

export default WellLegend;
