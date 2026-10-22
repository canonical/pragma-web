/**
 * Build the anchor id of a group's section, the target of its jump link,
 * from the group's class IRI rather than from its heading. The heading is
 * `_meta.title`, human text that need not be unique; the class IRI is the
 * group's identity. The id is the IRI's local name, lower-cased, with every
 * run of other characters folded to `-`; an IRI with no local name uses the
 * whole IRI.
 *
 * @param classUri - The group's class, as an absolute IRI.
 * @returns The section's id, `standards-group-<slug>`.
 */
export default function buildGroupAnchorId(classUri: string): string {
  const localName = classUri.slice(
    Math.max(classUri.lastIndexOf("#"), classUri.lastIndexOf("/")) + 1,
  );
  const slug = (localName === "" ? classUri : localName)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-");
  return `standards-group-${slug}`;
}
