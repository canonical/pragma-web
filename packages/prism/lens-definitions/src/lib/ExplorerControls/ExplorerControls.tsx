import type React from "react";
import { ABSTRACTION_VALUES } from "../constants.js";
import { type MessageKey, useMessages } from "../i18n/index.js";
import { toggleIn } from "../lensFilter.js";
import type { Abstraction } from "../types.js";
import type { ExplorerControlsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds explorer-controls";

/** The catalog keys of what each abstraction chip says, and what it means.
 * The copy names the axis for what it IS — a fact about the class — never
 * dressing it up as maturity, which this ontology does not record. */
const ABSTRACTION_COPY: {
  readonly [K in Abstraction]: {
    readonly label: MessageKey;
    readonly hint: MessageKey;
  };
} = {
  abstract: {
    label: "controls.abstraction.abstract.label",
    hint: "controls.abstraction.abstract.hint",
  },
  concrete: {
    label: "controls.abstraction.concrete.label",
    hint: "controls.abstraction.concrete.hint",
  },
};

/**
 * The explorer's chip toolbar — the mode strip's `controls` socket
 * (`slot.explorer-controls`), claimed by the Definitions routes.
 *
 * The axes are the two the graph ACTUALLY carries per class: abstraction
 * (`isAbstract`) and provenance (the owning ontology's prefix). They are
 * named for what they are. This lens deliberately does NOT show an
 * experimental/stable axis: `OntologyClass` has no lifecycle, status or
 * channel field, and the `Tag` vocabulary that does carry a channel facet
 * applies to UIBlocks rather than to ontology classes — so a maturity
 * filter here would be a label over data that does not exist.
 *
 * Each chip is a real toggle button carrying `aria-pressed`, so its state
 * is available to assistive tech and not merely to the eye. Toggling
 * dims the rail and hides in the graph (the asymmetry) — it never
 * navigates, because a way of looking is not a place to link to.
 *
 * `import { ExplorerControls } from "../ExplorerControls/index.js";`
 */
const ExplorerControls = ({
  className,
  filter,
  namespaceLabels,
  onFilterChange,
}: ExplorerControlsProps): React.ReactElement => {
  const t = useMessages();
  const prefixes = namespaceLabels.map(({ prefix }) => prefix);

  return (
    <div
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="explorer-controls"
    >
      <fieldset
        aria-label={t("controls.abstraction.label")}
        className="chip-group"
      >
        {ABSTRACTION_VALUES.map((value) => {
          const on = filter.abstractions.includes(value);
          return (
            <button
              aria-pressed={on}
              className="chip"
              key={value}
              onClick={() => {
                onFilterChange({
                  ...filter,
                  abstractions: toggleIn(
                    filter.abstractions,
                    ABSTRACTION_VALUES,
                    value,
                  ),
                });
              }}
              title={t(ABSTRACTION_COPY[value].hint)}
              type="button"
            >
              <span aria-hidden="true" className="swatch" />
              {t(ABSTRACTION_COPY[value].label)}
            </button>
          );
        })}
      </fieldset>
      <fieldset
        aria-label={t("controls.ontology.label")}
        className="chip-group"
      >
        {namespaceLabels.map(({ prefix, label }) => {
          const on = filter.namespaces.includes(prefix);
          return (
            <button
              aria-pressed={on}
              className="chip"
              key={prefix}
              onClick={() => {
                onFilterChange({
                  ...filter,
                  namespaces: toggleIn(filter.namespaces, prefixes, prefix),
                });
              }}
              title={t("controls.ontology.hint", { label })}
              type="button"
            >
              <span aria-hidden="true" className="swatch" />
              {label}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
};

export default ExplorerControls;
