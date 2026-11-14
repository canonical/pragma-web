/**
 * The site lens model: the presentation facts a site declares about the
 * classes and properties of its ontology, in the shape the Turtle lens takes
 * (`sh:PropertyGroup`, `sh:property` entries, `prism:` terms), and the
 * records the resolver answers once inheritance and fallbacks are applied.
 *
 * Type-only: no runtime code lives here, which is why the coverage config
 * excludes this file.
 */

/**
 * How prominently a term is shown: a prominent term leads, a normal one is
 * listed, and a hidden one is a value, never an entity (`prism:visibility`).
 */
export type TermVisibility = "PROMINENT" | "NORMAL" | "HIDDEN";

/** The role a property's values play for their subject (`shui:propertyRole`). */
export type PropertyRole =
  | "LABEL"
  | "DESCRIPTION"
  | "DEPICTION"
  | "ICON"
  | "CLASSIFICATION";

/**
 * One literal per language tag. The key `""` holds the untagged literal.
 */
export type LangLiterals = Readonly<Record<string, string>>;

/** A named, ordered section of a class's properties (`sh:PropertyGroup`). */
export interface LensGroup {
  /** The group's IRI. */
  readonly uri: string;
  /** Its `rdfs:label` per language. */
  readonly labels?: LangLiterals;
  /** Its position among a class's groups, ascending (`sh:order`). */
  readonly order?: number;
}

/**
 * The lens of one property on one class: an entry of the class's lens shape
 * (`sh:property`). Each fact is optional and inherits on its own.
 */
export interface LensField {
  /** The property's IRI (`sh:path`). */
  readonly property: string;
  /** The IRI of a group the same lens declares (`sh:group`). */
  readonly group?: string;
  /** The field's position within its group, ascending (`sh:order`). */
  readonly order?: number;
  /** The role the property's values play for the class. */
  readonly role?: PropertyRole;
  /** How prominently the field is shown on this class. */
  readonly visibility?: TermVisibility;
}

/** The lens of one class. */
export interface LensClass {
  /** The class's IRI. */
  readonly uri: string;
  /** How prominently the class is shown; inherited by subclasses. */
  readonly visibility?: TermVisibility;
  /** The glyph that marks the class; inherited by subclasses. */
  readonly glyph?: string;
  /** Its plural label per language; never inherited. */
  readonly pluralLabels?: LangLiterals;
  /** The lens shape's entries, one per property. */
  readonly fields?: readonly LensField[];
}

/** The lens of one property, wherever it appears. */
export interface LensProperty {
  /** The property's IRI. */
  readonly uri: string;
  /** How prominently the property is shown when no class says otherwise. */
  readonly visibility?: TermVisibility;
  /** Its plural label per language. */
  readonly pluralLabels?: LangLiterals;
  /** The label of the property read from its object, per language. */
  readonly inverseLabels?: LangLiterals;
  /** The plural of the inverse label, per language. */
  readonly inversePluralLabels?: LangLiterals;
  /** How prominently the property is shown read from its object. */
  readonly inverseVisibility?: TermVisibility;
}

/** A site's whole lens: the same structure as the Turtle lens. */
export interface SiteLens {
  readonly groups: readonly LensGroup[];
  readonly classes: readonly LensClass[];
  readonly properties: readonly LensProperty[];
}

/** One class of a {@link TBoxOutline}. */
export interface OutlineClass {
  /** The class's IRI. */
  readonly uri: string;
  /** The IRIs of its direct superclasses. */
  readonly parents: readonly string[];
}

/** One property of a {@link TBoxOutline}. */
export interface OutlineProperty {
  /** The property's IRI. */
  readonly uri: string;
  /** The IRI of its declared inverse partner (`owl:inverseOf`). */
  readonly inverse?: string;
  /** Its asserted `rdfs:label` per language. */
  readonly labels?: LangLiterals;
}

/**
 * The part of a provider's TBox the lens resolves against: the class
 * hierarchy, the inverse pairs and the asserted property labels.
 */
export interface TBoxOutline {
  readonly classes: readonly OutlineClass[];
  readonly properties: readonly OutlineProperty[];
}

/** A class's lens once inheritance is applied. */
export interface ResolvedClassLens {
  readonly visibility: TermVisibility | null;
  readonly glyph: string | null;
  readonly pluralLabels: LangLiterals;
}

/** A property's lens on one class once inheritance is applied. */
export interface ResolvedFieldLens {
  readonly group: LensGroup | null;
  readonly order: number | null;
  readonly role: PropertyRole | null;
  readonly visibility: TermVisibility | null;
}

/** A property's lens once its inverse partner's fallbacks are applied. */
export interface ResolvedPropertyLens {
  readonly visibility: TermVisibility | null;
  readonly pluralLabels: LangLiterals;
  readonly inverseLabels: LangLiterals;
  readonly inversePluralLabels: LangLiterals;
  readonly inverseVisibility: TermVisibility | null;
}

/** A site lens resolved against a provider's TBox outline. */
export interface SiteLensIndex {
  /** The lens of a class, its own or its nearest declaring ancestors'. */
  classLens(classUri: string): ResolvedClassLens;
  /** The lens of a property on a class, fact by fact. */
  fieldLens(classUri: string, propertyUri: string): ResolvedFieldLens;
  /** The lens of a property, with its inverse partner's fallbacks. */
  propertyLens(propertyUri: string): ResolvedPropertyLens;
  /**
   * The lens's IRIs the outline does not know, deduplicated and sorted. The
   * index ignores their entries.
   */
  readonly unknownIris: readonly string[];
}
