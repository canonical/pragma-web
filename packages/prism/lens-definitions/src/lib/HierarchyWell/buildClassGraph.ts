/**
 * The definitions well's DETERMINISTIC layout: RADIAL CLUSTERS rather
 * than an organigram. Pure — same input, byte-equal output
 * (`buildClassGraph.test.ts` pins it) — because positions are computed
 * identically on the server and the client; the SSR/hydration suite
 * gates any drift.
 *
 * Layout model, per ontology: a radial tree. Depth from the root is the RADIUS
 * (each depth is a concentric ring), and each subtree claims an angular window
 * proportional to its leaf count (classic tidy-radial, deterministic). The
 * shared relaxation pass then separates any boxes that still collide — physics
 * on the angular axis. A 17-class ontology settles into a compact disc instead
 * of a 1,500px-wide comb, so the root never overflows the canvas horizontally.
 *
 * Clusters pack left-to-right, wrapping into rows against a target
 * width, in query order — stable, and the wrap keeps the whole canvas
 * near the golden-ish aspect the explorer's underground actually has.
 *
 * Edges carry TWO families:
 * subclass → superclass stays a quiet STRUCTURAL line; object properties
 * (domain → range, both classes present) become SEMANTIC arcs wearing
 * their predicate — the addition that turns the tree back into an
 * ontology. Parallel arcs stack their bows; a self-referential property
 * (`cs:extends`) draws as a loop.
 */

import {
  buildQuadArc,
  buildSelfLoop,
  findEdgeEndpoint,
  relaxBoxes,
  settle,
  type WellBox,
} from "@canonical/prism-core";
import compactUri from "../compactUri.js";
import type { OntologyNamespace } from "../types.js";
import {
  CANVAS_PADDING,
  CLUSTER_GAP,
  COLLISION_GAP,
  EDGE_BOW,
  FIT_VIEW_WIDTH,
  NODE_CHAR_WIDTH,
  NODE_HEIGHT,
  NODE_MAX_WIDTH,
  NODE_MIN_WIDTH,
  NODE_PADDING,
  RELAX_ITERATIONS,
  RING_X,
  RING_Y,
  TARGET_ROW_WIDTH,
} from "./constants.js";
import type {
  ClassGraph,
  ClassGraphOntology,
  ClusterExtent,
  DepthClass,
  TermFlowEdge,
  TermFlowNode,
} from "./types.js";

const estimateWidth = (label: string): number =>
  Math.min(
    Math.max(
      Math.round(label.length * NODE_CHAR_WIDTH) + NODE_PADDING,
      NODE_MIN_WIDTH,
    ),
    NODE_MAX_WIDTH,
  );

/**
 * A class's superclass depth within its ontology: 0 for roots (no
 * superclass, or one not in this ontology's list). Cycles — schema-illegal
 * but defended — terminate at the walk's length bound.
 */
export const measureSuperclassDepth = (
  uri: string,
  superclassByUri: ReadonlyMap<string, string | undefined>,
): number => {
  let depth = 0;
  let current = superclassByUri.get(uri);
  while (current !== undefined && depth < superclassByUri.size) {
    if (!superclassByUri.has(current)) break;
    depth += 1;
    current = superclassByUri.get(current);
  }
  return depth;
};

/**
 * The superclass depth of every class in ONE ontology, keyed by full URI
 * — shared with the rail so the index indents by the identical measure
 * the well ringifies by, one source of truth for depth.
 */
export const computeClassDepths = (
  classes: readonly DepthClass[],
): ReadonlyMap<string, number> => {
  const superclassByUri = new Map<string, string | undefined>(
    classes.map((klass) => [klass.uri, klass.superclass?.uri]),
  );
  return new Map(
    classes.map((klass) => [
      klass.uri,
      measureSuperclassDepth(klass.uri, superclassByUri),
    ]),
  );
};

interface WorkingNode extends WellBox {
  readonly id: string;
  readonly data: TermFlowNode["data"];
}

type OntologyClass = ClassGraphOntology["classes"][number];

