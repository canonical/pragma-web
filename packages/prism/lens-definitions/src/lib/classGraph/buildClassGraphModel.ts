import {
  BOX_HEIGHT,
  BOX_INSET,
  BOX_MAX_WIDTH,
  BOX_MIN_WIDTH,
  HUB_CAP,
  HUB_HEIGHT,
  HUB_LABEL_SIZE,
  HUB_LOOP_EXTENT,
  HUB_MIN_DEGREE,
  LABEL_SIZE,
  LATTICE,
  LOOP_EXTENT,
  WRAPPED_HEIGHT,
} from "./constants.js";
import { ceilTo, compareText, measureTextWidth, orderBy } from "./geometry.js";
import { requireEntry } from "./require.js";
import type {
  Bundle,
  ClassGraphInput,
  ClassGraphModel,
  ClassModel,
  DrawnRelation,
  FontFace,
  GraphClassInput,
  GraphRelationInput,
  RegionJoin,
} from "./types.js";

/** A class's box and label, before the layout places it. */
type BoxGeometry = Pick<
  ClassModel,
  "size" | "face" | "count" | "lines" | "w" | "h"
>;

/**
 * Size a class's box from its label: 14px bold (16px on a hub, italic when
 * abstract) flush left at an 8px inset, then the instance count, when there
 * is one, before the right inset; the width rounded up to the lattice and
 * kept between 96 and 208px. A label too long for the widest box wraps to
 * two lines, the second ellipsised.
 */
function sizeBox(klass: GraphClassInput, hub: boolean): BoxGeometry {
  const size = hub ? HUB_LABEL_SIZE : LABEL_SIZE;
  const face: FontFace = klass.abstract ? "boldItalic" : "bold";
  const count =
    !klass.abstract && klass.instanceCount > 0
      ? String(klass.instanceCount)
      : null;
  const countWidth =
    count === null ? 0 : measureTextWidth(count, "regular", LABEL_SIZE, true);
  const extra = count === null ? 0 : BOX_INSET + countWidth;
  const raw =
    BOX_INSET + measureTextWidth(klass.label, face, size) + extra + BOX_INSET;
  if (raw <= BOX_MAX_WIDTH) {
    return {
      size,
      face,
      count,
      lines: [klass.label],
      w: Math.min(BOX_MAX_WIDTH, Math.max(BOX_MIN_WIDTH, ceilTo(raw, LATTICE))),
      h: hub ? HUB_HEIGHT : BOX_HEIGHT,
    };
  }
  const room = BOX_MAX_WIDTH - 2 * BOX_INSET - extra;
  const words = klass.label.split(" ");
  let first = "";
  while (
    words.length > 0 &&
    measureTextWidth(`${first} ${words.at(0)}`.trim(), face, size) <= room
  ) {
    first = `${first} ${words.shift()}`.trim();
  }
  let second = words.join(" ");
  while (second !== "" && measureTextWidth(second, face, size) > room) {
    second = `${second.slice(0, -2)}…`;
  }
  return {
    size,
    face,
    count,
    lines: [first, second],
    w: BOX_MAX_WIDTH,
    h: WRAPPED_HEIGHT,
  };
}

/**
 * Bundle the drawn relations by unordered pair: one bundle per pair, its
 * relations by label, its arrowheads at the ends that are some relation's
 * range.
 */
function bundleRelations(
  relations: readonly DrawnRelation[],
  prefixOf: (uri: string) => string,
): Bundle[] {
  const groups = new Map<
    string,
    { a: string; b: string; relations: DrawnRelation[] }
  >();
  for (const relation of relations) {
    const { domain, range } = relation;
    const [a, b] =
      compareText(domain, range) <= 0 ? [domain, range] : [range, domain];
    const id = `${a} ${b}`;
    const group = groups.get(id) ?? { a, b, relations: [] };
    group.relations.push(relation);
    groups.set(id, group);
  }
  return [...groups.entries()]
    .sort(([x], [y]) => compareText(x, y))
    .map(([id, { a, b, relations: bundled }]) => {
      const sorted = [...bundled].sort((x, y) =>
        orderBy(compareText(x.label, y.label), compareText(x.uri, y.uri)),
      );
      return {
        id,
        a,
        b,
        self: a === b,
        relations: sorted,
        heads: new Set(sorted.map((relation) => relation.range)),
        cross: prefixOf(a) !== prefixOf(b),
        opposite:
          a !== b &&
          sorted.some((relation) => relation.domain === a) &&
          sorted.some((relation) => relation.domain === b),
      };
    });
}

