import type React from "react";
import formatPropertyKind from "../../../formatPropertyKind.js";
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
        <h2 className="heading" id="term-inspector-title">
          {data.label ?? term}
        </h2>
        <p className="address">
          <Message
            elements={{
              term: <code className="identifier">{term}</code>,
              namespace: <code className="identifier">{data.namespace}</code>,
            }}
            id="inspector.property.address"
          />
        </p>
      </header>
      <p>{data.definition ?? t("inspector.definition.none")}</p>
      <dl className="details">
        <dt className="key">{t("inspector.property.kind")}</dt>
        <dd className="value">{formatPropertyKind(data.kind, t)}</dd>
        <dt className="key">{t("inspector.property.functional")}</dt>
        <dd className="value">
          {t(data.functional ? "inspector.yes" : "inspector.no")}
        </dd>
        <dt className="key">{t("inspector.property.range")}</dt>
        <dd className="value">
          <code className="identifier">
            {formatRange(data.range, namespaces)}
          </code>
        </dd>
        <dt className="key">{t("inspector.property.domain")}</dt>
        <dd className="value">
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
        <dt className="key">{t("inspector.property.inverse")}</dt>
        <dd className="value">
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
