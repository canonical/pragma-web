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
function defineClass(
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
    },
    { uri: "ex:partOf", label: "partOf", domain: "ex:Part", range: "ex:Whole" },
    { uri: "ex:about", label: "about", domain: "ex:Note", range: "ex:Remark" },
    {
      uri: "ex:refines",
      label: "refines",
      domain: "ex:Remark",
      range: "ex:Long",
    },
    { uri: "ex:cites", label: "cites", domain: "ex:Long", range: "ex:Note" },
    {
      uri: "ex:seeAlso",
      label: "seeAlso",
      domain: "ex:Note",
      range: "ex:Note",
    },
    { uri: "ex:links", label: "links", domain: "zz:Leaf", range: "ex:Whole" },
    { uri: "ex:loose", label: "loose", domain: null, range: "ex:Part" },
    {
      uri: "ex:outside",
      label: "outside",
      domain: "ex:Part",
      range: "xsd:string",
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
    { uri: "ex:holds", label: "holds", domain: "ex:Whole", range: "ex:Piece" },
    { uri: "ex:near", label: "near", domain: "ex:Piece", range: "ex:Part" },
    { uri: "ex:echoes", label: "echoes", domain: "ex:Long", range: "ex:Echo" },
    {
      uri: "ex:answers",
      label: "answers",
      domain: "ex:Remark",
      range: "ex:Echo",
    },
    {
      uri: "ex:mentions",
      label: "mentions",
      domain: "ex:Note",
      range: "yy:Solo",
    },
    { uri: "ex:points", label: "points", domain: "yy:Solo", range: "ex:Long" },
    { uri: "ex:pairs", label: "pairs", domain: "zz:Leaf", range: "yy:Other" },
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
  })),
};

/**
 * A chain of seven classes that fits the design canvas only once the
 * channels narrow to 32px.
 */
export const NARROWING_GRAPH: ClassGraphInput = {
  classes: [
    "Alpha",
    "Beta",
    "Gamma",
    "Delta",
    "Epsilon",
    "Zeta Twelve Long",
    "Eta Fifteen Long",
  ].map((label, index) => defineClass(`ex:N${index}`, label)),
  relations: Array.from({ length: 6 }, (_, index) => ({
    uri: `ex:follows${index}`,
    label: `follows${index}`,
    domain: `ex:N${index}`,
    range: `ex:N${index + 1}`,
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
