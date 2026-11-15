import {
  HEAVY_HEAD_SIZES,
  STROKE_MIN_WIDTH,
  STROKE_STEPS,
} from "../../../../classGraph/constants.js";
import type { SpecimenStroke, Specimen, StrokeSpecimen } from "./types.js";

/**
 * The legend's rows, in order: a concrete class with its count, an
 * abstract class, a hub, a subclass bus, a relation, a bundle of an
 * opposite pair, and a self-loop. Each is laid out and drawn by the same
 * code as the graph, so the legend cannot drift from it. The specimens
 * are named for their role and carry small counts, never a class of any
 * one site's ontology, so the legend reads the same over every graph.
 */
export const SPECIMENS: readonly Specimen[] = [
  {
    meaning: "legend.concrete",
    classes: [
      {
        key: "concrete",
        label: "legend.specimen.concrete",
        instanceCount: 12,
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
      { key: "domain", label: "legend.specimen.domain", instanceCount: 6 },
      { key: "range", label: "legend.specimen.range", instanceCount: 3 },
    ],
    relations: [
      { label: "legend.specimen.predicate", domain: "domain", range: "range" },
    ],
  },
  {
    meaning: "legend.bundle",
    classes: [
      { key: "family", label: "legend.specimen.family", instanceCount: 5 },
      { key: "member", label: "legend.specimen.member", instanceCount: 9 },
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
        instanceCount: 7,
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

/**
 * The weight steps, lightest first, each with the counts it stands for,
 * read from the canvas's own steps: the lightest from 1, each up to the
 * count below the next step's, the heaviest with no end.
 */
const WEIGHT_STROKES: readonly SpecimenStroke[] = [
  { width: STROKE_MIN_WIDTH, from: 1 },
  ...STROKE_STEPS.toReversed(),
].map(({ width, from }, index, steps) => {
  const next = steps.at(index + 1);
  return {
    stroke: { width, dashed: false },
    bounds: next === undefined ? { from } : { from, to: next.from - 1 },
  };
});

/**
 * The legend's rows on a relation's stroke, after the graph's: its weight
 * in the four steps the canvas draws (by decade of its statements), and a
 * relation with no statements yet. Each states its stroke, never a count:
 * no store stands behind a specimen.
 */
export const STROKE_SPECIMENS: readonly StrokeSpecimen[] = [
  { meaning: "legend.weight", strokes: WEIGHT_STROKES },
  {
    meaning: "legend.zero",
    strokes: [{ stroke: { width: STROKE_MIN_WIDTH, dashed: true } }],
  },
];

/** A stroke specimen's line, from its start to its head's tip, in px. */
export const STROKE_SPECIMEN_LENGTH = 48;

/**
 * How far a stroke specimen reaches above and below its line, in px: half
 * the largest head, so every step's drawing is as tall and the rows align.
 */
export const STROKE_SPECIMEN_REACH =
  Math.max(...Object.values(HEAVY_HEAD_SIZES)) / 2;
