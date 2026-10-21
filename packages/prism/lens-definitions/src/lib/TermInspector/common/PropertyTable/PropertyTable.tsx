import type React from "react";
import { useMessages } from "../../../i18n/index.js";
import { PropertyRow } from "../PropertyRow/index.js";
import type { PropertyTableProps } from "./types.js";

/**
 * The four-column property table head — shared by both groupings.
 *
 * `import { PropertyTable } from "../PropertyTable/index.js";`
 */
export default function PropertyTable({
  properties,
  namespaces,
}: PropertyTableProps): React.ReactElement {
  const t = useMessages();
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">{t("inspector.table.property")}</th>
          <th scope="col">{t("inspector.table.range")}</th>
          <th scope="col">{t("inspector.table.kind")}</th>
          <th scope="col">{t("inspector.table.notes")}</th>
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
