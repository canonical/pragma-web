// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassRow_node.graphql.js";
import { useMessages } from "../../i18n/index.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityRow } from "../../ui/index.js";
import { CLASS_MARK_ICON } from "../constants.js";
import type { OntologyClassRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassRow reads from the OntologyClass it renders: its
 * title, its compact address, whether it is abstract and its definition.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassRow_node on OntologyClass {
    __typename
    isAbstract
    definition
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
 * An ontology class as a 32px list entry, in the slot order: the class
 * glyph as its mark, its namespace prefix when it differs from the page's
 * ambient one, its title linked to its home when the site has one and
 * inert text when it has none, and, as its kind, the word "abstract" for
 * an abstract class. A row opted into two lines (`lines="two"`) sets the
 * class's definition under the title. A class whose address did not
 * compact has no prefix.
 *
 * It is the row's arm for `OntologyClass`: `RowProjection` renders it.
 *
 * Native props reach the row's `<li>` root; a consumer `className` merges
 * after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassRow } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_row
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link from the projection provider, the page's
 *   ambient namespace and its word from the translator in scope.
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
  const prefix = useForeignPrefix(curie);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      kind={data.isAbstract ? t("class.abstract") : undefined}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CLASS_MARK_ICON} />}
      prefix={prefix}
      summary={data.definition ?? undefined}
      title={title}
    />
  );
}
