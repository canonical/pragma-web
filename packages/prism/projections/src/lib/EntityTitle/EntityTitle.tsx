import { useHome } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import entityTitleFragmentNode from "../../__generated__/EntityTitle_node.graphql.js";
import { useProjectionMaps } from "../projections/index.js";
import type { EntityTitleProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The title's composite fragment: what dispatch reads, plus one spread per
 * arm in the title map. A type's own arm is spread inside an inline fragment
 * on that type, so the arm reads its own fields wherever the title renders.
 */
const entityTitleFragmentSource = (): unknown => graphql`
  fragment EntityTitle_node on Node {
    __typename
    _meta {
      curie
    }
    ...NodeTitle_node
  }
`;
void entityTitleFragmentSource;
/* v8 ignore stop */

/**
 * The page title: the heading of the page a node owns. It renders the node through the title map's arm for the node's
 * `__typename`, falling back to the `Node` arm, and hands the arm the node's
 * home.
 *
 * It renders no element of its own; the arm renders the root, an `<hgroup>`.
 *
 * `import { EntityTitle } from "@canonical/prism-projections";`
 */
export default function EntityTitle({
  node,
  ...props
}: EntityTitleProps): ReactElement {
  const data = useFragment(entityTitleFragmentNode, node);
  const map = useProjectionMaps().title;
  const href = useHome({
    __typename: data.__typename,
    uri: data._meta.curie,
  });
  const Arm = map[data.__typename] ?? map.Node;
  return <Arm {...props} href={href} node={data} />;
}