/**
 * Build the class graph's model from its input: the classes by IRI, the
 * subclass hierarchy split into in-region parents and cross-region joins,
 * the drawn relations (both ends drawn) bundled by pair, the hubs (four or
 * more incident edges after bundling, at most six, the subclass roots
 * always) and the regions, largest first.
 *
 * @returns The model the layout places.
 */
export default function buildClassGraphModel(
  input: ClassGraphInput,
): ClassGraphModel {
  const classes = [...input.classes].sort((a, b) => compareText(a.uri, b.uri));
  const inputs = new Map(classes.map((klass) => [klass.uri, klass]));
  const prefixOf = (uri: string): string => requireEntry(inputs, uri).prefix;

  const parent = new Map<string, string>();
  const crossParent = new Map<string, string>();
  const children = new Map<string, string[]>();
  for (const klass of classes) {
    const superclass = klass.superclass;
    if (superclass === null || !inputs.has(superclass)) continue;
    if (prefixOf(superclass) === klass.prefix) {
      parent.set(klass.uri, superclass);
      children.set(superclass, [
        ...(children.get(superclass) ?? []),
        klass.uri,
      ]);
    } else {
      crossParent.set(klass.uri, superclass);
    }
  }

  const isDrawn = (relation: GraphRelationInput): relation is DrawnRelation =>
    relation.domain !== null &&
    relation.range !== null &&
    inputs.has(relation.domain) &&
    inputs.has(relation.range);
  const drawnRelations = input.relations
    .filter(isDrawn)
    .sort((a, b) => compareText(a.uri, b.uri));
  const bundles = bundleRelations(drawnRelations, prefixOf);

  const joinMap = new Map<string, RegionJoin>();
  for (const [uri, superclass] of crossParent) {
    const prefix = prefixOf(uri);
    const key = `${prefix} ${superclass}`;
    const join = joinMap.get(key);
    joinMap.set(key, {
      id: `join:${key}`,
      prefix,
      target: superclass,
      roots: [...(join?.roots ?? []), uri],
    });
  }
  const joins = [...joinMap.values()];

  const degree = new Map(classes.map((klass) => [klass.uri, 0]));
  const count = (uri: string): void => {
    degree.set(uri, requireEntry(degree, uri) + 1);
  };
  for (const [uri, superclass] of parent) {
    count(uri);
    count(superclass);
  }
  for (const join of joins) {
    count(join.target);
    join.roots.forEach(count);
  }
  for (const bundle of bundles) {
    count(bundle.a);
    if (!bundle.self) count(bundle.b);
  }

  const roots = classes
    .filter((klass) => !parent.has(klass.uri) && children.has(klass.uri))
    .map((klass) => klass.uri);
  let hubs = classes
    .filter((klass) => requireEntry(degree, klass.uri) >= HUB_MIN_DEGREE)
    .sort((a, b) =>
      orderBy(
        requireEntry(degree, b.uri) - requireEntry(degree, a.uri),
        compareText(a.uri, b.uri),
      ),
    )
    .map((klass) => klass.uri)
    .slice(0, HUB_CAP);
  for (const root of roots) {
    if (!hubs.includes(root)) hubs = [...hubs.slice(0, HUB_CAP - 1), root];
  }

  const byId = new Map<string, ClassModel>(
    classes.map((klass) => {
      const hub = hubs.includes(klass.uri);
      const loop = bundles.some(
        (bundle) => bundle.self && bundle.a === klass.uri,
      );
      return [
        klass.uri,
        {
          ...klass,
          ...sizeBox(klass, hub),
          hub,
          degree: requireEntry(degree, klass.uri),
          loop,
          loopExtent: loop ? (hub ? HUB_LOOP_EXTENT : LOOP_EXTENT) : 0,
          relationCount: input.relations.filter(
            (relation) =>
              relation.domain === klass.uri || relation.range === klass.uri,
          ).length,
          subclassCount: (children.get(klass.uri) ?? []).length,
        },
      ];
    }),
  );

  const regionOrder = [...new Set(classes.map((klass) => klass.prefix))]
    .map((prefix) => ({
      prefix,
      ids: classes
        .filter((klass) => klass.prefix === prefix)
        .map((klass) => klass.uri),
    }))
    .sort((a, b) =>
      orderBy(b.ids.length - a.ids.length, compareText(a.prefix, b.prefix)),
    );

  return {
    byId,
    parent,
    crossParent,
    children,
    bundles,
    joins,
    regionOrder,
    drawnRelations,
  };
}
