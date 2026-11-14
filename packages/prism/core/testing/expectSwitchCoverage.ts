import type {
  SwitchCoverageOptions,
  SwitchFragment,
  SwitchSelection,
} from "./types.js";

/**
 * Assert that a switch over a node's typename covers its fragment: the
 * cases a test names are exactly the type conditions of the switch's
 * compiled fragment, then render one node per condition through the
 * caller, which asserts the arm it expects.
 *
 * A switch spreads one arm's fragment per type it cases, aliased by that
 * type (`...StationChip_node @alias(as: "Station")`); a spread on the
 * fragment's own type (the `Node` arm, a site slot) is the switch's
 * default, not a case. Reading the conditions from the compiled artefact,
 * not from a hand-kept list, makes a spread the switch has no case for
 * fail here, as it would otherwise fall through to the default arm
 * silently.
 *
 * @param options - The switch's compiled fragment, one mock node per case
 *   by type condition, and how to render and check one.
 * @throws When a type condition has no case, or a case names no condition.
 * @note Impure: calls `render`, which mounts the switch, once per condition.
 */
export default function expectSwitchCoverage<TNode>({
  fragment,
  cases,
  render,
}: SwitchCoverageOptions<TNode>): void {
  const conditions = readTypeConditions(fragment);
  const missing = conditions.filter(
    (condition) => !Object.hasOwn(cases, condition),
  );
  if (missing.length > 0) {
    throw new Error(
      `${fragment.name} spreads an arm on ${missing.join(", ")} but the coverage names no case for it`,
    );
  }
  const extra = Object.keys(cases).filter((name) => !conditions.includes(name));
  if (extra.length > 0) {
    throw new Error(
      `${fragment.name} has no type condition ${extra.join(", ")}: the case names no arm the switch spreads`,
    );
  }
  for (const condition of conditions) {
    const node = cases[condition];
    if (node === undefined) {
      throw new Error(`the case ${condition} holds no node`);
    }
    render(condition, node);
  }
}

/**
 * The type conditions of a switch's compiled fragment: the types its
 * inline fragments and aliased spreads are on, but the fragment's own
 * type, which is its default.
 */
function readTypeConditions(fragment: SwitchFragment): string[] {
  const conditions = fragment.selections
    .map((selection) => readCondition(selection))
    .filter(
      (condition): condition is string =>
        condition !== undefined && condition !== fragment.type,
    );
  return [...new Set(conditions)].sort();
}

/** The type a selection is conditioned on, if it is an inline fragment. */
function readCondition(selection: SwitchSelection): string | undefined {
  switch (selection.kind) {
    case "AliasedInlineFragmentSpread":
      return readFragmentType(selection.fragment);
    case "InlineFragment":
      return selection.type;
    default:
      return undefined;
  }
}

/** The type an aliased spread's inline fragment is on. */
function readFragmentType(fragment: unknown): string | undefined {
  return typeof fragment === "object" &&
    fragment !== null &&
    "type" in fragment &&
    typeof fragment.type === "string"
    ? fragment.type
    : undefined;
}
