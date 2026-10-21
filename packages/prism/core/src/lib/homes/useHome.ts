import { useRouter } from "@canonical/router-react";
import { useContext } from "react";
import HomesContext from "./Context.js";
import type { HomeNode, HomeResolver } from "./types.js";

/**
 * The canonical home of `node`: the href its type's resolver builds, falling
 * back to the `Node` resolver, or `undefined` when the site declares
 * neither — a node with no home renders as inert text, never a dead link.
 *
 * @param node - The node's `__typename` and `uri`.
 * @returns The node's href, or `undefined` when it has no home.
 * @throws When no `HomesProvider` is mounted above: that is a wiring bug,
 *   not a node without a home.
 */
export default function useHome(node: HomeNode): string | undefined {
  const homes = useContext(HomesContext);
  const router = useRouter();
  if (homes === undefined) {
    throw new Error("useHome: no HomesProvider above");
  }
  const resolve: HomeResolver | undefined =
    homes[node.__typename] ?? homes.Node;
  return resolve?.(node, router);
}
