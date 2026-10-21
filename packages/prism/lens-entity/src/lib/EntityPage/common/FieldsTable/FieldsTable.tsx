import { type ReactElement, useId } from "react";
import { graphql, useFragment } from "react-relay";
import type { FieldsTable_meta$key } from "../../../../__generated__/FieldsTable_meta.graphql.js";
import fieldsTableFragmentNode from "../../../../__generated__/FieldsTable_meta.graphql.js";
import classifyCardinality from "../../../classifyCardinality.js";
import compactIri from "../../../compactIri.js";
import { CARDINALITY_MESSAGES } from "../../../constants.js";
import { useMessages } from "../../../i18n/index.js";
import { KIND_MESSAGES } from "./constants.js";
import type { FieldsTableProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the table reads: every field the entity's class declares, its own
 * and its superclasses'. */
const declareFieldsTableFragment = (): unknown => graphql`
  fragment FieldsTable_meta on EntityMeta {
    fields {
      name
      required
      singular
      inherited
      property {
        uri
        kind
        range
      }
    }
  }
`;
void declareFieldsTableFragment;
/* v8 ignore stop */

const componentCssClassName = "ds fields-table";

/**
 * The fields the entity's class declares, one row each: the field's name,
 * the property it answers to and the range of its values, both in compact
 * form, the property's kind, and the field's cardinality on the class. A
 * field the class inherits from a superclass says so.
 *
 * The table describes the class's schema, the fields an instance may carry,
 * not the values this instance holds: the contract states no value of an
 * arbitrary field.
 *
 * `import { FieldsTable } from "./common/FieldsTable/index.js";`
 */
export default function FieldsTable({
  className,
  meta,
  namespaces,
  ...props
}: FieldsTableProps): ReactElement {
  const t = useMessages();
  const headingId = useId();
  const { fields } = useFragment<FieldsTable_meta$key>(
    fieldsTableFragmentNode,
    meta,
  );
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <h2 className="heading" id={headingId}>
        {t("fields.heading")}
      </h2>
      <div className="scroll">
        <table className="table">
          <thead>
            <tr>
              <th className="cell" scope="col">
                {t("fields.column.name")}
              </th>
              <th className="cell" scope="col">
                {t("fields.column.property")}
              </th>
              <th className="cell" scope="col">
                {t("fields.column.kind")}
              </th>
              <th className="cell" scope="col">
                {t("fields.column.range")}
              </th>
              <th className="cell" scope="col">
                {t("fields.column.cardinality")}
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const kind = KIND_MESSAGES.get(field.property.kind);
              return (
                // A class may declare a property and inherit it too; the
                // pair is unique.
                <tr
                  className="field"
                  key={`${field.inherited ? "inherited" : "own"} ${field.property.uri}`}
                >
                  <th className="cell" scope="row">
                    <code className="name">{field.name}</code>
                    {field.inherited ? (
                      <span className="inherited">{t("fields.inherited")}</span>
                    ) : null}
                  </th>
                  <td className="cell">
                    <code>{compactIri(field.property.uri, namespaces)}</code>
                  </td>
                  <td className="cell">
                    {kind === undefined ? field.property.kind : t(kind)}
                  </td>
                  <td className="cell">
                    <code>{compactIri(field.property.range, namespaces)}</code>
                  </td>
                  <td className="cell">
                    {t(CARDINALITY_MESSAGES[classifyCardinality(field)])}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
