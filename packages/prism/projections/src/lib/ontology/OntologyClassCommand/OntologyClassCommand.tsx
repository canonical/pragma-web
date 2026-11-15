// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassCommand_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityCommand } from "../../ui/index.js";
import { CLASS_MARK_ICON } from "../constants.js";
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
 * An ontology class as a 56px command-palette result, in the slot order:
 * the class glyph as its mark, then on the first line its namespace
 * prefix when it differs from the page's ambient one and its title,
 * linked to its home when the site has one and inert text when it has
 * none; on the second its compact address (`ds:Layout`); then its kind,
 * "Class" or "Abstract class", and "used in 88 instances" as its status.
 *
 * It is the command's arm for `OntologyClass`: `CommandProjection` renders
 * it.
 *
 * Native props reach the result's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassCommand } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_command
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its words from the translator in scope.
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
  const prefix = useForeignPrefix(curie);
  return (
    <EntityCommand
      {...props}
      address={curie}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={t(data.isAbstract ? "class.kind.abstract" : "class.kind")}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CLASS_MARK_ICON} />}
      prefix={prefix}
      status={t("class.instances", { count: data.instanceCount })}
      title={title}
    />
  );
}
