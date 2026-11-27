/**
 * The focused element of the tree `node` sits in: a document, or a shadow
 * root.
 *
 * @param node A node in the tree.
 * @returns The tree's focused element, or null.
 * @note Impure: reads the DOM.
 */
export default function findActiveElement(node: Node): Element | null {
  const root = node.getRootNode();
  return root instanceof Document || root instanceof ShadowRoot
    ? root.activeElement
    : null;
}
