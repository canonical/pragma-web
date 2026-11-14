import type {
  FontFace,
  LayeredBundle,
  Point,
  Rect,
} from "@canonical/prism-core";

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
}

/** A relation both of whose ends are drawn classes. */
export interface DrawnRelation extends GraphRelationInput {
  readonly domain: string;
  readonly range: string;
}

/** What the class graph is laid out from. */
export interface ClassGraphInput {
  readonly classes: readonly GraphClassInput[];
  readonly relations: readonly GraphRelationInput[];
}

/** A class as the model holds it: its input, its box and its encodings. */
export interface ClassModel extends GraphClassInput {
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
export interface Bundle extends LayeredBundle {
  /** The bundled relations, by label. */
  readonly relations: readonly DrawnRelation[];
  /** Whether relations run both ways. */
  readonly opposite: boolean;
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
  /** The column in its region. */
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

/** An edge label placed for the focus node. */
export interface PlacedLabel {
  readonly edge: string;
  readonly lines: readonly string[];
  readonly box: Rect;
  /** The label's centre. */
  readonly cx: number;
  readonly cy: number;
}

/** The labels placed for a focus node, and those that found no place. */
export interface LabelPlacement {
  readonly placed: readonly PlacedLabel[];
  readonly omitted: readonly {
    readonly edge: string;
    readonly lines: readonly string[];
  }[];
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
