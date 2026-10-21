import type React from "react";
import { useMessages } from "../../../i18n/index.js";
import { PropertyRow } from "../PropertyRow/index.js";
import type { PropertyTableProps } from "./types.js";

/** The role class the inspector's stylesheet styles the table by. */
const componentCssClassName = "table";

/**
 * The four-column property table head — shared by both groupings.
 *
 * `import { PropertyTable } from "../PropertyTable/index.js";`
 */
export default function PropertyTable({
  className,
  properties,
  namespaces,
  ...props
}: PropertyTableProps): React.ReactElement {
  const t = useMessages();
  return (
    <table
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <thead>
        <tr>
          <th className="cell" scope="col">
            {t("inspector.table.property")}
          </th>
          <th className="cell" scope="col">
            {t("inspector.table.range")}
          </th>
          <th className="cell" scope="col">
            {t("inspector.table.kind")}
          </th>
          <th className="cell" scope="col">
            {t("inspector.table.notes")}
          </th>
        </tr>
      </thead>
      <tbody>
        {properties.map((classProperty) => (
          <PropertyRow
            classProperty={classProperty}
            key={classProperty.property.uri}
            namespaces={namespaces}
          />
        ))}
      </tbody>
    </table>
  );
}
