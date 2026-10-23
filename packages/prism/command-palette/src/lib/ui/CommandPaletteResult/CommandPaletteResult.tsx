// Scaffolded by @canonical/summon-component:react v0.43.0

import { useHome } from "@canonical/prism-core";
import { CommandProjection } from "@canonical/prism-projections";
import type { AnyRoute, RouteMap } from "@canonical/router-core";
import { useRouter } from "@canonical/router-react";
import type { ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import nodeFragment from "../../../__generated__/CommandPaletteResult_node.graphql.js";
import type { CommandPaletteResultProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields CommandPaletteResult reads from the Node it offers: its
 * typename and compact address, which find its home, and the command
 * projection's fields.
 */
const declareNodeFragment = (): unknown => graphql`
  fragment CommandPaletteResult_node on Node {
    __typename
    _meta {
      curie
    }
    ...CommandProjection_node
  }
`;
void declareNodeFragment;
/* v8 ignore stop */

/**
 * One result of the palette: a graph node as an option of its results
 * listbox, rendered as the site's command projection for the node's type, a
 * 56px row. Choosing it, by a click on the row or by Enter in the field
 * while it is highlighted, calls `onChoose`, which closes the palette, and
 * then navigates the router to the node's canonical home. A node whose type
 * the site gives no home is a disabled option (`aria-disabled`): it is
 * listed and previewed, and choosing it does nothing.
 *
 * It renders no element of its own: the arm its node's type selects renders
 * the row's `<li>`, and every native prop reaches it.
 *
 * `import { CommandPaletteResult } from "../CommandPaletteResult/index.js";`
 *
 * @implements prism.component.command_palette_result
 * @note Impure: reads its node from the Relay store, its home from the
 *   site's homes and the router from its provider, and navigates the
 *   router when chosen.
 */
export default function CommandPaletteResult({
  node,
  onChoose,
  ...props
}: CommandPaletteResultProps): ReactElement {
  const data = useFragment(nodeFragment, node);
  const href = useHome({ __typename: data.__typename, uri: data._meta.curie });
  const router = useRouter<RouteMap, AnyRoute>();

  /**
   * Close the palette, then open the node's home through the router, with
   * the params, search and hash the route the home matches reads from it.
   * A home is built from the router's own table, so a home no route
   * matches is a site's wiring error, and throws.
   *
   * @note Impure: closes the palette and navigates the router.
   */
  const choose = (): void => {
    if (href === undefined) return;
    const match = router.match(href);
    if (match?.kind !== "route") {
      throw new Error(
        `The home ${href} of ${data._meta.curie} matches no route of the site's router`,
      );
    }
    onChoose();
    router.navigate(match.name, {
      params: match.params,
      search: match.search,
      hash: match.url.hash,
    });
  };

  return (
    <CommandProjection
      {...props}
      aria-disabled={href === undefined || undefined}
      node={data}
      onClick={choose}
    />
  );
}