/** One ontology's subclass forest: each class's children, and its roots. */
interface ClassForest {
  readonly childrenOf: ReadonlyMap<string, readonly OntologyClass[]>;
  readonly roots: readonly OntologyClass[];
}

/** A class with its subtree, and the number of leaves the subtree holds. */
interface ClassTree {
  readonly klass: OntologyClass;
  readonly leaves: number;
  readonly children: readonly ClassTree[];
}

/** What every step of one cluster's radial walk reads. */
interface ClusterWalk {
  readonly ontology: ClassGraphOntology;
  readonly singleRoot: boolean;
}

/** One ontology's laid-out nodes and the bounding box around them. */
interface Cluster {
  readonly ontology: ClassGraphOntology;
  readonly nodes: readonly WorkingNode[];
  readonly minX: number;
  readonly minY: number;
  readonly width: number;
  readonly height: number;
}

/** Where a cluster's top-left corner lands on the canvas. */
interface PackedCluster {
  readonly cluster: Cluster;
  readonly x: number;
  readonly y: number;
}

/**
 * Group one ontology's classes into a forest: a class whose superclass is
 * in the same ontology is that superclass's child, and every other class
 * is a root.
 */
const groupClassForest = (ontology: ClassGraphOntology): ClassForest => {
  const childrenOf = new Map<string, OntologyClass[]>();
  const roots: OntologyClass[] = [];
  const uris = new Set(ontology.classes.map((klass) => klass.uri));
  for (const klass of ontology.classes) {
    const parent = klass.superclass?.uri;
    if (parent !== undefined && uris.has(parent)) {
      const siblings = childrenOf.get(parent) ?? [];
      siblings.push(klass);
      childrenOf.set(parent, siblings);
    } else {
      roots.push(klass);
    }
  }
  return { childrenOf, roots };
};

/**
 * Build a class's subtree from the forest, counting its leaves once: a
 * class with no children is one leaf, and any other class holds its
 * children's leaves.
 */
const buildClassTree = (
  klass: OntologyClass,
  forest: ClassForest,
): ClassTree => {
  const children = (forest.childrenOf.get(klass.uri) ?? []).map((child) =>
    buildClassTree(child, forest),
  );
  const leaves =
    children.length === 0
      ? 1
      : children.reduce((sum, child) => sum + child.leaves, 0);
  return { klass, leaves, children };
};

/**
 * Place one class and its subtree inside the angular window `[from, to)`,
 * one ring further out per depth. A child sits one hop deeper than the
 * parent that placed it, which is its superclass depth within the
 * ontology: the walk starts at the roots, so it never enters a cycle.
 */
const placeSubtree = (
  walk: ClusterWalk,
  { klass, children }: ClassTree,
  depth: number,
  from: number,
  to: number,
): WorkingNode[] => {
  const namespaces = [walk.ontology];
  // Radius: the lone root owns the centre; in a multi-root disc every
  // root starts one ring out, keeping the middle clear.
  const ring = walk.singleRoot ? depth : depth + 1;
  const angle = (from + to) / 2 - Math.PI / 2;
  const atCentre = walk.singleRoot && depth === 0;
  const radiusX = atCentre ? 0 : ring * RING_X;
  const radiusY = atCentre ? 0 : ring * RING_Y;
  const label = klass.label ?? compactUri(klass.uri, namespaces);
  const node: WorkingNode = {
    id: compactUri(klass.uri, namespaces),
    data: {
      term: compactUri(klass.uri, namespaces),
      label,
      isAbstract: klass.isAbstract,
      prefix: walk.ontology.prefix,
    },
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY,
    width: estimateWidth(label),
    height: NODE_HEIGHT,
  };
  return [node, ...placeSiblings(walk, children, depth + 1, from, to)];
};

/**
 * Share the angular window `[from, to)` among sibling classes in
 * proportion to their leaf counts, and place each subtree in its share.
 */
