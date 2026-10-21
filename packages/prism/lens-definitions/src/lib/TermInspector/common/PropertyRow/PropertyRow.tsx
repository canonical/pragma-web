import type React from "react";
import formatPropertyKind from "../../../formatPropertyKind.js";
import { useMessages } from "../../../i18n/index.js";
import formatRange from "../../formatRange.js";
import { TermLink } from "../TermLink/index.js";
import type { PropertyRowProps } from "./types.js";

/**
 * One property row plus its definition line — shared by the Declared and
 * Inherited groupings. The definition rides a second row spanning the
 * table so it reads beneath its property rather than crowding the Notes
 * column.
 *
 * `import { PropertyRow } from "../PropertyRow/index.js";`
 */
export default function PropertyRow({
  classProperty,
  namespaces,
}: PropertyRowProps): React.ReactElement {
  const t = useMessages();
  const notes = [
    classProperty.required ? t("inspector.notes.required") : "",
    classProperty.singular ? t("inspector.notes.singular") : "",
  ]
    .filter(Boolean)
    .join(t("inspector.notes.separator"));
  return (
    <>
      <tr>
        <th className="cell" scope="row">
          <TermLink
            label={classProperty.property.label}
            namespaces={namespaces}
            uri={classProperty.property.uri}
          />
        </th>
        <td className="cell">
          <code className="identifier">
            {formatRange(classProperty.property.range, namespaces)}
          </code>
        </td>
        <td className="cell">
          {formatPropertyKind(classProperty.property.kind, t)}
        </td>
        <td className="cell">{notes}</td>
      </tr>
      {classProperty.property.definition ? (
        <tr>
          <td className="cell definition" colSpan={4}>
            {classProperty.property.definition}
          </td>
        </tr>
      ) : null}
    </>
  );
}
