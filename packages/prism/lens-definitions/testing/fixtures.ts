/**
 * The static data the lens's tests share: the exemplar terms each captured
 * store under `records/` serves, the homes a site mounting the lens would
 * declare, and the timeout of the full-stack suites.
 */

import type { Homes } from "@canonical/prism-core";
import type {
  ClassGraphInput,
  GraphClassInput,
} from "../src/lib/classGraph/types.js";
import ontologyGraph from "./records/ontologyGraph.js";

/** The class exemplar `records/definitionsExplorerRecords` serves. */
export const UIBLOCK_TERM = "ds:UIBlock";

/** The instance-bearing class exemplar
 * `records/definitionsExplorerRecordsComponent` serves. */
export const COMPONENT_TERM = "ds:Component";

/** The property exemplar `records/definitionsExplorerRecordsProperty`
 * serves. */
export const PROPERTY_TERM = "ds:hasSubcomponent";

/**
 * The per-test timeout of the suites that mount the full provider stack and
 * the static router: under heavy parallel load they can overrun vitest's 5s
 * default. Per test only; the config default stands.
 */
export const DEFINITIONS_TEST_TIMEOUT_MS = 20_000;

/**
 * The homes a site mounting the lens would declare for the one type the lens
 * owns a page for: an ontology class lives on its term view, addressed by
 * the compact address the mention resolves it with. Every other type has no
 * home here, so its mentions read as text.
 */
export const HOMES: Homes = {
  OntologyClass: (node, router) =>
    router.buildPath("definitionsTerm", { params: { term: node.uri } }),
};

/** A class of a synthetic class graph: its IRI is `ex:<local>` or `zz:<local>`. */
export function defineClass(
  uri: string,
  label: string,
  options: {
    readonly abstract?: boolean;
    readonly superclass?: string;
    readonly instanceCount?: number;
  } = {},
): GraphClassInput {
  return {
    uri,
    label,
    prefix: uri.split(":").at(0) ?? "",
    abstract: options.abstract ?? false,
    superclass: options.superclass ?? null,
    instanceCount: options.instanceCount ?? 0,
    fields: 0,
  };
}

/**
 * A small two-region class graph that exercises what the real ontology
 * does not: a subclass root whose superclass lies in another region, a
 * relation across regions, a label too long for the widest box, a
 * relation-placed chain, an unstated domain and a range outside the graph.
 */
export const CROSS_REGION_GRAPH: ClassGraphInput = {
  classes: [
    defineClass("ex:Thing", "Thing", { abstract: true }),
    defineClass("ex:Part", "Part", {
      superclass: "ex:Thing",
      instanceCount: 3,
    }),
    defineClass("ex:Whole", "Whole", {
      superclass: "ex:Thing",
      instanceCount: 12,
    }),
    defineClass("ex:Note", "Note"),
    defineClass("ex:Remark", "Remark"),
    defineClass(
      "ex:Long",
      "An Extraordinarily Long Class Name That Wraps Twice Over",
    ),
    defineClass("zz:Root", "Root", { superclass: "ex:Thing" }),
    defineClass("zz:Leaf", "Leaf", { superclass: "zz:Root" }),
  ],
  relations: [
    {
      uri: "ex:hasPart",
      label: "hasPart",
      domain: "ex:Whole",
      range: "ex:Part",
      count: 1010,
    },
    {
      uri: "ex:partOf",
      label: "partOf",
      domain: "ex:Part",
      range: "ex:Whole",
      count: 0,
    },
    {
      uri: "ex:about",
      label: "about",
      domain: "ex:Note",
      range: "ex:Remark",
      count: 12,
    },
    {
      uri: "ex:refines",
      label: "refines",
      domain: "ex:Remark",
      range: "ex:Long",
      count: 150,
    },
    {
      uri: "ex:cites",
      label: "cites",
      domain: "ex:Long",
      range: "ex:Note",
      count: 3,
    },
    {
      uri: "ex:seeAlso",
      label: "seeAlso",
      domain: "ex:Note",
      range: "ex:Note",
      count: 0,
    },
    {
      uri: "ex:links",
      label: "links",
      domain: "zz:Leaf",
      range: "ex:Whole",
      count: 9,
    },
    {
      uri: "ex:loose",
      label: "loose",
      domain: null,
      range: "ex:Part",
      count: 1,
    },
    {
      uri: "ex:outside",
      label: "outside",
      domain: "ex:Part",
      range: "xsd:string",
      count: 1,
    },
  ],
};

