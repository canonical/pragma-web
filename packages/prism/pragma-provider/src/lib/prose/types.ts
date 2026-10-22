/**
 * The types the prose domain shares between its modules.
 */

/** One way to read a sidecar's file name: the entity's local name and the text's language. */
export interface SidecarReading {
  /** The local name the file names, to be appended to a namespace. */
  readonly localName: string;
  /** The language tag of the text. */
  readonly lang: string;
}

/** A sidecar read one way against one namespace: a guess at the entity it describes. */
export interface ProseCandidate {
  /** The IRI the guess names. */
  readonly iri: string;
  /** The language of the text under this reading. */
  readonly lang: string;
  /** The sidecar's store-visible path. */
  readonly path: string;
  /** The sidecar's Markdown. */
  readonly markdown: string;
}

/** The prose of one entity, across its languages. */
export interface ProseDocument {
  /**
   * The Markdown in each authored language, by language tag. A plain record
   * whose own keys are exactly the authored languages: test membership with
   * `Object.hasOwn`, never with `in`.
   */
  readonly texts: Readonly<Record<string, string>>;
  /** Every authored language: the default first, then the rest in code-point order. */
  readonly availableLanguages: readonly string[];
  /**
   * The candidate IRIs the texts link to, across languages, in order of first
   * mention (the default language's text first). Whether each names an
   * entity is decided when it is resolved.
   */
  readonly references: readonly string[];
}

/** Prose by the IRI of the entity it describes. */
export type ProseIndex = ReadonlyMap<string, ProseDocument>;

/** The outcome of binding the sidecars to the graph. */
export interface ProseBinding {
  /** The bound prose, by entity IRI. */
  readonly index: ProseIndex;
  /** The paths of the sidecars that name no entity in the graph, in path order. */
  readonly unbound: readonly string[];
}

/** An IRI the store would not parse, and the store's own reason. */
export interface RefusedIri {
  /** The IRI as it was sent. */
  readonly iri: string;
  /** What the store threw for it. */
  readonly reason: unknown;
}
