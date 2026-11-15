/** One request a graph stub captured: what was actually put on the wire. */
export interface CapturedRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly body: Record<string, unknown>;
}

/** A running graph stub (see `startGraphStub`). */
export interface GraphStub {
  /** The stub's GraphQL endpoint, on an OS-assigned loopback port. */
  readonly url: string;
  /**
   * Every request received, in arrival order. Tests empty it between cases
   * by setting its `length` to 0.
   */
  readonly captured: CapturedRequest[];
  /** Stop listening; resolves once the socket is closed. */
  readonly close: () => Promise<void>;
}

/** Options of `expectSlotOrder`. */
export interface ExpectSlotOrderOptions {
  /**
   * The slots the representation must render, by class. Defaults to
   * `mark` and `title`, what every typed arm renders; a form, or an arm
   * whose anatomy leaves one out, passes its own list (`[]` for none).
   */
  readonly requires?: readonly string[];
}

/**
 * One selection of a compiled fragment, as `expectSwitchCoverage` reads it:
 * an inline fragment carries its type condition as `type`, an aliased
 * spread (`AliasedInlineFragmentSpread`, which `relay-runtime`'s types do
 * not name) as `fragment.type`.
 */
export interface SwitchSelection {
  readonly kind: string;
  readonly type?: string;
  readonly fragment?: unknown;
}

/**
 * A switch's compiled fragment, as `expectSwitchCoverage` reads it: a
 * Relay `ReaderFragment` is one.
 */
export interface SwitchFragment {
  readonly name: string;
  readonly type: string;
  readonly selections: readonly SwitchSelection[];
}

/**
 * One form's projection map, as `guardTypedArms` reads it: its typed arms
 * by typename, and a site's arms for its own types.
 */
export interface GuardableMap {
  readonly types: object;
  readonly siteTypes?: object;
}

/**
 * A tree's projection maps, as `guardTypedArms` takes them: all five
 * forms, so a tree cannot guard some forms and leave the others' typed
 * arms in place.
 */
export interface GuardableMaps {
  readonly chip: GuardableMap;
  readonly row: GuardableMap;
  readonly card: GuardableMap;
  readonly command: GuardableMap;
  readonly graphNode: GuardableMap;
}

/** What the coverage guard recorded while one case rendered. */
export interface CoverageGuardResult {
  /** Whether the case's tree passed its maps through `guardTypedArms`. */
  readonly guarded: boolean;
  /**
   * Whether the switch read a form from the very maps `guardTypedArms`
   * returned, so the provider received them and not other maps.
   */
  readonly read: boolean;
}

/** Options of `expectSwitchCoverage`. */
export interface SwitchCoverageOptions<TNode> {
  /**
   * The switch's compiled fragment: the default export of its Relay
   * artefact, whose type conditions are the cases the switch must name.
   */
  readonly fragment: SwitchFragment;
  /**
   * One mock node per case, keyed by the type condition it is rendered
   * for: an object type's name, or an interface's when one arm takes every
   * type that implements it.
   */
  readonly cases: Readonly<Record<string, TNode>>;
  /**
   * Render the switch over the case's node and assert the arm it renders
   * (by its root's class, which the caller derives: arms may be shared),
   * under a tree that passes its projection maps through `guardTypedArms`.
   */
  readonly render: (condition: string, node: TNode) => void;
}

/** Options of `assertScaffold`. */
export interface AssertScaffoldOptions {
  /**
   * The root of the package the folder belongs to: placement is read
   * relative to it, and the stylesheet's layer from its manifest.
   */
  readonly packageRoot: string;
  /** The package's test-file suffix: `test` in packages, `tests` in apps. */
  readonly testSuffix: "test" | "tests";
}

/** Options of `assertStylesheets`. */
export interface AssertStylesheetsOptions {
  /** The folder whose stylesheets, at any depth, are checked. */
  readonly directory: string;
  /** The cascade layer every stylesheet paints in. */
  readonly layer: string;
  /**
   * The semantic tokens the stylesheets may read beyond the spacing shim and
   * the density channel, such as `--color-text`.
   */
  readonly externalTokens?: readonly string[];
  /**
   * The custom properties a `:root` block may declare: a preset's own token,
   * set at the scope the preset reads it.
   */
  readonly documentTokens?: readonly string[];
  /**
   * The selectors allowed to reach into another component, each written as
   * the stylesheet writes it.
   */
  readonly reaches?: readonly string[];
}

/** One declaration of a rule: a property and its value as written. */
export interface StyleDeclaration {
  readonly property: string;
  readonly value: string;
}

/** One rule of a stylesheet, with the conditional at-rules around it. */
export interface StyleRule {
  /** The rule's selectors, its selector list split at the top level. */
  readonly selectors: readonly string[];
  /** The rule's declarations, in source order. */
  readonly declarations: readonly StyleDeclaration[];
  /**
   * The preludes of the at-rules enclosing the rule inside its layer, such
   * as `@container shell (width < 448px)`, outermost first.
   */
  readonly conditions: readonly string[];
}

/** A stylesheet read into its layer wrappers and its rules. */
export interface ParsedStylesheet {
  /** The names of the top-level `@layer` blocks, in source order. */
  readonly layers: readonly string[];
  /** How many top-level statements the stylesheet holds. */
  readonly statementCount: number;
  /** Every rule, at any depth, in source order. */
  readonly rules: readonly StyleRule[];
}

/** The three spellings of a component's name. */
export interface ComponentNames {
  /** The PascalCase name its folder, file and export carry: `ModeStrip`. */
  readonly name: string;
  /** Its class name, after `.ds`: `mode-strip`. */
  readonly kebab: string;
  /** The last segment of its anatomy URI: `mode_strip`. */
  readonly snake: string;
}
