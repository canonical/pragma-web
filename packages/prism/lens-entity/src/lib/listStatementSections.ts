import compactIri from "./compactIri.js";
import type {
  OntologyNamespace,
  PartitionedGroup,
  PartitionGroup,
  StatementPartition,
  StatementSection,
} from "./types.js";

/** The prefix of a relation's section id: no field name meets the view's own ids. */
const RELATION_ID_PREFIX = "p-";

/** The prefix of a property group's section id, apart from the relations'. */
const VALUES_ID_PREFIX = "g-";

/** The key of the values whose field names no group. */
const UNGROUPED = "properties";

/**
 * The entity page's statement sections, before the lens orders them: one
 * section per property group (`sh:group`) holding its groups of values in
 * the lens's field order, titled with the group's label, the values no
 * group holds in one section under `ungrouped`; then one section per
 * relation. Each names the field it is ordered by, the lens's field name or
 * else the predicate's compact form.
 *
 * @param partition - The entity's statements as `partitionStatements` split them.
 * @param namespaces - The graph's prefixes, for a name the lens does not give.
 * @param ungrouped - The title of the section of values no group holds.
 * @returns The sections, the values' sections first.
 */
export default function listStatementSections<G extends PartitionGroup>(
  { values, relations }: StatementPartition<G>,
  namespaces: readonly OntologyNamespace[],
  ungrouped: string,
): StatementSection<G>[] {
  const nameField = ({ group, field }: PartitionedGroup<G>): string =>
    field?.name ?? compactIri(group.predicateUri, namespaces);
  const sections = new Map<
    string,
    { readonly anchor: PartitionedGroup<G>; readonly groups: G[] }
  >();
  for (const member of values.toSorted(compareFieldOrder)) {
    const key = member.field?.group?.uri ?? UNGROUPED;
    const section = sections.get(key);
    if (section === undefined) {
      sections.set(key, { anchor: member, groups: [member.group] });
    } else {
      section.groups.push(member.group);
    }
  }
  return [
    ...[...sections].map(([key, { anchor, groups }]): StatementSection<G> => {
      const group = anchor.field?.group;
      return {
        kind: "values",
        id: `${VALUES_ID_PREFIX}${slugify(group == null ? key : compactIri(key, namespaces))}`,
        field: nameField(anchor),
        title:
          group == null
            ? ungrouped
            : (group.label ?? compactIri(key, namespaces)),
        groups,
      };
    }),
    ...relations.map((member): StatementSection<G> => {
      const field = nameField(member);
      return {
        kind: "relation",
        id: `${RELATION_ID_PREFIX}${slugify(field)}`,
        field,
        group: member.group,
      };
    }),
  ];
}

/** Compare two values by their field's order, a value with no order last. */
function compareFieldOrder(
  a: PartitionedGroup<PartitionGroup>,
  b: PartitionedGroup<PartitionGroup>,
): number {
  const left = a.field?.order ?? Number.POSITIVE_INFINITY;
  const right = b.field?.order ?? Number.POSITIVE_INFINITY;
  return left === right ? 0 : left < right ? -1 : 1;
}

/** A section id's tail: every character but a word character or a hyphen as a hyphen. */
function slugify(text: string): string {
  return text.replaceAll(/[^\w-]/g, "-");
}
