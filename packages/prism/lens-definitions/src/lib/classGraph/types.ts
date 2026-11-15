import type {
  FontFace,
  GraphBudget,
  LabelledBundle,
  Point,
  Rect,
} from "@canonical/prism-core";

/**
 * What a box of the graph stands for: a class of a loaded namespace, an
 * external stub (a class a relation reaches in a namespace no ontology
 * loaded), or a collapsed region (a loaded namespace drawn as one box).
 */
export type NodeKind = "class" | "stub" | "region";

/** One class the graph draws, as the explorer's query states it. */
export interface GraphClassInput {
  /** The class's full IRI. */
  readonly uri: string;
  /** The class's display name. */
  readonly label: string;
  /** The compact prefix of the ontology the class belongs to. */
  readonly prefix: string;
  /** Whether the class is abstract. */
  readonly abstract: boolean;
  /** The superclass's full IRI, or `null` at a root. */
  readonly superclass: string | null;
  /** How many instances the class has. */
  readonly instanceCount: number;
  /** How many datatype properties (fields) the class has, inherited ones included. */
  readonly fields: number;
  /** What the box stands for; a class of a loaded namespace when omitted. */
  readonly kind?: NodeKind;
  /** The classes a collapsed region holds; 1 when omitted. */
  readonly members?: number;
  /**
   * The term a stub or a collapsed region is named by (`rdf:List`,
   * `surface`), as no ontology names it; a class's term is its own.
   */
  readonly term?: string;
  /**
   * The relations a collapsed region holds, both ends inside it, which
   * its box draws as a count; 0 when omitted.
   */
  readonly held?: number;
}

/** One object property, drawn as a relation when both its ends are drawn. */
export interface GraphRelationInput {
  /** The property's full IRI. */
  readonly uri: string;
  /** The property's display name. */
  readonly label: string;
  /** The domain class's full IRI, or `null` when unstated. */
  readonly domain: string | null;
  /** The range's full IRI. */
  readonly range: string | null;
  /**
   * The instance statements the graph counts for the property's declared
   * edge between its domain and its range; 0 when it serves none.
   */
  readonly count: number;
}

/**
 * A relation a legend draws to show how one is drawn: shaped as the
 * graph's relations are, but counted by no store, so it states a stroke
 * and never a weight.
 */
export interface SpecimenRelationInput
  extends Omit<GraphRelationInput, "count"> {
  /** Marks the relation as a legend's specimen. */
  readonly specimen: true;
}

/** A relation of the data, or a legend's specimen. */
export type AnyRelationInput = GraphRelationInput | SpecimenRelationInput;

/**
 * One edge between two classes as the graph's `classEdges` serves it: a
 * property's statements from one class to another, counted, and whether
 * the ontology declares the pair.
 */
export interface ClassEdgeInput {
  /** The property's full IRI. */
  readonly property: string;
  /** The full IRI of the class the statements start from. */
  readonly subjectClass: string;
  /** The full IRI of the class the statements point to. */
  readonly objectClass: string;
  /** The instance statements the edge covers; 0 when none. */
  readonly count: number;
  /** Whether the property's domain and range declare the edge. */
  readonly declared: boolean;
}

/** A relation both of whose ends are drawn classes. */
export type DrawnRelation = AnyRelationInput & {
  readonly domain: string;
  readonly range: string;
};

/** What the class graph is laid out from: the data's classes and relations. */
export interface ClassGraphInput {
  readonly classes: readonly GraphClassInput[];
  /** Every relation, each counted by the graph. */
  readonly relations: readonly GraphRelationInput[];
}

/** What a legend's specimen is laid out from: relations no store counts. */
export interface SpecimenGraphInput {
  readonly classes: readonly GraphClassInput[];
  readonly relations: readonly SpecimenRelationInput[];
}

