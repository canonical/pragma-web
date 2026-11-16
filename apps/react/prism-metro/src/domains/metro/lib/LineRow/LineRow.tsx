// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import {
  EntityRow,
  SwatchMark,
  useForeignPrefix,
  useProjectionLink,
} from "@canonical/prism-projections";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import { useMessages } from "#i18n";
import nodeFragment from "#relay/__generated__/LineRow_node.graphql.js";
import type { LineRowProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields LineRow reads from the Line it renders: what its slots
 * show, and its compact address, which its home is resolved from.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment LineRow_node on Line {
    __typename
    colour
    _meta {
      title
      curie
      definition
    }
    servedBy {
      uri
    }
    routes {
      isLoop
    }
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

const componentCssClassName = "ds line-row";

/**
 * A line as a list entry: its mark, its prefix off the page's
 * namespace, its name linked to its home, its stop count as a fact and "loop"
 * as its status for a line that runs one; a two-line row
 * (`lines="two"`) puts its definition under the name.
 * Its mark is a disc of the line's colour (`SwatchMark`), which the
 * package paints only with a plain colour value.
 *
 * Native props reach the row's `<li>` root; a consumer `className`
 * merges after the projection's own, and the root carries the typename
 * as `data-type`.
 *
 * `import { LineRow } from "#domains/metro";`
 *
 * @implements metro.component.line_row
 * @note Impure: reads its line from the Relay store, its home from the
 *   site's homes, and its link and the page's namespace from the
 *   projection providers, and its words from the translator in scope.
 */
export default function LineRow({
  node,
  className,
  ...props
}: LineRowProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const { curie, definition, title } = data._meta;
  const href = useHome({ __typename: data.__typename, uri: curie });
  const LinkComponent = useProjectionLink();
  const prefix = useForeignPrefix(curie);
  const t = useMessages();
  const loop = data.routes.some((route) => route.isLoop);
  return (
    <EntityRow
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-type={data.__typename}
      facts={[
        {
          property: "servedBy",
          label: t("line.stops"),
          value: data.servedBy.length,
        },
      ]}
      href={href}
      LinkComponent={LinkComponent}
      mark={<SwatchMark colour={data.colour} />}
      prefix={prefix}
      status={loop ? t("line.loop") : undefined}
      summary={definition ?? undefined}
      title={title}
    />
  );
}
