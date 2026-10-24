// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassCommand_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import { useProjectionLink } from "../../projections/index.js";
import { EntityCommand } from "../../ui/index.js";
import { findCuriePrefix } from "../../utils/index.js";
import type { OntologyClassCommandProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassCommand reads from the OntologyClass it renders:
 * its title and compact address, whether it is abstract and how many
 * instances it has.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassCommand_node on OntologyClass {
    __typename
    isAbstract
    instanceCount
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-command";

/**
 * An ontology class as a 56px command-palette result: its title on the
 * first line, linked to its home when the site has one and inert text when
 * it has none; "Class in ds" on the second, its abstraction in its
 * namespace's prefix; and "used in 88 instances" at the end. A class whose
 * address did not compact names its abstraction alone.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassCommand } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_command
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider and its words from
 *   the translator in scope.
 */
export default function OntologyClassCommand({
  node,
  className,
  ...props
}: OntologyClassCommandProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const t = useMessages();
  return (
    <EntityCommand
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={t(data.isAbstract ? "class.kind.abstract" : "class.kind")}
      LinkComponent={LinkComponent}
      location={findCuriePrefix(curie)}
      title={title}
      vital={t("class.instances", { count: data.instanceCount })}
    />
  );
}
