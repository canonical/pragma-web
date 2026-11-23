import type { ReactElement } from "react";
import { useDataViewsRoot } from "../../../../hooks/index.js";
import { Filters } from "../../../Filters/index.js";
import type { FiltersDisclosureProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds data-views-query-bar-filters-disclosure";

/**
 * The full filters form beside the bar before scripts run, in a native
 * disclosure whose summary counts the filters that apply: "Filters (2)".
 * Its Apply submits every filter with the search text, so the search
 * stays.
 */
export default function FiltersDisclosure({
  applied,
  className,
  ...rest
}: FiltersDisclosureProps): ReactElement {
  const { messages } = useDataViewsRoot("QueryBar");
  return (
    <details
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <summary className="summary">
        {messages.filtersDisclosure({ applied })}
      </summary>
      <Filters />
    </details>
  );
}
