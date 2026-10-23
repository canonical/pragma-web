import type { MessageKey } from "../../../../i18n/index.js";

/** One specimen class: a key, its label's message, and its facets. */
interface SpecimenClass {
  readonly key: string;
  readonly label: MessageKey;
  readonly abstract?: boolean;
  readonly superclass?: string;
  readonly instanceCount?: number;
}

/** One specimen relation: its predicate's message, domain and range keys. */
interface SpecimenRelation {
  readonly label: MessageKey;
  readonly domain: string;
  readonly range: string;
}

/** One row of the legend: a tiny graph drawn by the graph's own code. */
export interface Specimen {
  /** The legend row's meaning, from the catalog. */
  readonly meaning: MessageKey;
  readonly classes: readonly SpecimenClass[];
  readonly relations: readonly SpecimenRelation[];
  /** The one class to draw, alone, when the rest only make it what it is. */
  readonly only?: string;
}

/**
 * The legend's rows, in order: a concrete class with its count, an
 * abstract class, a hub, a subclass bus, a relation, a bundle of an
 * opposite pair, and a self-loop. Each is laid out and drawn by the same
 * code as the graph, so the legend cannot drift from it.
 */
export const SPECIMENS: readonly Specimen[] = [
  {
    meaning: "legend.concrete",
    classes: [
      {
        key: "concrete",
        label: "legend.specimen.concrete",
        instanceCount: 139,
      },
    ],
    relations: [],
  },
  {
    meaning: "legend.abstract",
    classes: [
      { key: "abstract", label: "legend.specimen.abstract", abstract: true },
    ],
    relations: [],
  },
  {
    meaning: "legend.hub",
    classes: [
      { key: "hub", label: "legend.specimen.hub", abstract: true },
      { key: "a", label: "legend.specimen.subclass", superclass: "hub" },
      { key: "b", label: "legend.specimen.subclass", superclass: "hub" },
      { key: "c", label: "legend.specimen.subclass", superclass: "hub" },
      { key: "d", label: "legend.specimen.subclass", superclass: "hub" },
    ],
    relations: [],
    only: "hub",
  },
  {
    meaning: "legend.subclass",
    classes: [
      { key: "super", label: "legend.specimen.superclass", abstract: true },
      {
        key: "first",
        label: "legend.specimen.subclass",
        superclass: "super",
        instanceCount: 12,
      },
      {
        key: "second",
        label: "legend.specimen.subclass",
        superclass: "super",
        instanceCount: 4,
      },
    ],
    relations: [],
  },
  {
    meaning: "legend.relation",
    classes: [
      { key: "domain", label: "legend.specimen.domain", instanceCount: 44 },
      { key: "range", label: "legend.specimen.range", instanceCount: 8 },
    ],
    relations: [
      { label: "legend.specimen.predicate", domain: "domain", range: "range" },
    ],
  },
  {
    meaning: "legend.bundle",
    classes: [
      { key: "family", label: "legend.specimen.family", instanceCount: 11 },
      { key: "member", label: "legend.specimen.member", instanceCount: 33 },
    ],
    relations: [
      { label: "legend.specimen.has", domain: "family", range: "member" },
      { label: "legend.specimen.of", domain: "member", range: "family" },
    ],
  },
  {
    meaning: "legend.loop",
    classes: [
      {
        key: "standard",
        label: "legend.specimen.standard",
        instanceCount: 147,
      },
    ],
    relations: [
      {
        label: "legend.specimen.extends",
        domain: "standard",
        range: "standard",
      },
    ],
  },
];

/** The prefix a specimen's classes are drawn under. */
export const SPECIMEN_PREFIX = "legend";

/** The margin a specimen's drawing keeps around it, in px. */
export const SPECIMEN_MARGIN = 4;
