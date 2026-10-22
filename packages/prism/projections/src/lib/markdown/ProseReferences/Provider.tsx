import { type ReactElement, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import proseReferencesFragmentNode from "../../../__generated__/ProseReferencesProvider_references.graphql.js";
import ProseReferencesContext from "./Context.js";
import indexProseReferences from "./indexProseReferences.js";
import type { ProseReferencesProviderProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * What the references read: each node's two addresses, to resolve a link
 * by, and the chip's composite, to render a resolved link with.
 */
const proseReferencesFragmentSource = (): unknown => graphql`
  fragment ProseReferencesProvider_references on NodeConnection {
    edges {
      node {
        uri
        _meta {
          curie
        }
        ...ChipProjection_node
      }
    }
  }
`;
void proseReferencesFragmentSource;
/* v8 ignore stop */

/**
 * Provides a page's prose references — the nodes its prose links to, as the
 * provider resolved them — to every prose link below it, so a link whose
 * href is one of their IRIs or compact addresses renders as the node's chip.
 *
 * It renders no element of its own (a context provider), so it takes no
 * native props.
 *
 * `import { ProseReferencesProvider } from "@canonical/prism-projections";`
 */
export default function ProseReferencesProvider({
  references,
  children,
}: ProseReferencesProviderProps): ReactElement {
  const { edges } = useFragment(proseReferencesFragmentNode, references);
  const index = useMemo(() => indexProseReferences(edges), [edges]);
  return (
    <ProseReferencesContext value={index}>{children}</ProseReferencesContext>
  );
}