const placeSiblings = (
  walk: ClusterWalk,
  siblings: readonly ClassTree[],
  depth: number,
  from: number,
  to: number,
): WorkingNode[] => {
  const total = siblings.reduce((sum, sibling) => sum + sibling.leaves, 0);
  let cursor = from;
  return siblings.flatMap((sibling) => {
    const share = ((to - from) * sibling.leaves) / Math.max(total, 1);
    const placed = placeSubtree(walk, sibling, depth, cursor, cursor + share);
    cursor += share;
    return placed;
  });
};

/**
 * One ontology's radial cluster, centred at (0,0): subtree angular
 * windows proportional to leaf counts, radius = depth. Multiple roots
 * share the disc as siblings of a virtual centre (and sit at radius 1 so
 * none of them squats the middle pretending to be THE root). The shared
 * relaxation pass then separates any boxes that still collide.
 */
const layOutCluster = (ontology: ClassGraphOntology): WorkingNode[] => {
  const forest = groupClassForest(ontology);
  const trees = forest.roots.map((root) => buildClassTree(root, forest));
  const walk: ClusterWalk = { ontology, singleRoot: trees.length === 1 };
  const nodes = placeSiblings(walk, trees, 0, 0, 2 * Math.PI);
  relaxBoxes(nodes, {
    gap: COLLISION_GAP,
    iterations: RELAX_ITERATIONS,
    pinned: walk.singleRoot ? new Set([0]) : undefined,
  });
  return nodes;
};

