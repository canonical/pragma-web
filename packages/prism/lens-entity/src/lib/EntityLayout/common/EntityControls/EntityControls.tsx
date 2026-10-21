import type { ReactElement } from "react";
import { ENTITY_VIEWS } from "../../../constants.js";
import { useEntityFilter } from "../../../EntityFilterProvider/index.js";
import { useMessages } from "../../../i18n/index.js";
import { VIEW_MESSAGES } from "./constants.js";
import type { EntityControlsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds entity-controls";

/**
 * The strip's `controls` tenant on the index: the search box that narrows
 * the loaded entries, and the toggle between the rows and the cards views.
 * Both write the shared filter, which the index in the canvas reads.
 *
 * It reads no query, so it needs no `SocketGuard`: the search box stands
 * even while the index loads.
 *
 * It takes the native props of its `<div>` root and spreads them onto it;
 * a consumer `className` merges after its own.
 *
 * `import { EntityControls } from "./common/EntityControls/index.js";`
 */
export default function EntityControls({
  className,
  ...props
}: EntityControlsProps): ReactElement {
  const t = useMessages();
  const { filter, setFilter } = useEntityFilter();
  return (
    <div
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="entity-controls"
    >
      <input
        aria-label={t("controls.search.label")}
        className="search"
        onChange={(event) => {
          setFilter({ ...filter, text: event.currentTarget.value });
        }}
        placeholder={t("controls.search.placeholder")}
        type="search"
        value={filter.text}
      />
      <fieldset aria-label={t("controls.view.label")} className="views">
        {ENTITY_VIEWS.map((view) => (
          <button
            aria-pressed={filter.view === view}
            className="view"
            key={view}
            onClick={() => {
              setFilter({ ...filter, view });
            }}
            type="button"
          >
            {t(VIEW_MESSAGES[view])}
          </button>
        ))}
      </fieldset>
    </div>
  );
}