/**
 * The small class graph grown into a third region and tangled: roots whose
 * superclass lies in another region on another shelf or on the same one,
 * relations across regions both ways and into a first column, a
 * relation-placed chain whose waypoints cross a column with no subclass
 * tree, and three siblings related pairwise.
 */
export const TANGLED_GRAPH: ClassGraphInput = {
  classes: [
    ...CROSS_REGION_GRAPH.classes,
    defineClass("ex:Piece", "Piece", { superclass: "ex:Thing" }),
    defineClass("ex:Echo", "Echo"),
    defineClass("yy:Solo", "Solo", { superclass: "ex:Remark" }),
    defineClass("yy:Other", "Other", { superclass: "zz:Leaf" }),
  ],
  relations: [
    ...CROSS_REGION_GRAPH.relations,
    {
      uri: "ex:holds",
      label: "holds",
      domain: "ex:Whole",
      range: "ex:Piece",
      count: 1,
    },
    {
      uri: "ex:near",
      label: "near",
      domain: "ex:Piece",
      range: "ex:Part",
      count: 1,
    },
    {
      uri: "ex:echoes",
      label: "echoes",
      domain: "ex:Long",
      range: "ex:Echo",
      count: 1,
    },
    {
      uri: "ex:answers",
      label: "answers",
      domain: "ex:Remark",
      range: "ex:Echo",
      count: 1,
    },
    {
      uri: "ex:mentions",
      label: "mentions",
      domain: "ex:Note",
      range: "yy:Solo",
      count: 1,
    },
    {
      uri: "ex:points",
      label: "points",
      domain: "yy:Solo",
      range: "ex:Long",
      count: 1,
    },
    {
      uri: "ex:pairs",
      label: "pairs",
      domain: "zz:Leaf",
      range: "yy:Other",
      count: 1,
    },
  ],
};

/**
 * A class graph too wide for the design canvas at the 48px channel: one
 * chain of twelve classes, each placed one column right of the last by its
 * relation.
 */
export const WIDE_GRAPH: ClassGraphInput = {
  classes: Array.from({ length: 12 }, (_, index) =>
    defineClass(`ex:C${index}`, `Class Number ${index}`),
  ),
  relations: Array.from({ length: 11 }, (_, index) => ({
    uri: `ex:next${index}`,
    label: `next${index}`,
    domain: `ex:C${index}`,
    range: `ex:C${index + 1}`,
    count: index,
  })),
};

/**
 * A chain of five classes that fits the design canvas at the legible zoom
 * only once the channels narrow to 32px.
 */
export const NARROWING_GRAPH: ClassGraphInput = {
  classes: ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"].map((label, index) =>
    defineClass(`ex:N${index}`, label),
  ),
  relations: Array.from({ length: 4 }, (_, index) => ({
    uri: `ex:follows${index}`,
    label: `follows${index}`,
    domain: `ex:N${index}`,
    range: `ex:N${index + 1}`,
    count: index,
  })),
};

/**
 * Thirty unrelated classes in one column: too tall for the design canvas,
 * which narrower channels cannot help.
 */
export const TALL_GRAPH: ClassGraphInput = {
  classes: Array.from({ length: 30 }, (_, index) =>
    defineClass(`ex:T${index}`, `T${index}`),
  ),
  relations: [],
};

/**
 * Two regions of three unrelated classes each, short enough to share one
 * shelf side by side, and one relation from the left region's first class
 * to the right region's: the range lies to the domain's right.
 */
export const SHELF_PAIR_GRAPH: ClassGraphInput = {
  classes: [
    ...["A0", "A1", "A2"].map((label) => defineClass(`aa:${label}`, label)),
    ...["B0", "B1", "B2"].map((label) => defineClass(`bb:${label}`, label)),
  ],
  relations: [
    {
      uri: "aa:reaches",
      label: "reaches",
      domain: "aa:A0",
      range: "bb:B0",
      count: 1,
    },
  ],
};

/**
 * The two regions of `SHELF_PAIR_GRAPH` side by side, joined by two
 * bridges whose ports cross: the first leaves by the top box for the
 * bottom one, the second, with no statements, by the bottom box for the
 * top one.
 */
export const CROSSED_PAIR_GRAPH: ClassGraphInput = {
  classes: SHELF_PAIR_GRAPH.classes,
  relations: [
    {
      uri: "aa:down",
      label: "down",
      domain: "aa:A0",
      range: "bb:B2",
      count: 1,
    },
    { uri: "aa:up", label: "up", domain: "aa:A2", range: "bb:B0", count: 0 },
  ],
};