/** A class as the model holds it: its input, its box and its encodings. */
export interface ClassModel extends GraphClassInput {
  /** What the box stands for. */
  readonly kind: NodeKind;
  /** The classes it stands for: 1, or a collapsed region's count. */
  readonly members: number;
  /** The relations a collapsed region holds inside its box; else 0. */
  readonly held: number;
  /** The label's type size: 14, or 16 on a hub. */
  readonly size: number;
  /** The label's face: bold, or bold italic when abstract. */
  readonly face: FontFace;
  /** The instance count the box shows, or `null` when it shows none. */
  readonly count: string | null;
  /** The label's lines: one, or two when it wraps. */
  readonly lines: readonly string[];
  /** The box's width and height. */
  readonly w: number;
  readonly h: number;
  /** Whether the class is a hub. */
  readonly hub: boolean;
  /** Its incident drawn edges after bundling, subclass edges counted. */
  readonly degree: number;
  /** Whether it has a self-relation, and the loop's extent. */
  readonly loop: boolean;
  readonly loopExtent: number;
  /** How many relations name it as domain or range. */
  readonly relationCount: number;
  /** How many direct subclasses it has. */
  readonly subclassCount: number;
}

/** Every relation between one unordered pair of classes, drawn as one path. */
export interface Bundle extends LabelledBundle {
  /** The bundled relations, by label. */
  readonly relations: readonly DrawnRelation[];
  /** Whether relations run both ways. */
  readonly opposite: boolean;
  /**
   * Its heaviest relation's count: a figure the graph serves, the same
   * whether or not a store holds both directions of an inverse pair.
   * `undefined` on a legend's specimen, which no store counts.
   */
  readonly weight: number | undefined;
}

/** The subclass join from a region's roots to a superclass in another region. */
export interface RegionJoin {
  readonly id: string;
  readonly prefix: string;
  readonly target: string;
  readonly roots: readonly string[];
}

/** The graph as a model: classes, hierarchy, bundles, hubs and regions. */
export interface ClassGraphModel {
  readonly byId: ReadonlyMap<string, ClassModel>;
  /** Each class's superclass within its region. */
  readonly parent: ReadonlyMap<string, string>;
  /** Each class's superclass in another region. */
  readonly crossParent: ReadonlyMap<string, string>;
  /** Each class's subclasses within its region. */
  readonly children: ReadonlyMap<string, readonly string[]>;
  readonly bundles: readonly Bundle[];
  readonly joins: readonly RegionJoin[];
  /** The regions, largest first, with their classes by IRI. */
  readonly regionOrder: readonly {
    readonly prefix: string;
    readonly ids: readonly string[];
  }[];
  /** The relations both of whose ends are drawn, by IRI. */
  readonly drawnRelations: readonly DrawnRelation[];
  /**
   * The relations from a class to an IRI that no class of the input
   * holds, by IRI: each reaches an external stub when it is drawn.
   */
  readonly external: readonly DrawnRelation[];
}

/**
 * What the overview draws within its budget: the namespaces drawn class by
 * class, those collapsed to one box, and the external stubs the drawn
 * classes' relations reach.
 */
export interface DrawnScope {
  /** The prefixes drawn class by class, in the model's region order. */
  readonly expanded: readonly string[];
  /** The prefixes drawn as one box each, in the order they collapsed. */
  readonly collapsed: readonly string[];
  /** The IRIs of the external stubs, by code unit. */
  readonly stubs: readonly string[];
}

/** Where the keyboard moves from a node. */
export interface NodeNavigation {
  readonly up: string | null;
  readonly down: string | null;
  readonly left: string | null;
  readonly right: string | null;
  readonly home: string;
}

/** A class laid out: its model and its place. */
export interface LaidOutNode extends ClassModel {
  /**
   * Its column in the graph: its region's first column, over the regions
   * in packing order, plus its column in the region.
   */
  readonly col: number;
  /** The box's top-left corner in the graph. */
  readonly x: number;
  readonly y: number;
  /** The region the class sits in. */
  readonly region: string;
  /** The class's place in the rail's order. */
  readonly railIndex: number;
  /** The superclass hops to its root. */
  readonly depth: number;
  /** Where the keyboard moves from it. */
  readonly nav: NodeNavigation;
}

