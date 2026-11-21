/**
 * Domain constants for the contract check: the three synthetic violation codes
 * the check adds to graphql-js's own set, the default provider name used in
 * thrown text, and the relative paths the shipped SDL is located through.
 */

/**
 * Violation code used when the provider's SDL cannot be parsed. A provider
 * whose schema does not parse has failed the contract; that is a result to
 * return, not a crash to propagate.
 */
export const INVALID_SDL = "INVALID_SDL";

/**
 * Violation code used when the provider's SDL parses but does not build a
 * valid schema — an interface implemented without all its fields, say.
 *
 * `buildSchema` runs document-level SDL rules only; it does not run schema
 * validation, and a schema that fails validation executes NOTHING. Such a
 * provider cannot subsume the contract however few structural differences it
 * has, so this is a failure in its own right rather than an absence of one.
 */
export const INVALID_SCHEMA = "INVALID_SCHEMA";

/**
 * Violation code used when the provider serves an operation from a type other
 * than the one the contract names as that operation's root.
 *
 * `findBreakingChanges` compares TYPE MAPS by name and never looks at which
 * type a schema actually uses as a root. A provider that declares
 * `schema { query: RootQuery }` while leaving a conforming but unreachable
 * `type Query` in its type map is therefore structurally indistinguishable
 * from a conformant one, and serves nothing. graphql-js cannot report that,
 * so this check reports it.
 */
export const ROOT_TYPE_MISMATCH = "ROOT_TYPE_MISMATCH";

/** Name used in thrown-error text when the caller supplies none. */
export const DEFAULT_PROVIDER_NAME = "provider";

/** The schema directory sits at the package root, beside src/ and dist/. */
export const SCHEMA_RELATIVE_PATH = "schema/contract.graphql";

/** The `statements` extension's SDL, beside the contract's. */
export const STATEMENTS_SCHEMA_RELATIVE_PATH = "schema/statements.graphql";

/** From src/lib/ (vitest, ts-node) the package root is two levels up. */
export const SOURCE_LAYOUT_PREFIX = "../..";

/** From dist/esm/lib/ (the published tsc build) it is three levels up. */
export const BUILD_LAYOUT_PREFIX = "../../..";

/**
 * The provider extensions a site may rely on: root fields outside the
 * contract that a provider serves or leaves out, each with the one signature
 * a reader selects it by. A provider serves an extension only when its
 * `Query` declares the field with exactly these arguments, in this order,
 * and this return type.
 */
export const PROVIDER_EXTENSIONS = {
  /** One entity's statements as Turtle, or null when the graph holds none. */
  source: { args: [["uri", "ID!"]], type: "String" },
  /**
   * One entity's statements grouped by predicate, in one direction, each
   * group bounded with its true total (`schema/statements.graphql`).
   */
  statements: {
    args: [
      ["uri", "ID!"],
      ["path", "[String!]"],
      ["perPredicate", "Int"],
      ["direction", "StatementDirection"],
    ],
    type: "StatementGroups",
  },
} as const;

/** How many values a `statements` group returns when the reader names none. */
export const STATEMENTS_PER_PREDICATE = 12;

/** The most values a `statements` group returns, whatever the reader asks. */
export const STATEMENTS_PER_PREDICATE_MAX = 50;

/** How many levels of nested values a `statements` group expands in place. */
export const STATEMENTS_MAX_DEPTH = 2;