/**
 * The two regions of `SHELF_PAIR_GRAPH` side by side, joined by three
 * bridges whose ports cross: the top box to the bottom one and back,
 * and the middle box to the middle one.
 */
export const CROSSED_TRIO_GRAPH: ClassGraphInput = {
  classes: SHELF_PAIR_GRAPH.classes,
  relations: [
    ["0", "2"],
    ["2", "0"],
    ["1", "1"],
  ].map(([from, to]) => ({
    uri: `aa:from${from}`,
    label: `from ${from}`,
    domain: `aa:A${from}`,
    range: `bb:B${to}`,
    count: 1,
  })),
};

/**
 * The two regions of `SHELF_PAIR_GRAPH` side by side, joined by three
 * bridges, box to box across, the middle one with no statements.
 */
export const NEIGHBOUR_TRIO_GRAPH: ClassGraphInput = {
  classes: SHELF_PAIR_GRAPH.classes,
  relations: ["0", "1", "2"].map((index) => ({
    uri: `aa:to${index}`,
    label: `to ${index}`,
    domain: `aa:A${index}`,
    range: `bb:B${index}`,
    count: index === "1" ? 0 : 1,
  })),
};

/**
 * Two regions of one class each, stacked on two shelves at the packing's
 * left margin, and one relation between them: the two boxes overlap across.
 */
export const STACKED_PAIR_GRAPH: ClassGraphInput = {
  classes: [defineClass("aa:A", "A"), defineClass("bb:B", "B")],
  relations: [
    {
      uri: "aa:reaches",
      label: "reaches",
      domain: "aa:A",
      range: "bb:B",
      count: 1,
    },
  ],
};

/**
 * Three regions of three classes each, two of them in a subclass chain,
 * and three bridges: two between the same two regions, one of those with
 * no statements and the other bundling two relations of one name, and one
 * on to the third region.
 */
export const BRIDGE_TRIO_GRAPH: ClassGraphInput = {
  classes: ["aa", "bb", "cc"].flatMap((prefix) =>
    ["0", "1", "2"].map((label) =>
      defineClass(`${prefix}:${label}`, `${prefix} ${label}`, {
        ...(label === "2" ? { superclass: `${prefix}:1` } : {}),
      }),
    ),
  ),
  relations: [
    {
      uri: "aa:holds",
      label: "holds",
      domain: "aa:0",
      range: "bb:0",
      count: 3,
    },
    {
      uri: "bb:holds",
      label: "holds",
      domain: "bb:0",
      range: "aa:0",
      count: 1,
    },
    {
      uri: "aa:lacks",
      label: "lacks",
      domain: "aa:1",
      range: "bb:2",
      count: 0,
    },
    {
      uri: "bb:feeds",
      label: "feeds",
      domain: "bb:1",
      range: "cc:0",
      count: 12,
    },
    {
      uri: "cc:loops",
      label: "loops",
      domain: "cc:0",
      range: "cc:1",
      count: 2,
    },
  ],
};

/**
 * A generated namespace of `size` classes, `<prefix>:C0` to
 * `<prefix>:C<size - 1>`, in one tree: each class below the first a
 * subclass of the one a quarter of its number down.
 */
export function defineRegion(
  prefix: string,
  size: number,
): readonly GraphClassInput[] {
  return Array.from({ length: size }, (_, index) =>
    defineClass(`${prefix}:C${index}`, `${prefix} ${index}`, {
      ...(index === 0
        ? {}
        : { superclass: `${prefix}:C${Math.floor((index - 1) / 4)}` }),
      instanceCount: index,
    }),
  );
}

/**
 * The docs site's four namespaces: the captured design-system, code
 * standards and anatomy classes (35, whose relations reach the stubs
 * `rdf:List` and `dt:TokenSymbol`), and a generated `surface` namespace
 * of 31 classes in the captures' stead, whose relations reach a `ds`
 * class and a third external class.
 */
export const FOUR_NAMESPACE_GRAPH: ClassGraphInput = {
  classes: [...ontologyGraph.classes, ...defineRegion("surface", 31)],
  relations: [
    ...ontologyGraph.relations,
    {
      uri: "surface:shows",
      label: "shows",
      domain: "surface:C0",
      range: "https://ds.canonical.com/UIBlock",
      count: 4,
    },
    {
      uri: "surface:lists",
      label: "lists",
      domain: "surface:C1",
      range: "https://example.org/vocab/Shelf",
      count: 0,
    },
  ],
};

/** One generated namespace of 60 classes: more than a budget draws. */
export const SIXTY_CLASS_GRAPH: ClassGraphInput = {
  classes: defineRegion("big", 60),
  relations: [],
};
