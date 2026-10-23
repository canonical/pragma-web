// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassRow_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityRow } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { OntologyClassRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassRow reads from the OntologyClass it renders: its
 * title, its compact address and whether it is abstract.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassRow_node on OntologyClass {
    __typename
    isAbstract
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-row";

/**
 * An ontology class as a 32px list entry: its namespace prefix, muted with
 * its colon (`ds:`), before its title, linked to its home when the site has
 * one and inert text when it has none; and the word "abstract" at the end
 * of an abstract class. A class whose address did not compact has no
 * prefix.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassRow } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_row
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its word from
 *   the translator in scope.
 */
export default function OntologyClassRow({
  node,
  className,
  ...props
}: OntologyClassRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  const prefix = findCuriePrefix(curie);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      location={
        prefix === undefined ? undefined : (
          <code className="identifier">
            {curie.slice(0, prefix.length + 1)}
          </code>
        )
      }
      meta={data.isAbstract ? t("class.abstract") : undefined}
      title={title}
    />
  );
}