/** An edge laid out. */
export interface LaidOutEdge {
  /** `sub:<superclass>`, `join:<prefix> <superclass>` or `rel:<bundle>`. */
  readonly id: string;
  readonly kind: "subclass" | "relation";
  /** The superclass, or the bundle's first end. */
  readonly from: string;
  /** The subclasses, or the bundle's other end. */
  readonly to: readonly string[];
  /** The path, then its arrowheads. */
  readonly d: string;
  readonly heads: readonly string[];
  /** The region the edge runs in, or the first end's for a cross-region one. */
  readonly region: string;
  /** The relations bundled, for a relation. */
  readonly bundle?: Bundle;
  /** Whether the relation is a bridge: its ends lie in two regions. */
  readonly bridge?: boolean;
  /** The bus's x, for a subclass bus. */
  readonly busX?: number;
  /** Whether the relation is a self-loop or a same-column arc. */
  readonly self?: boolean;
  readonly arc?: boolean;
  /** The loop's or the arc's outermost point. */
  readonly apex?: Point;
}

/** A namespace region laid out: a shelf item with its label row. */
export interface LaidOutRegion {
  readonly prefix: string;
  readonly ids: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** How many columns it has. */
  readonly columns: number;
  /** How many classes it stands for: its collapsed box's count, or its own. */
  readonly members: number;
  /** Whether it is a namespace collapsed to one box. */
  readonly collapsed: boolean;
  /**
   * The classes a collapsed namespace's box stands for, in the rail's
   * order, each at its depth; none for a namespace drawn class by class,
   * whose classes the layout's rail lists.
   */
  readonly boxed: readonly BoxedClass[];
}

/** How an external stub is named. */
export interface StubName {
  /** The prefix its region is keyed by. */
  readonly prefix: string;
  /** Its local name, after the IRI's last `#` or `/`. */
  readonly local: string;
  /** Its compact term, `prefix:local`, or the IRI when it has no prefix. */
  readonly term: string;
}

/** A class a collapsed namespace's box stands for, as the rail lists it. */
export interface BoxedClass {
  readonly uri: string;
  /** How many superclass hops it is below its namespace's root. */
  readonly depth: number;
  /** Its label, which the search matches as it matches a drawn class's. */
  readonly label: string;
  /** Its instances, which the instances axis reads. */
  readonly instanceCount: number;
}

