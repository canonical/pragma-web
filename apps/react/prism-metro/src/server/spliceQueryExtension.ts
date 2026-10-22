/** The one `extend type Query { … }` block, with the blank lines before it. */
const QUERY_EXTENSION = /\n*^extend type Query \{\n([\s\S]*?)\n\}/gm;

/** The root type, through its closing brace at column 0. */
const QUERY_BLOCK = /^type Query \{\n[\s\S]*?^\}/m;

/**
 * Move the fields of the SDL's `extend type Query { … }` block into its
 * `type Query { … }`, after the fields already there, and drop the block.
 *
 * relay-compiler reads `extend type` in a schema file as a client schema
 * extension: it compiles a selection of such a field as a `ClientExtension`
 * and never sends it to the server, so a root field a provider adds that
 * way could not be queried. Spliced into `type Query`, the fields are
 * server fields like the contract's own. The rest of the SDL is kept
 * byte for byte.
 *
 * @param sdl - The SDL, the contract followed by a provider's extension.
 * @returns The SDL with every root field in `type Query`; unchanged when it
 * extends `Query` nowhere.
 * @throws When the SDL extends `Query` more than once, or extends it but
 * declares no `type Query`.
 */
export default function spliceQueryExtension(sdl: string): string {
  const extensions = [...sdl.matchAll(QUERY_EXTENSION)];
  if (extensions.length > 1) {
    throw new Error(
      `the SDL extends Query ${extensions.length} times; expected at most one \`extend type Query\` block`,
    );
  }
  const extension = extensions.at(0);
  if (extension === undefined) return sdl;
  const [block, fields] = extension;
  const rest = sdl.replace(block, "");
  if (!QUERY_BLOCK.test(rest)) {
    throw new Error("the SDL extends Query but declares no `type Query` block");
  }
  return rest.replace(
    QUERY_BLOCK,
    (query) => `${query.slice(0, -1)}${fields}\n}`,
  );
}
