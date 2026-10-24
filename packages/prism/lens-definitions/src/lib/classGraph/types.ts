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

/** A face of the shipped font the canvas sets text in. */
export type FontFace = "regular" | "bold" | "boldItalic";

/** One face's advance widths, in font units, by character. */
export interface FaceMetrics {
  readonly advances: Readonly<Record<string, number>>;
  readonly tabular: Readonly<Record<string, number>>;
}

/** The shipped font's metrics, in font units. */
export interface FontMetrics {
  readonly unitsPerEm: number;
  readonly ascender: number;
  readonly descender: number;
  /** The width of a character the table does not hold, in ems. */
  readonly fallbackEm: number;
  readonly faces: Readonly<Record<FontFace, FaceMetrics>>;
}

/** A rectangle, in px of the graph's world space. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** A point, in px of the graph's world space. */
export type Point = readonly [number, number];

/**
 * One command of an SVG path, with absolute integer coordinates: `M`, `L`
 * and `C` take points, `H` and `V` one coordinate.
 */
export type PathCommand =
  | readonly ["M" | "L", number, number]
  | readonly ["H" | "V", number]
  | readonly ["C", number, number, number, number, number, number];

/** One level of port spacing a box's side tries, in px. */
export interface PortLevel {
  readonly name: string;
  /** The least distance from a corner. */
  readonly corner: number;
  /** The least distance from the subclass tick. */
  readonly tick: number;
  /** The least distance between two ports. */
  readonly spacing: number;
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
export interface Bundle {
  /** The pair's IRIs, sorted, joined by a space. */
  readonly id: string;
  readonly a: string;
  readonly b: string;
  /** Whether both ends are one class. */
  readonly self: boolean;
  /** The bundled relations, by label. */
  readonly relations: readonly DrawnRelation[];
  /** The ends that are some relation's range, which carry an arrowhead. */
  readonly heads: ReadonlySet<string>;
  /** Whether the ends lie in two regions. */
  readonly cross: boolean;
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

/** A line already fixed on a box's side: a subclass tick or a loop's end. */
export interface FixedPort {
  readonly kind: "tick" | "loop";
  /** Its offset from the box's top, in px. */
  readonly y: number;
}

/** The ports a side was given and the spacing level it needed. */
export interface PortAllocation {
  /** Each request's offset from the box's top, in the requests' order. */
  readonly ys: readonly number[];
  /** The index of the level in `PORT_LEVELS` the side needed. */
  readonly level: number;
}

/** A box placed in its region's own coordinates. */
export interface RegionNode {
  readonly id: string;
  readonly col: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** Its place in its column, top first. */
  readonly order: number;
}

/** An edge routed in its region's own coordinates. */
export interface RegionEdge {
  readonly id: string;
  readonly kind: "subclass" | "relation";
  readonly from: string;
  readonly to: readonly string[];
  readonly commands: readonly PathCommand[];
  readonly heads: readonly (readonly PathCommand[])[];
  readonly bundle?: Bundle;
  readonly busX?: number;
  readonly self?: boolean;
  readonly arc?: boolean;
  readonly apex?: Point;
}

/** What a legible window frames, beyond the graph and the canvas. */
export interface LegibleWindowOptions {
  /** The box of the class selected on arrival, which the window holds. */
  readonly arrival?: Rect | undefined;
  /** The box to frame; the graph's whole viewBox when omitted. */
  readonly within?: Rect;
}

/**
 * Where one end of a relation between two regions meets its box: the side
 * that faces the other end, and the port's ideal offset from the box's top,
 * towards the other end's middle.
 */
export interface CrossPort {
  readonly side: "left" | "right";
  readonly ideal: number;
}

/** One region laid out in its own coordinates, its top-left at the origin. */
export interface RegionLayout {
  readonly nodes: ReadonlyMap<string, RegionNode>;
  readonly edges: readonly RegionEdge[];
  /** Each column's items, top first: class IRIs and waypoint ids. */
  readonly columns: readonly (readonly string[])[];
  readonly columnX: readonly number[];
  readonly columnWidth: readonly number[];
  /** Each relation port's height, by `<bundle> <class>`. */
  readonly ports: ReadonlyMap<string, number>;
  /** The box that holds every node, loop and edge. */
  readonly content: Rect;
  /** Every rule the region could not keep, in words. */
  readonly findings: readonly string[];
  /** How many same-column arcs nest past the channel into the next column. */
  readonly crowdedArcs: number;
  /** A class's column. */
  readonly columnOf: (id: string) => number;
  /** A class's superclass hops to its root. */
  readonly depthOf: (id: string) => number;
  /** A relation-placed class's predecessors, back edges removed. */
  readonly predecessorsOf: (id: string) => readonly string[];
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
