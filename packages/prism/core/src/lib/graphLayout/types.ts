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
export interface RegionEdge<TBundle extends LayeredBundle = LayeredBundle> {
  readonly id: string;
  readonly kind: "subclass" | "relation";
  readonly from: string;
  readonly to: readonly string[];
  readonly commands: readonly PathCommand[];
  readonly heads: readonly (readonly PathCommand[])[];
  readonly bundle?: TBundle;
  readonly busX?: number;
  readonly self?: boolean;
  readonly arc?: boolean;
  readonly apex?: Point;
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
export interface RegionLayout<TBundle extends LayeredBundle = LayeredBundle> {
  readonly nodes: ReadonlyMap<string, RegionNode>;
  readonly edges: readonly RegionEdge<TBundle>[];
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
  /**
   * A class's layer: its column before a full layer split, so the classes
   * of layer 0 are the region's roots however many columns they take.
   */
  readonly layerOf: (id: string) => number;
  /** A class's superclass hops to its root. */
  readonly depthOf: (id: string) => number;
  /** A relation-placed class's predecessors, back edges removed. */
  readonly predecessorsOf: (id: string) => readonly string[];
}

/** A box the layered layout places: its label, its size and its loop. */
export interface LayeredNode {
  readonly label: string;
  /** The box's width and height. */
  readonly w: number;
  readonly h: number;
  /** Whether the node is a hub. */
  readonly hub: boolean;
  /** Whether it has a self-relation, and the loop's extent. */
  readonly loop: boolean;
  readonly loopExtent: number;
}

/** A relation both of whose ends are laid out, by id. */
export interface LayeredRelation {
  readonly domain: string;
  readonly range: string;
}

/** Every relation between one unordered pair of nodes, drawn as one path. */
export interface LayeredBundle {
  /** The pair's ids, sorted, joined by a space. */
  readonly id: string;
  readonly a: string;
  readonly b: string;
  /** Whether both ends are one node. */
  readonly self: boolean;
  /** The ends that are some relation's range, which carry an arrowhead. */
  readonly heads: ReadonlySet<string>;
  /** Whether the ends lie in two regions. */
  readonly cross: boolean;
}

/** The nodes the layered layout places, with their hierarchy. */
export interface LayeredNodes {
  readonly byId: ReadonlyMap<string, LayeredNode>;
  /** Each node's parent within its region. */
  readonly parent: ReadonlyMap<string, string>;
  /** Each node's parent in another region. */
  readonly crossParent: ReadonlyMap<string, string>;
  /** Each node's children within its region. */
  readonly children: ReadonlyMap<string, readonly string[]>;
}

/** The edges the layered layout routes: bundles and the relations in them. */
export interface LayeredEdges<TBundle extends LayeredBundle = LayeredBundle> {
  readonly bundles: readonly TBundle[];
  /** The relations both of whose ends are laid out. */
  readonly drawnRelations: readonly LayeredRelation[];
}

/** Everything the layered layout reads: its nodes and its edges. */
export interface LayeredModel<TBundle extends LayeredBundle = LayeredBundle>
  extends LayeredNodes,
    LayeredEdges<TBundle> {}

/** Which region the layered layout lays out, and how. */
export interface LayeredOptions {
  /** The region's nodes, by id. */
  readonly ids: readonly string[];
  /** The gap between columns, in px. */
  readonly channel: number;
  /** How many barycentre sweeps run. */
  readonly sweeps: number;
  /**
   * The side and ideal offset of each end of a relation to another region,
   * by `<bundle> <node>`; an end not named meets its box at the middle.
   */
  readonly crossPorts?: ReadonlyMap<string, CrossPort>;
  /**
   * The most nodes one column holds: a layer of more splits into balanced
   * consecutive columns, in its order. Unset, a layer is one column.
   */
  readonly bandMembersMax?: number;
}

/** One relation drawn in a bundle, as the labels name it. */
export interface LabelledRelation extends LayeredRelation {
  /** The predicate's label. */
  readonly label: string;
}

/** The relations between one pair of nodes, as the labels read them. */
export interface LabelledBundle extends LayeredBundle {
  /** The bundled relations. */
  readonly relations: readonly LabelledRelation[];
  /** Whether relations run both ways. */
  readonly opposite: boolean;
}

/** A node laid out in the graph, as the label placer reads it. */
export interface LabelledNode {
  /** The node's id, unique in the graph. */
  readonly uri: string;
  /** The column in its region. */
  readonly col: number;
  /** The region the node sits in. */
  readonly region: string;
  /** The box's top-left corner and size in the graph. */
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  /** The loop's extent above and right of the box. */
  readonly loopExtent: number;
}

/** An edge laid out in the graph, as the label placer reads it. */
export interface LabelledEdge {
  readonly id: string;
  readonly kind: "subclass" | "relation";
  readonly from: string;
  readonly to: readonly string[];
  /** The path's SVG data. */
  readonly d: string;
  readonly bundle?: LabelledBundle;
  readonly self?: boolean;
  readonly arc?: boolean;
  /** The loop's or the arc's outermost point. */
  readonly apex?: Point;
}

/** A region laid out in the graph, as the label placer reads it. */
export interface LabelledRegion {
  readonly prefix: string;
  readonly ids: readonly string[];
  readonly x: number;
  readonly y: number;
}

/** A graph laid out, as far as its edge labels need: the placer's input. */
export interface LabelledLayout {
  readonly nodes: ReadonlyMap<string, LabelledNode>;
  readonly edges: readonly LabelledEdge[];
  readonly regions: readonly LabelledRegion[];
  /** The box the labels must stay inside. */
  readonly viewBox: Rect;
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

/** A node as a graph engine places it: its box and its column. */
export type GraphLayoutNode = RegionNode;

/** An edge as a graph engine routes it: its ends, its path and its heads. */
export type GraphLayoutEdge<TBundle extends LayeredBundle = LayeredBundle> =
  RegionEdge<TBundle>;

/** What a graph engine is told beside its nodes and edges. */
export type GraphLayoutOptions = LayeredOptions;

/**
 * A graph engine's output: its nodes' positions, its edges' routes, and what
 * it found while placing them.
 */
export type GraphLayoutResult<TBundle extends LayeredBundle = LayeredBundle> =
  RegionLayout<TBundle>;

/**
 * A graph engine's layout: a pure function of its nodes, edges and options
 * to positions and routes, so the same input always gives the same result.
 */
export type GraphLayout = <TBundle extends LayeredBundle>(
  nodes: LayeredNodes,
  edges: LayeredEdges<TBundle>,
  options: GraphLayoutOptions,
) => GraphLayoutResult<TBundle>;
