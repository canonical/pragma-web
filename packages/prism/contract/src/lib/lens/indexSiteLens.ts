import { UNTAGGED } from "./constants.js";
import { listAncestorLevels } from "./listAncestorLevels.js";
import type {
  LangLiterals,
  LensClass,
  LensField,
  LensProperty,
  ResolvedFieldLens,
  SiteLens,
  SiteLensIndex,
  TBoxOutline,
} from "./types.js";

/** The facts of a field that inherit, each on its own. */
type FieldFact = "group" | "order" | "role" | "visibility";

/**
 * Index entries by IRI, throwing on a second entry for the same IRI: a site
 * lens is hand-written data, so a duplicate is a programmer error.
 */
const indexByIri = <T>(
  entries: readonly T[],
  readIri: (entry: T) => string,
  kind: string,
): ReadonlyMap<string, T> => {
  const index = new Map<string, T>();
  for (const entry of entries) {
    const iri = readIri(entry);
    if (index.has(iri)) {
      throw new Error(`The site lens declares the ${kind} ${iri} twice.`);
    }
    index.set(iri, entry);
  }
  return index;
};

/**
 * The value declared at the nearest level that declares one. Equal values at
 * that level resolve; different ones resolve to undefined, and a farther
 * level never fills that gap.
 */
const findNearestValue = <T>(
  levels: readonly (readonly string[])[],
  read: (classUri: string) => T | undefined,
): T | undefined => {
  for (const level of levels) {
    const values = new Set(
      level.map(read).filter((value) => value !== undefined),
    );
    if (values.size > 0) {
      return values.size === 1 ? [...values].at(0) : undefined;
    }
  }
  return undefined;
};

/**
 * Own literals, completed by a fallback's for each language the own ones do
 * not answer: so `selectLiteral` on the result answers what it answers on the
 * own literals, else what it answers on the fallback's.
 */
const completeLiterals = (
  own: LangLiterals,
  fallback: LangLiterals,
): LangLiterals => {
  if (own[UNTAGGED] !== undefined) {
    return own;
  }
  const ownTags = new Set(Object.keys(own).map((tag) => tag.toLowerCase()));
  const missing = Object.entries(fallback).filter(
    ([tag]) => !ownTags.has(tag.toLowerCase()),
  );
  return { ...Object.fromEntries(missing), ...own };
};

/**
 * Resolve a site lens against a provider's TBox outline, by the rules the
 * Turtle lens follows:
 *
 * - a class's `visibility` and `glyph` are its own, else the nearest level of
 *   ancestors that declares one, where disagreeing values resolve to null;
 * - a field's `group`, `order`, `role` and `visibility` resolve fact by fact
 *   the same way through the lens shapes of the class and its ancestors, and
 *   `visibility` then falls back to the property's own;
 * - plural and inverse labels are never inherited;
 * - a property's inverse labels, inverse plural labels and inverse visibility
 *   fall back to its declared inverse partner's asserted labels, plural labels
 *   and visibility, fact by fact and, for labels, language by language.
 *
 * @param lens - The site's lens.
 * @param outline - The provider's class hierarchy, inverse pairs and labels.
 * @returns The index answering each class, field and property lens.
 * @throws When the lens declares a group, class or property twice, a class
 *   declares a field twice, or a field names a group the lens does not declare.
 */
export function indexSiteLens(
  lens: SiteLens,
  outline: TBoxOutline,
): SiteLensIndex {
  const groups = indexByIri(lens.groups, (group) => group.uri, "group");
  const declaredClasses = indexByIri(lens.classes, (c) => c.uri, "class");
  const declaredProperties = indexByIri(
    lens.properties,
    (property) => property.uri,
    "property",
  );
  const parents = new Map(outline.classes.map((c) => [c.uri, c.parents]));
  const outlineProperties = new Map(outline.properties.map((p) => [p.uri, p]));

  const unknownIris = new Set<string>();
  const keepKnown = <T>(
    entries: ReadonlyMap<string, T>,
    known: ReadonlyMap<string, unknown>,
  ): ReadonlyMap<string, T> =>
    new Map(
      [...entries].filter(([iri]) => {
        if (!known.has(iri)) {
          unknownIris.add(iri);
        }
        return known.has(iri);
      }),
    );

  const classes: ReadonlyMap<string, LensClass> = keepKnown(
    declaredClasses,
    parents,
  );
  const properties: ReadonlyMap<string, LensProperty> = keepKnown(
    declaredProperties,
    outlineProperties,
  );
  const fields = new Map<string, ReadonlyMap<string, LensField>>();
  for (const lensClass of declaredClasses.values()) {
    const byProperty = indexByIri(
      lensClass.fields ?? [],
      (field) => field.property,
      `field of ${lensClass.uri} on the property`,
    );
    for (const field of byProperty.values()) {
      if (field.group !== undefined && !groups.has(field.group)) {
        throw new Error(
          `The site lens puts ${field.property} on ${lensClass.uri} in the undeclared group ${field.group}.`,
        );
      }
    }
    fields.set(lensClass.uri, keepKnown(byProperty, outlineProperties));
  }

  const listLineage = (classUri: string): readonly (readonly string[])[] => [
    [classUri],
    ...listAncestorLevels(classUri, parents),
  ];

  const findFieldFact = <K extends FieldFact>(
    classUri: string,
    propertyUri: string,
    fact: K,
  ): LensField[K] | undefined =>
    findNearestValue(listLineage(classUri), (uri) =>
      classes.has(uri) ? fields.get(uri)?.get(propertyUri)?.[fact] : undefined,
    );

  return {
    classLens: (classUri) => {
      const lineage = listLineage(classUri);
      return {
        visibility:
          findNearestValue(lineage, (uri) => classes.get(uri)?.visibility) ??
          null,
        glyph:
          findNearestValue(lineage, (uri) => classes.get(uri)?.glyph) ?? null,
        pluralLabels: classes.get(classUri)?.pluralLabels ?? {},
      };
    },
    fieldLens: (classUri, propertyUri): ResolvedFieldLens => {
      const group = findFieldFact(classUri, propertyUri, "group");
      return {
        group: (group === undefined ? undefined : groups.get(group)) ?? null,
        order: findFieldFact(classUri, propertyUri, "order") ?? null,
        role: findFieldFact(classUri, propertyUri, "role") ?? null,
        visibility:
          findFieldFact(classUri, propertyUri, "visibility") ??
          properties.get(propertyUri)?.visibility ??
          null,
      };
    },
    propertyLens: (propertyUri) => {
      const own = properties.get(propertyUri);
      const partnerUri = outlineProperties.get(propertyUri)?.inverse;
      const partner =
        partnerUri === undefined
          ? undefined
          : outlineProperties.get(partnerUri);
      const partnerLens =
        partnerUri === undefined ? undefined : properties.get(partnerUri);
      return {
        visibility: own?.visibility ?? null,
        pluralLabels: own?.pluralLabels ?? {},
        inverseLabels: completeLiterals(
          own?.inverseLabels ?? {},
          partner?.labels ?? {},
        ),
        inversePluralLabels: completeLiterals(
          own?.inversePluralLabels ?? {},
          partnerLens?.pluralLabels ?? {},
        ),
        inverseVisibility:
          own?.inverseVisibility ?? partnerLens?.visibility ?? null,
      };
    },
    unknownIris: [...unknownIris].sort(),
  };
}
