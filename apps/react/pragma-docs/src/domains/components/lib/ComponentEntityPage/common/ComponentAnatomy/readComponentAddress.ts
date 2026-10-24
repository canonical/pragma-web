import { BLOCK_PREFIX, COMPONENT_SEGMENT } from "./constants.js";

/**
 * Read the compact address of the component an anatomy names, the address
 * its page takes: a design-system block's URI, bare (`global.component.
 * button`) or prefixed, whose type segment is `component`. Any other block
 * has no page on the site.
 *
 * @param uri - A named node's URI, as the anatomy writes it.
 * @returns The component's compact address, or `undefined` for a block
 *   that is no component.
 */
export default function readComponentAddress(uri: string): string | undefined {
  const local = uri.startsWith(BLOCK_PREFIX)
    ? uri.slice(BLOCK_PREFIX.length)
    : uri;
  return local.split(".").at(1) === COMPONENT_SEGMENT
    ? `${BLOCK_PREFIX}${local}`
    : undefined;
}
