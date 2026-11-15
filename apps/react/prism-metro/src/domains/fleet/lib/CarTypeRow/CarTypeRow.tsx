// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import { Icon } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/CarTypeRow_node.graphql.js";
import { CAR_TYPE_MARK_ICON } from "../CarTypeChip/constants.js";
import type { CarTypeRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CarTypeRow reads from the CarType it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CarTypeRow_node on CarType {
    __typename
    code
    _meta {
      title
      curie
      definition
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds car-type-row";

/**
 * A car type as a list entry: its mark, its prefix off the page's
 * namespace, its name linked to its home, and its code as its one fact,
 * the identifier a stock's drawings write under each car; a two-line row
 * (`lines="two"`) puts its definition under the name. Its mark is the car
 * type's glyph, a published icon.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { CarTypeRow } from "#domains/fleet";`
 *
 * @implements metro.component.car_type_row
 * @note Impure: reads its car type from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function CarTypeRow({
  node,
  className,
  ...props
}: CarTypeRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "code",
          label: t("fleet.fact.code"),
          value: <code className="identifier">{data.code}</code>,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={CAR_TYPE_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
