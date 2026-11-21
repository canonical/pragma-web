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

/** How a list reads and filters a field's values. */
export type ListFieldType = "text" | "number" | "flag" | "date" | "choices";

/** How a property's values are stored: literals, entities or annotations. */
export type ServedPropertyKind = "DATATYPE" | "OBJECT" | "ANNOTATION";

/**
 * One field of a class as a provider serves it (`OntologyClass.properties`):
 * the class-scoped name, the property, its cardinality and its lens.
 */
export interface ServedClassField {
  /** The field's name on this class (`ClassProperty.name`). */
  readonly name: string;
  readonly property: {
    readonly uri: string;
    readonly label: string | null;
    readonly kind: ServedPropertyKind;
    /** The IRI of the property's range. */
    readonly range: string;
  };
  /** Whether the field holds at most one value on this class. */
  readonly singular: boolean;
  readonly group: {
    readonly uri: string;
    readonly label: string | null;
    readonly order: number | null;
  } | null;
  readonly order: number | null;
  readonly role: PropertyRole | null;
  readonly visibility: TermVisibility | null;
}

/**
 * One field of a list: what a column, a sort and a facet need to know about
 * a property of the listed class.
 */
export interface ListField {
  /** The field's served name; the key of its values, sort and facet. */
  readonly id: string;
  /** The property's IRI. */
  readonly property: string;
  readonly type: ListFieldType;
  /** The property's label, else its served name. */
  readonly label: string;
  /** The IRI of the field's group, or null. */
  readonly group: string | null;
  readonly role: PropertyRole | null;
  /** Whether the lens shows the field prominently on the class. */
  readonly prominent: boolean;
  /** Whether a list can sort by the field: one value, not an entity. */
  readonly enableSorting: boolean;
  /** Whether a list can filter by the field's values. */
  readonly facetable: boolean;
}

/** A field a list shows as a fact, with its header. */
export interface DisplayField {
  /** The {@link ListField.id} shown. */
  readonly field: string;
  readonly header: string;
}

/** A class's list fields and the ones it shows, in the lens's order. */
export interface ListFields {
  readonly fields: readonly ListField[];
  readonly display: readonly DisplayField[];
}

/** One value read for a node's field: its shown text and, for an entity, its IRI. */
export interface ReadValue {
  readonly text: string;
  readonly uri: string | null;
}

/** A node's value for one list field, as `Node.values` serves it. */
export interface NodeValue {
  /** The field's served name. */
  readonly field: string;
  /** The field's label, which a table's header reads. */
  readonly label: string;
  /** How the field's values read, which sets a table's column. */
  readonly type: ListFieldType;
  /** The values' texts joined, or null when the node has none. */
  readonly text: string | null;
  /** The IRI of the value when it is exactly one entity, else null. */
  readonly uri: string | null;
}

/** One node of a faceted set: its IRI and the values read for each field id. */
export interface FacetRow {
  readonly uri: string;
  readonly values: Readonly<Record<string, readonly ReadValue[]>>;
}

/** Keeps the nodes holding one of `values` for `field`; `null` stands for no value. */
export interface FacetFilter {
  readonly field: string;
  readonly values: readonly (string | null)[];
}

/** Orders a set by one field's first value, the nodes without one last. */
export interface FacetSort {
  readonly field: string;
  readonly descending?: boolean | null;
}

/** One bucket of a facet: a value (null for "none"), its text and its count. */
export interface FacetValueCount {
  readonly value: string | null;
  readonly label: string | null;
  readonly count: number;
}

/** A field's buckets, counted with every filter but the field's own. */
export interface FacetCount {
  readonly field: string;
  readonly label: string;
  readonly values: readonly FacetValueCount[];
}

/** The filtered, sorted set's IRIs, its size and its facets. */
export interface FacetedSelection {
  readonly uris: readonly string[];
  readonly totalCount: number;
  readonly facets: readonly FacetCount[];
}
