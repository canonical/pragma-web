/** One relation the canvas draws, as its stroke's attributes state it. */
export interface CanvasRelation {
  /** The compact term of the class or box the relation leaves. */
  readonly from: string;
  /** The compact term of the class or box the relation points to. */
  readonly to: string;
  /** The drawn edge's weight, absent on a legend's specimen. */
  readonly weight: number | undefined;
  /** The stroke's width, in user units. */
  readonly width: number;
  /** Whether the stroke is dashed. */
  readonly dashed: boolean;
  /** Whether the relation runs between two namespaces or to a stub. */
  readonly bridge: boolean;
  /** Whether the relation is drawn as the focus's, wider than its weight. */
  readonly focus: boolean;
}

/** What the graph checks read from a canvas's served SVG. */
export interface CanvasMeasure {
  /** How many nodes the canvas draws: classes, boxes and stubs. */
  readonly nodes: number;
  /** How many nodes the canvas draws of each kind. */
  readonly kinds: Readonly<Record<string, number>>;
  /** How many nodes the fullest graph-wide column holds. */
  readonly largestColumn: number;
  /** The SVG's size in UTF-8 bytes. */
  readonly bytes: number;
  /** How many elements the SVG holds. */
  readonly elements: number;
  /** The viewBox the server paints, in user units. */
  readonly viewBox: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  };
  /** The zoom at which the viewBox fills the design canvas. */
  readonly openingZoom: number;
  /** The nodes and regions whose corner is off the 16px lattice. */
  readonly offLattice: readonly string[];
  /** Every relation the canvas draws. */
  readonly relations: readonly CanvasRelation[];
  /** How many of the relations are bridges. */
  readonly bridges: number;
  /** How many bridge labels the canvas draws at rest. */
  readonly bridgeLabels: number;
}

/** A property as the explorer's ontologies serve it. */
export interface ServedProperty {
  readonly uri: string;
  readonly kind: string;
  readonly domain: { readonly uri: string } | null;
  /** The range's IRI, or its compact address. */
  readonly range: string;
}

/** What a site's graph serves of its ontologies and their class edges. */
export interface ServedGraph {
  readonly ontologies: readonly {
    readonly prefix: string;
    readonly namespace: string;
    readonly classes: readonly { readonly uri: string }[];
    readonly properties: readonly ServedProperty[];
  }[];
  readonly classEdges: readonly {
    readonly property: string;
    readonly subjectClass: string;
    readonly objectClass: string;
    readonly count: number;
    readonly declared: boolean;
  }[];
}

/** The weights and the bridges a site's graph serves. */
export interface ServedWeights {
  /**
   * For each pair of classes some relation joins, keyed by their compact
   * terms in code-unit order and a space, the served count of the
   * heaviest relation between them.
   */
  readonly weights: ReadonlyMap<string, number>;
  /**
   * How many relations leave a loaded class for a class of another
   * namespace or of no loaded one.
   */
  readonly bridges: number;
}

/** A bridge label on screen. */
export interface BridgeLabelMeasure {
  /** The label's text. */
  readonly text: string;
  /** The label's on-screen size, in px. */
  readonly px: number;
}