/** One row of the phone view. */
export interface PhoneRow {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** The phone view: rows in rail order with arcs right of the spine. */
export interface PhoneLayout {
  readonly width: number;
  readonly height: number;
  readonly headers: readonly {
    readonly prefix: string;
    readonly y: number;
    readonly count: number;
  }[];
  readonly rows: ReadonlyMap<string, PhoneRow>;
  readonly edges: readonly LaidOutEdge[];
  /** The subclass guides at each parent's indent. */
  readonly guides: readonly { readonly from: string; readonly d: string }[];
}

/** The whole class graph laid out, desktop and phone. */
export interface ClassGraphLayout {
  readonly model: ClassGraphModel;
  readonly nodes: ReadonlyMap<string, LaidOutNode>;
  readonly edges: readonly LaidOutEdge[];
  readonly regions: readonly LaidOutRegion[];
  /** Every class in the rail's order: pre-order, by column order. */
  readonly rail: readonly string[];
  /** The graph's bounds plus the view margin. */
  readonly viewBox: Rect;
  /**
   * The box the canvas opens on at the design canvas: the viewBox when it
   * fits there at the legible zoom, else the legible window from its
   * top-left corner whose edges cut through no box.
   */
  readonly view: Rect;
  /** The zoom at which the viewBox fits the design canvas. */
  readonly fitZoom: number;
  /** The channel the packer settled on. */
  readonly channel: number;
  /** Every rule the layout could not keep, in words. */
  readonly findings: readonly string[];
  readonly phone: PhoneLayout;
}

/** What a legible window frames, beyond the graph and the canvas. */
export interface LegibleWindowOptions {
  /** The box of the class selected on arrival, which the window holds. */
  readonly arrival?: Rect | undefined;
  /** The box to frame; the graph's whole viewBox when omitted. */
  readonly within?: Rect;
  /**
   * The least on-screen zoom the window shows at: the legible zoom
   * (`MIN_FIT`) when omitted; the overview's floor for a Fit.
   */
  readonly zoom?: number;
}

/** A namespace region as the packing orders it: its prefix and its size. */
export interface RegionSize {
  readonly prefix: string;
  /** How many classes it holds, a box's included. */
  readonly size: number;
  /**
   * What it draws: its classes (`class`, when omitted), one box for a
   * collapsed namespace (`region`) or an external stub (`stub`).
   */
  readonly kind?: NodeKind;
}

/**
 * The relations that cross between two regions, whichever way they run:
 * a bridge, by the regions' prefixes.
 */
export interface Bridge {
  readonly a: string;
  readonly b: string;
  /** How many relations cross between the two. */
  readonly relations: number;
}

/** How the class graph is laid out, beyond its input. */
export interface ClassGraphLayoutOptions {
  /**
   * How many barycentre sweeps order the columns; 0 keeps the
   * label-sorted order, the baseline the crossings are measured against.
   */
  readonly sweeps?: number;
  /**
   * The budget the overview keeps at rest: the largest namespaces
   * collapse to one box each while it would draw more nodes, and the
   * relations to classes outside the input reach external stubs. Without
   * one, every class given is drawn and nothing else, as a legend and the
   * whole graph's measurements draw it.
   */
  readonly budget?: GraphBudget;
  /**
   * The prefix of the namespace the view drills into, within a budget: it
   * is drawn class by class and every other namespace as one box, and the
   * view is not held to the overview's fit.
   */
  readonly drill?: string;
}

/** A packing of regions into shelves. */
export interface ShelfPacking {
  /** Each shelf's regions, by index into the sizes. */
  readonly shelves: readonly (readonly number[])[];
  /** The packed width and height, in px. */
  readonly w: number;
  readonly h: number;
  /** The zoom at which the packing, with its margin, fits the design canvas. */
  readonly fit: number;
}

/** A stroke width a relation is drawn at, in px: one per decade of its count. */
export type StrokeWidth = 1 | 2 | 4 | 8;

/** How a relation's stroke shows its weight. */
export interface StrokeWeight {
  readonly width: StrokeWidth;
  /** Whether it is dashed: no statement instantiates it. */
  readonly dashed: boolean;
}

/** A relation's line as it is drawn: its path, heads, width and dash. */
export interface RelationStroke {
  readonly d: string;
  readonly heads: readonly string[];
  readonly width: number;
  /** The dash pattern, where no statement instantiates the relation. */
  readonly dash: string | undefined;
}

/** A bridge's label placed on its route, drawn at rest. */
export interface BridgeLabel {
  /** The bridge's edge id. */
  readonly edge: string;
  readonly text: string;
  /** The label's box with its halo. */
  readonly box: Rect;
  /**
   * The label's centre: on or beside a stretch of route only its bridge
   * runs on, as near its arrowhead as it fits.
   */
  readonly cx: number;
  readonly cy: number;
}

/**
 * The bridges' labels at rest: those placed, and the bridges whose label
 * finds no clear place, which are named only while a class at one of
 * their ends is the focus.
 */
export interface BridgeLabelPlacement {
  readonly placed: readonly BridgeLabel[];
  /** The edge ids of the bridges left without a label at rest. */
  readonly omitted: readonly string[];
  /**
   * The omitted bridges' labels, by edge id, where they are drawn while a
   * class at one of their ends is the focus.
   */
  readonly onFocus: readonly BridgeLabel[];
}
