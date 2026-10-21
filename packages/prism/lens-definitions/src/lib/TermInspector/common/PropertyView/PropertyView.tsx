import type React from "react";
import { Message, useMessages } from "../../../i18n/index.js";
import formatRange from "../../formatRange.js";
import { TermLink } from "../TermLink/index.js";
import type { PropertyViewProps } from "./types.js";

/**
 * The inspector's view of a property: its header and definition, then its
 * kind, functionality, range, domain and inverse.
 *
 * `import { PropertyView } from "./common/PropertyView/index.js";`
 */
export default function PropertyView({
  data,
  term,
  namespaces,
}: PropertyViewProps): React.ReactElement {
  const t = useMessages();
  return (
    <article aria-labelledby="term-inspector-title">
      <header>
        <h2 id="term-inspector-title">{data.label ?? term}</h2>
        <p className="address">
          <Message
            elements={{
              term: <code>{term}</code>,
              namespace: <code>{data.namespace}</code>,
            }}
            id="inspector.property.address"
          />
        </p>
      </header>
      <p>{data.definition ?? t("inspector.definition.none")}</p>
      <dl>
        <dt>{t("inspector.property.kind")}</dt>
        <dd>{data.kind.toLowerCase()}</dd>
        <dt>{t("inspector.property.functional")}</dt>
        <dd>{t(data.functional ? "inspector.yes" : "inspector.no")}</dd>
        <dt>{t("inspector.property.range")}</dt>
        <dd>
          <code>{formatRange(data.range, namespaces)}</code>
        </dd>
        <dt>{t("inspector.property.domain")}</dt>
        <dd>
          {data.domain ? (
            <TermLink
              label={data.domain.label}
              namespaces={namespaces}
              uri={data.domain.uri}
            />
          ) : (
            t("inspector.domain.unstated")
          )}
        </dd>
        <dt>{t("inspector.property.inverse")}</dt>
        <dd>
          {data.inverse ? (
            <TermLink
              label={data.inverse.label}
              namespaces={namespaces}
              uri={data.inverse.uri}
            />
          ) : (
            t("inspector.inverse.none")
          )}
        </dd>
      </dl>
    </article>
  );
}
