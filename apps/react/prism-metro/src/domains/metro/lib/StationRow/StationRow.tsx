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
import nodeFragment from "#relay/__generated__/StationRow_node.graphql.js";
import { STATION_MARK_ICON } from "../StationChip/constants.js";
import type { StationRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields StationRow reads from the Station it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment StationRow_node on Station {
    __typename
    platformCount
    _meta {
      title
      curie
      definition
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds station-row";

/**
 * A station as a list entry: its mark, its prefix off the page's
 * namespace, its name linked to its home, its platform count as a fact; a two-line row
 * (`lines="two"`) puts its definition under the name.
 * Its mark is the station's glyph, a published icon.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { StationRow } from "#domains/metro";`
 *
 * @implements metro.component.station_row
 * @note Impure: reads its station from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function StationRow({
  node,
  className,
  ...props
}: StationRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const platforms = data.platformCount ?? undefined;
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={
        platforms === undefined
          ? undefined
          : [
              {
                property: "platformCount",
                label: t("station.platforms"),
                value: platforms,
              },
            ]
      }
      href={href}
      LinkComponent={LinkComponent}
      mark={<Icon icon={STATION_MARK_ICON} />}
      prefix={prefix}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
