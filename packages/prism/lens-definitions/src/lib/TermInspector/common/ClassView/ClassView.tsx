import type React from "react";
import { useMessages } from "../../../i18n/index.js";
import { InstanceItem } from "../InstanceItem/index.js";
import { Lineage } from "../Lineage/index.js";
import { PropertyTable } from "../PropertyTable/index.js";
import { TermLink } from "../TermLink/index.js";
import type { ClassViewProps } from "./types.js";

/**
 * The inspector's view of a class: its header, definition and lineage, its
 * subclasses, its own and its inherited properties, and its instances.
 *
 * `import { ClassView } from "./common/ClassView/index.js";`
 */
export default function ClassView({
  data,
  term,
  namespaces,
}: ClassViewProps): React.ReactElement {
  const t = useMessages();
  return (
    <article aria-labelledby="term-inspector-title">
      <header>
        <h2 id="term-inspector-title">{data.label ?? term}</h2>
        <p className="address">
          <code>{term}</code>
          {t("inspector.class.in")}
          <code>{data.namespace}</code>
          {data.isAbstract ? t("inspector.class.abstract") : ""}
        </p>
      </header>
      <p>{data.definition ?? t("inspector.definition.none")}</p>
      <h3>{t("inspector.lineage")}</h3>
      {data.superclasses.length === 0 ? (
        <p>{t("inspector.lineage.root")}</p>
      ) : (
        <Lineage
          ancestors={data.superclasses}
          namespaces={namespaces}
          self={data.label ?? term}
        />
      )}
      <h3>{t("inspector.subclasses")}</h3>
      {data.subclasses.length === 0 ? (
        <p>{t("inspector.subclasses.none")}</p>
      ) : (
        <ul>
          {data.subclasses.map((subclass) => (
            <li key={subclass.uri}>
              <TermLink
                label={subclass.label}
                namespaces={namespaces}
                uri={subclass.uri}
              />
            </li>
          ))}
        </ul>
      )}
      {/* Properties split by provenance: the class's OWN properties
        under "Properties", those it inherits from an ancestor under
        "Inherited". The `inherited` boolean is already fetched; the source
        ancestor is NOT on the fragment, so the grouping names that the
        property is inherited without claiming which class it came from
        (that would need a query change). Each row also carries the
        property's own definition. */}
      {(() => {
        const declared = data.properties.filter(
          (classProperty) => !classProperty.inherited,
        );
        const inherited = data.properties.filter(
          (classProperty) => classProperty.inherited,
        );
        return (
          <>
            <h3>{t("inspector.properties")}</h3>
            {declared.length === 0 ? (
              <p>{t("inspector.properties.none")}</p>
            ) : (
              <PropertyTable namespaces={namespaces} properties={declared} />
            )}
            {inherited.length === 0 ? null : (
              <>
                <h3>{t("inspector.inherited")}</h3>
                <PropertyTable namespaces={namespaces} properties={inherited} />
              </>
            )}
          </>
        );
      })()}
      <h3>{t("inspector.instances")}</h3>
      {data.instances.edges.length === 0 ? (
        <p>
          {t(
            data.instanceCount === 0
              ? "inspector.instances.unrecorded"
              : "inspector.instances.unnamed",
            { count: data.instanceCount },
          )}
        </p>
      ) : (
        <>
          <ul>
            {data.instances.edges.map(({ node }) => (
              <InstanceItem key={node.uri} node={node} />
            ))}
          </ul>
          {data.instances.pageInfo.hasNextPage ? (
            <p>
              {t("inspector.instances.more", { count: data.instanceCount })}
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}
