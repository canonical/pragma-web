const ID_ATTRIBUTES = new Set([
  "id",
  "for",
  "aria-labelledby",
  "aria-describedby",
  "aria-errormessage",
  "aria-controls",
  "aria-activedescendant",
]);

/** Rewrites a style declaration list into one canonical spelling. */
function normalizeStyle(style: string): string {
  return style
    .split(";")
    .map((declaration) => declaration.trim().replace(/\s*:\s*/, ":"))
    .filter(Boolean)
    .join(";");
}

/**
 * Serializes server-rendered markup into a canonical form that two
 * frameworks can be compared on: comments are dropped, whitespace-only text is
 * collapsed to one space, attributes are sorted, styles are respelled, and
 * generated IDs are
 * replaced by their order of first appearance, so `_R_0_-name-label` (React)
 * and `s1-name-label` (Svelte) both become `id1`.
 * @note Pure: reads the given node only.
 */
export default function normalizeMarkup(root: Node): string {
  const ids = new Map<string, string>();
  const mapId = (token: string) => {
    if (!ids.has(token)) ids.set(token, `id${ids.size + 1}`);
    return ids.get(token);
  };

  const serialize = (node: Node): string => {
    if (node.nodeType === 3) {
      // Whitespace-only text is kept as a single space: it is a node in the
      // DOM and can affect inline layout, so it must match too.
      const text = node.textContent ?? "";
      return text.trim() === "" ? " " : text;
    }
    if (node.nodeType !== 1) return "";
    const element = node as Element;
    const attributes = [...element.attributes]
      .map(({ name, value }) => {
        if (ID_ATTRIBUTES.has(name))
          return `${name}="${value.split(/\s+/).filter(Boolean).map(mapId).join(" ")}"`;
        if (name === "style") return `${name}="${normalizeStyle(value)}"`;
        return `${name}="${value}"`;
      })
      .sort();
    const tag = element.tagName.toLowerCase();
    const children = [...element.childNodes].map(serialize).join("");
    return `<${[tag, ...attributes].join(" ")}>${children}</${tag}>`;
  };

  return [...root.childNodes].map(serialize).join("");
}
