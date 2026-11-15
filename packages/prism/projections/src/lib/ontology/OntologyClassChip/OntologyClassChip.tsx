// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/OntologyClassChip_node.graphql.js";
import { useProjectionPeek } from "../../node/ProjectionPeek/index.js";
import {
  useForeignPrefix,
  useProjectionLink,
} from "../../projections/index.js";
import { EntityChip } from "../../ui/index.js";
import { CLASS_MARK_ICON } from "../constants.js";
import type { OntologyClassChipProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields OntologyClassChip reads from the OntologyClass it renders: its
 * absolute IRI, the address its peek reads the class at, its title and its
 * compact address, the address its home is built from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment OntologyClassChip_node on OntologyClass {
    __typename
    uri
    _meta {
      title
      curie
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds ontology-class-chip";

/**
 * An ontology class as an inline mention: the class glyph as its mark, its
 * namespace prefix when it differs from the page's ambient one, and its
 * title in the chip's pill, linked to its home when the site has one and
 * inert text when it has none or `linked` is false. A linked chip peeks at
 * the class at its absolute IRI through the site's peek,
 * `useProjectionPeek` (the package's `ProjectionPeek` when the site gives
 * none), mounted when the peek opens. A passage's own link text, given as
 * `children`, stands in for the title.
 *
 * It is the chip's arm for `OntologyClass`: `ChipProjection` renders it.
 *
 * Native props reach the chip's `<span>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename as
 * `data-type`.
 *
 * `import { OntologyClassChip } from "@canonical/prism-projections";`
 *
 * @implements prism.component.ontology_class_chip
 * @note Impure: reads its class from the Relay store, its home from the
 *   site's homes, its link and peek from the projection provider and the
 *   page's ambient namespace.
 */
export default function OntologyClassChip({
  node,
  children,
  className,
  ...props
}: OntologyClassChipProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const peek = useProjectionPeek(data.uri);
  const prefix = useForeignPrefix(curie);
  return (
    <EntityChip
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CLASS_MARK_ICON} />}
      peek={peek}
      prefix={prefix}
      title={children ?? title}
    />
  );
}
