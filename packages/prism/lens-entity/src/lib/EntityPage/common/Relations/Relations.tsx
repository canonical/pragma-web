import { type ReactElement, useId } from "react";
import { graphql, useFragment } from "react-relay";
import type { Relations_meta$key } from "../../../../__generated__/Relations_meta.graphql.js";
import relationsFragmentNode from "../../../../__generated__/Relations_meta.graphql.js";
import classifyCardinality from "../../../classifyCardinality.js";
import compactIri from "../../../compactIri.js";
import { CARDINALITY_MESSAGES } from "../../../constants.js";
import { Message, useMessages } from "../../../i18n/index.js";
import type { RelationsProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/** What the relations read: each field's name, cardinality and property, of
 * which the object-kind ones relate the entity to another. */
const declareRelationsFragment = (): unknown => graphql`
  fragment Relations_meta on EntityMeta {
    fields {
      name
      required
      singular
      property {
        uri
        kind
        range
      }
    }
  }
`;
void declareRelationsFragment;
/* v8 ignore stop */

const componentCssClassName = "ds relations";

/**
 * The relations the entity's class declares: each field of object kind, by
 * name, with the class its values belong to (compact) and how many it takes.
 *
 * It lists the relations a class declares, not the entities this one is
 * related to: the contract's `fields` describe the class, and reading the
 * nodes behind a field needs a selection on the entity's concrete type,
 * which a lens that compiles against the contract alone cannot write.
 *
 * `import { Relations } from "./common/Relations/index.js";`
 */
export default function Relations({
  className,
  meta,
  namespaces,
  ...props
}: RelationsProps): ReactElement {
  const t = useMessages();
  const headingId = useId();
  const { fields } = useFragment<Relations_meta$key>(
    relationsFragmentNode,
    meta,
  );
  const relations = fields.filter((field) => field.property.kind === "OBJECT");
  return (
    <section
      {...props}
      aria-labelledby={headingId}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <h2 className="heading" id={headingId}>
        {t("relations.heading")}
      </h2>
      {relations.length === 0 ? (
        <p className="empty">{t("relations.empty")}</p>
      ) : (
        <ul className="list">
          {relations.map((relation) => (
            <li
              className="relation"
              key={`${relation.name} ${relation.property.uri}`}
            >
              <Message
                elements={{
                  name: <code className="name">{relation.name}</code>,
                  range: (
                    <code className="range">
                      {compactIri(relation.property.range, namespaces)}
                    </code>
                  ),
                }}
                id="relations.entry"
                values={{
                  cardinality: t(
                    CARDINALITY_MESSAGES[classifyCardinality(relation)],
                  ),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
