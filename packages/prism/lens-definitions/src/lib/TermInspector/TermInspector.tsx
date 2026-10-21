import { EntityChip } from "@canonical/prism-projections";
import { Link } from "@canonical/router-react";
import type React from "react";
import { graphql, useFragment } from "react-relay";
import type {
  TermInspector_class$data,
  TermInspector_class$key,
} from "../../__generated__/TermInspector_class.graphql.js";
import termInspectorClassFragmentNode from "../../__generated__/TermInspector_class.graphql.js";
import type {
  TermInspector_property$data,
  TermInspector_property$key,
} from "../../__generated__/TermInspector_property.graphql.js";
import termInspectorPropertyFragmentNode from "../../__generated__/TermInspector_property.graphql.js";
import { useMessages } from "../i18n/index.js";
import type { OntologyNamespace } from "../types.js";
import { compactUri } from "../uris.js";
import type { TermInspectorProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * Codegen sources of truth for the inspector's TWO fragments — the term
 * route's lookup is a union-by-hand (`ontologyClass` OR `ontologyProperty`,
 * whichever is non-null), so the inspector masks one fragment per shape
 * and picks whichever key it was handed. Ontology types carry NO Node ids
 * (plain fragments, no @refetchable). Never invoked.
 */
const declareTermInspectorClassFragment = (): unknown => graphql`
  fragment TermInspector_class on OntologyClass {
    uri
    label
    definition
    isAbstract
    namespace
    instanceCount
    superclass {
      uri
      label
    }
    superclasses {
      uri
      label
    }
    subclasses {
      uri
      label
    }
    properties {
      required
      singular
      inherited
      property {
        uri
        label
        definition
        range
        kind
      }
    }
    instances(first: 12) {
      edges {
        node {
          uri
          _meta {
            curie
          }
          ...EntityChip_node
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;
void declareTermInspectorClassFragment;
/* v8 ignore stop */

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * DELIBERATELY NOT SELECTED: `acceptanceCriteria` and `completionGuidance`.
 * ke-graphql still emits both unconditionally on `OntologyProperty`, but
 * they are annotation-derived and excluded from the contract on purpose,
 * so an arbitrary conforming provider does not have them. GraphQL has no
 * optional field selection: one operation cannot select a field where it
 * exists and skip it where it does not. This lens feature therefore cannot
 * exist against an arbitrary provider, and the honest answer is to drop
 * it rather than fork the operation behind a capability probe.
 */
const declareTermInspectorPropertyFragment = (): unknown => graphql`
  fragment TermInspector_property on OntologyProperty {
    uri
    label
    definition
    kind
    functional
    range
    namespace
    domain {
      uri
      label
    }
    inverse {
      uri
      label
    }
  }
`;
void declareTermInspectorPropertyFragment;
/* v8 ignore stop */

const componentCssClassName = "ds term-inspector";

/** A term link for a related class/property, labelled by the graph. */
const TermLink = ({
  uri,
  label,
  namespaces,
}: {
  readonly uri: string;
  readonly label: string | null | undefined;
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => {
  const prefixed = compactUri(uri, namespaces);
  return (
    <Link params={{ term: prefixed }} to="definitionsTerm">
      {label ?? prefixed}
    </Link>
  );
};

/** `https://…/Subcomponent` → `ds:Subcomponent`; datatype ranges (e.g.
 * `xsd:string` shapes) pass through the codec unchanged. */
const formatRange = (
  range: string,
  namespaces: readonly OntologyNamespace[],
): string => compactUri(range, namespaces);

/**
 * The subset-of glyph the lineage breadcrumb reads with — U+2282, "a is a
 * subclass of b". Kept as a named constant so the ancestry chain and any
 * future legend cannot drift apart on the symbol.
 */
const SUBCLASS_OF = "⊂";

/**
 * The class's ancestry as an ordered breadcrumb chain — the reference
 * ontology explorer's `.lineage` (B8). `superclasses` arrives nearest-first
 * (direct parent, …, root — the same order the flat list marked "(direct)"
 * on the head), so the chain reads self ⊂ parent ⊂ … ⊂ root left to right.
 * Every ancestor is a real term link; the leaf (the class itself) is plain
 * text, since it is the page the reader is already on. Pure over data the
 * fragment already fetches — no query change.
 */
