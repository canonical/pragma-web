import type React from "react";
import { graphql, useFragment } from "react-relay";
import type { TermInspector_class$key } from "../../__generated__/TermInspector_class.graphql.js";
import termInspectorClassFragmentNode from "../../__generated__/TermInspector_class.graphql.js";
import type { TermInspector_property$key } from "../../__generated__/TermInspector_property.graphql.js";
import termInspectorPropertyFragmentNode from "../../__generated__/TermInspector_property.graphql.js";
import { Message, useMessages } from "../i18n/index.js";
import { ClassView } from "./common/ClassView/index.js";
import { PropertyView } from "./common/PropertyView/index.js";
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
          ...ChipProjection_node
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

/**
 * The explorer's east panel: the selected term's full record — class or
 * property, whichever the lookup resolved. Governance/status fields do
 * not exist on the ontology surface, so no such sockets are faked here;
 * the strip's controls/status stay honestly empty.
 *
 * `aria-live="polite"`: term switches swap this panel's content in place,
 * and the announcement is the inspector's, not the whole canvas's.
 *
 * `import { TermInspector } from "./TermInspector/index.js";`
 *
 * @note Impure: reads the selected class or property from the Relay store
 *   through `useFragment`, which subscribes to its updates.
 */
export default function TermInspector({
  className,
  term,
  classRef,
  propertyRef,
  namespaces,
  ...props
}: TermInspectorProps): React.ReactElement {
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
    // No default term: /definitions is the whole explorer
    // with an honestly empty inspector, never a redirect.
    body = <p className="empty">{t("inspector.empty")}</p>;
  } else if (classData) {
    body = <ClassView data={classData} namespaces={namespaces} term={term} />;
  } else if (propertyData) {
    body = (
      <PropertyView data={propertyData} namespaces={namespaces} term={term} />
    );
  } else {
    // Unknown term: a 200 with an honest alert (the term
    // space is the graph's, not the router's).
    body = (
      <p role="alert">
        <Message
          elements={{ term: <code className="identifier">{term}</code> }}
          id="inspector.unknown"
        />
      </p>
    );
  }

  return (
    <aside
      {...props}
      aria-label={t("inspector.label")}
      aria-live="polite"
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-slot="explorer-inspector"
    >
      {body}
    </aside>
  );
}