/** Measure the bounding box around one ontology's laid-out nodes. */
const measureCluster = (
  ontology: ClassGraphOntology,
  nodes: readonly WorkingNode[],
): Cluster => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.width / 2);
    minY = Math.min(minY, node.y - node.height / 2);
    maxX = Math.max(maxX, node.x + node.width / 2);
    maxY = Math.max(maxY, node.y + node.height / 2);
  }
  return {
    ontology,
    nodes,
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Pack clusters left to right into rows that wrap at the target width, in
 * query order, so the packing is stable.
 */
const packClusters = (clusters: readonly Cluster[]): PackedCluster[] => {
  const packed: PackedCluster[] = [];
  let rowX = 0;
  let rowY = 0;
  let rowHeight = 0;
  for (const cluster of clusters) {
    if (rowX > 0 && rowX + cluster.width > TARGET_ROW_WIDTH) {
      rowY += rowHeight + CLUSTER_GAP;
      rowX = 0;
      rowHeight = 0;
    }
    packed.push({
      cluster,
      x: rowX + CANVAS_PADDING,
      y: rowY + CANVAS_PADDING,
    });
    rowX += cluster.width + CLUSTER_GAP;
    rowHeight = Math.max(rowHeight, cluster.height);
  }
  return packed;
};

/** The canvas rectangle each packed cluster occupies. */
const buildClusterExtents = (
  packed: readonly PackedCluster[],
): ClusterExtent[] =>
  packed.map(({ cluster, x, y }) => ({
    prefix: cluster.ontology.prefix,
    x: settle(x),
    y: settle(y),
    width: settle(cluster.width),
    height: settle(cluster.height),
  }));

/**
 * Every node at its settled canvas position: rebased to its cluster's
 * top-left corner, then moved to where the cluster was packed.
 */
const buildNodes = (packed: readonly PackedCluster[]): TermFlowNode[] =>
  packed.flatMap(({ cluster, x, y }) =>
    cluster.nodes.map((node) => ({
      id: node.id,
      data: node.data,
      x: settle(node.x - cluster.minX + x),
      y: settle(node.y - cluster.minY + y),
      width: node.width,
      height: node.height,
    })),
  );

/** Structural edges: subclass → superclass, straight, unlabelled. */
const buildStructuralEdges = (
  ontologies: readonly ClassGraphOntology[],
  nodeById: ReadonlyMap<string, TermFlowNode>,
): TermFlowEdge[] =>
  ontologies.flatMap((ontology) => {
    const namespaces = [ontology];
    return ontology.classes.flatMap((klass): TermFlowEdge[] => {
      const parentUri = klass.superclass?.uri;
      if (parentUri === undefined) return [];
      const child = nodeById.get(compactUri(klass.uri, namespaces));
      const parent = nodeById.get(compactUri(parentUri, namespaces));
      if (child === undefined || parent === undefined) return [];
      const start = findEdgeEndpoint(child, parent, 2);
      const end = findEdgeEndpoint(parent, child, 6);
      return [
        {
          id: `sub:${child.id}`,
          source: child.id,
          target: parent.id,
          family: "structural",
          d: `M ${settle(start.x)} ${settle(start.y)} L ${settle(end.x)} ${settle(end.y)}`,
        },
      ];
    });
  });

/**
 * Semantic edges: object properties whose domain AND range are drawn
 * classes, each wearing its predicate. Parallel arcs (do/don't) stack
 * their bows; self-references loop. Ids resolve across EVERY ontology's
 * namespace, because a property's range may cross ontologies.
 */
const buildSemanticEdges = (
  ontologies: readonly ClassGraphOntology[],
  nodeById: ReadonlyMap<string, TermFlowNode>,
): TermFlowEdge[] => {
  const allNamespaces: OntologyNamespace[] = ontologies.map(
    ({ prefix, namespace }) => ({ prefix, namespace }),
  );
  const parallelCount = new Map<string, number>();
  return ontologies.flatMap((ontology) =>
    ontology.properties.flatMap((property): TermFlowEdge[] => {
      if (property.kind !== "OBJECT") return [];
      const domainUri = property.domain?.uri;
      if (domainUri === undefined) return [];
      const source = nodeById.get(compactUri(domainUri, allNamespaces));
      const target = nodeById.get(compactUri(property.range, allNamespaces));
      if (source === undefined || target === undefined) return [];
      const pairKey = `${source.id}=>${target.id}`;
      const rank = parallelCount.get(pairKey) ?? 0;
      parallelCount.set(pairKey, rank + 1);
      const arc =
        source === target
          ? buildSelfLoop(source)
          : buildQuadArc(
              findEdgeEndpoint(source, target, 3),
              findEdgeEndpoint(target, source, 7),
              EDGE_BOW * (1 + rank * 0.7),
            );
      return [
        {
          id: `rel:${compactUri(property.uri, allNamespaces)}`,
          source: source.id,
          target: target.id,
          family: "semantic",
          predicate: property.label ?? compactUri(property.uri, allNamespaces),
          d: arc.d,
          labelAt: arc.labelAt,
        },
      ];
    }),
  );
};

/**
 * The canvas size around every node, padded, and the initial zoom that
 * fits it to a typical view, clamped between 0.35 and 1.
 */
const measureCanvas = (
  nodes: readonly TermFlowNode[],
): Pick<ClassGraph, "width" | "height" | "fitScale"> => {
  const width = settle(
    Math.max(...nodes.map((node) => node.x + node.width / 2), 0) +
      CANVAS_PADDING,
  );
  const height = settle(
    Math.max(...nodes.map((node) => node.y + node.height / 2), 0) +
      CANVAS_PADDING,
  );
  const fitScale = settle(
    Math.min(Math.max(FIT_VIEW_WIDTH / Math.max(width, 1), 0.35), 1),
  );
  return { width, height, fitScale };
};

/**
 * Builds the settled multi-ontology graph: clusters laid out at the
 * origin, packed into wrapping rows, then normalised to a padded
 * top-left origin. Node ids are PREFIXED term URIs throughout.
 */
export const buildClassGraph = (
  ontologies: readonly ClassGraphOntology[],
): ClassGraph => {
  const clusters = ontologies
    .filter((ontology) => ontology.classes.length > 0)
    .map((ontology) => measureCluster(ontology, layOutCluster(ontology)));
  const packed = packClusters(clusters);
  const nodes = buildNodes(packed);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = [
    ...buildStructuralEdges(ontologies, nodeById),
    ...buildSemanticEdges(ontologies, nodeById),
  ];
  return {
    nodes,
    edges,
    clusters: buildClusterExtents(packed),
    ...measureCanvas(nodes),
  };
};