const Lineage = ({
  self,
  ancestors,
  namespaces,
}: {
  readonly self: string;
  readonly ancestors: readonly {
    readonly uri: string;
    readonly label: string | null | undefined;
  }[];
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => (
  <p className="term-inspector-lineage">
    <span className="term-inspector-lineage-self">{self}</span>
    {ancestors.map((ancestor) => (
      <span key={ancestor.uri}>
        <span aria-hidden="true" className="term-inspector-lineage-glyph">
          {" "}
          {SUBCLASS_OF}{" "}
        </span>
        <TermLink
          label={ancestor.label}
          namespaces={namespaces}
          uri={ancestor.uri}
        />
      </span>
    ))}
  </p>
);

/** One property row plus its definition line — shared by the Declared and
 * Inherited groupings (B7/B9). The definition (already fetched, previously
 * dropped) rides a second row spanning the table so it reads beneath its
 * property rather than crowding the Notes column. */
const PropertyRow = ({
  classProperty,
  namespaces,
}: {
  readonly classProperty: TermInspector_class$data["properties"][number];
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => {
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
        <th scope="row">
          <TermLink
            label={classProperty.property.label}
            namespaces={namespaces}
            uri={classProperty.property.uri}
          />
        </th>
        <td>
          <code>{formatRange(classProperty.property.range, namespaces)}</code>
        </td>
        <td>{classProperty.property.kind.toLowerCase()}</td>
        <td>{notes}</td>
      </tr>
      {classProperty.property.definition ? (
        <tr className="term-inspector-property-definition">
          <td colSpan={4}>{classProperty.property.definition}</td>
        </tr>
      ) : null}
    </>
  );
};

/** The four-column property table head — shared by both groupings. */
const PropertyTable = ({
  properties,
  namespaces,
}: {
  readonly properties: readonly TermInspector_class$data["properties"][number][];
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => {
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
};

/**
 * One instance of the class, mentioned as an entity chip: it links to the
 * page the site declares as the home of the instance's type and reads as
 * text where the site declares none. Its compact address follows it, the
 * same `_meta.curie` the chip's link addresses it by; `uri` stays Relay's
 * identity and the list key.
 */
const InstanceItem = ({
  node,
}: {
  readonly node: TermInspector_class$data["instances"]["edges"][number]["node"];
}): React.ReactElement => (
  <li>
    <EntityChip node={node} /> <code>{node._meta.curie}</code>
  </li>
);

const ClassView = ({
  data,
  term,
  namespaces,
}: {
  readonly data: TermInspector_class$data;
  readonly term: string;
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => {
  const t = useMessages();
  return (
    <article aria-labelledby="term-inspector-title">
      <header>
        <h2 id="term-inspector-title">{data.label ?? term}</h2>
        <p>
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
      {/* Properties split by provenance (B7): the class's OWN properties
        under "Properties", those it inherits from an ancestor under
        "Inherited". The `inherited` boolean is already fetched; the source
        ancestor is NOT on the fragment, so the grouping names that the
        property is inherited without claiming which class it came from
        (that would need a query change). Each row now also carries the
        property's own definition (B9), previously fetched but dropped. */}
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
};

const PropertyView = ({
  data,
  term,
  namespaces,
}: {
  readonly data: TermInspector_property$data;
  readonly term: string;
  readonly namespaces: readonly OntologyNamespace[];
}): React.ReactElement => {
  const t = useMessages();
  return (
    <article aria-labelledby="term-inspector-title">
      <header>
        <h2 id="term-inspector-title">{data.label ?? term}</h2>
        <p>
          <code>{term}</code>
          {t("inspector.property.in")}
          <code>{data.namespace}</code>
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
};

/**
 * The explorer's east panel: the selected term's full record — class or
 * property, whichever the lookup resolved. Governance/status fields do
 * not exist on the ontology surface, so no such sockets are faked here;
 * the strip's controls/status stay honestly empty.
 *
 * `aria-live="polite"`: term switches swap this panel's content in place,
 * and the announcement is the inspector's, not the whole canvas's.
 */
const TermInspector = ({
  className,
  term,
  classRef,
  propertyRef,
  namespaces,
}: TermInspectorProps): React.ReactElement => {
  const t = useMessages();
  const classData = useFragment(
    termInspectorClassFragmentNode,
    (classRef ?? null) as TermInspector_class$key | null,
  );
  const propertyData = useFragment(
    termInspectorPropertyFragmentNode,
    (propertyRef ?? null) as TermInspector_property$key | null,
  );

  let body: React.ReactElement;
  if (term === undefined) {
    // No default term (owner ruling): /definitions is the whole explorer
    // with an honestly empty inspector, never a redirect.
    body = <p className="term-inspector-empty">{t("inspector.empty")}</p>;
  } else if (classData) {
    body = <ClassView data={classData} namespaces={namespaces} term={term} />;
  } else if (propertyData) {
    body = (
      <PropertyView data={propertyData} namespaces={namespaces} term={term} />
    );
  } else {
    // Unknown term: a 200 with an honest alert (the R4 posture — the term
    // space is the graph's, not the router's).
    body = (
      <p role="alert">
        {t("inspector.unknown.prefix")}
        <code>{term}</code>
        {t("inspector.unknown.suffix")}
      </p>
    );
  }

  return (
    <aside
      aria-label={t("inspector.label")}
      aria-live="polite"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="explorer-inspector"
    >
      {body}
    </aside>
  );
};

export default TermInspector;
