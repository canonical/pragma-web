/**
 * The provider itself: a schema built from the authored contract, and a tree
 * of plain objects to execute it against.
 *
 * THERE IS NO RESOLVER MAP IN THIS FILE, OR ANYWHERE IN THIS PACKAGE. Two
 * graphql-js behaviours make one unnecessary:
 *
 *   - `defaultFieldResolver` invokes a function-valued property as
 *     `source[field](args, context, info)`, so an argument-taking field is
 *     just a method on the view object.
 *   - `defaultTypeResolver` reads a string `__typename` off the value, so
 *     Node polymorphism needs no `resolveType`.
 *
 * Derived and relational fields are therefore zero-argument arrow functions,
 * and scalars are plain values. Using functions uniformly for derived fields
 * also sidesteps every construction-order cycle in the graph (a station's
 * `_meta.type` is a class, whose `instances` are stations) without lazy
 * getters, which only complicate coverage.
 */

import { buildSchema, isObjectType } from "graphql";
import {
  type ConnectionArgs,
  sliceConnection,
  toCursor,
} from "./connection.js";
import {
  CALL_CLASS_URI,
  CAR_POSITION_CLASS_URI,
  DEFAULT_LANG,
  DIAGRAM_POINT_CLASS_URI,
  FIRST_CALL_POSITION,
  FIRST_CAR_POSITION,
  FIRST_UNIT_POSITION,
  GEO_POINT_CLASS_URI,
  META_CLASS_URI,
  ROUTE_CLASS_URI,
  UNIT_POSITION_CLASS_URI,
} from "./constants.js";
import { exampleDataset } from "./dataset.js";
import { localName, resolveLabel, resolveTitle } from "./descriptive.js";
import { extractReferences } from "./extractReferences.js";
import { isNetworkEntity } from "./isNetworkEntity.js";
import { readProviderSdl } from "./providerSdl.js";
import { rankSearchEntries } from "./rankSearchEntries.js";
import { selectProseLanguage } from "./selectProseLanguage.js";
import { sumMeasures } from "./sumMeasures.js";
import type {
  ExampleCarPlacement,
  ExampleCarType,
  ExampleClass,
  ExampleClassProperty,
  ExampleContext,
  ExampleDataset,
  ExampleDiagramPoint,
  ExampleEntity,
  ExampleFormation,
  ExampleGeoPoint,
  ExampleMeasures,
  ExampleNetworkEntity,
  ExampleOntology,
  ExampleProperty,
  ExampleProvider,
  ExampleRollingStock,
  ExampleRoute,
  ExampleUnit,
  ExampleUnitPlacement,
  LangMap,
  ProseTexts,
  SearchEntry,
} from "./types.js";

/**
 * A view object: scalars, nested views, and zero-argument thunks. The schema
 * is the type system here — graphql-js checks every field against the SDL at
 * execution time, so restating the SDL in TypeScript would buy nothing.
 */
type View = Record<string, unknown>;

/** Arguments of the language-tagged `EntityMeta` fields. */
interface LangArgs {
  readonly lang: string;
}

/** Everything `_meta` needs. `uri` is null for an embeddable. */
interface MetaSource {
  readonly labels?: LangMap;
  readonly comments?: LangMap;
  readonly definitions?: LangMap;
  readonly uri: string | null;
  readonly typename: string;
  readonly cls: ExampleClass;
}

/** Arguments of `Prose.markdown`. */
interface MarkdownArgs {
  readonly lang?: string | null;
}

/** An entity's prose, indexed once when the provider is built. */
interface ProseRecord {
  readonly texts: ProseTexts;
  /** The default language first, then the rest in code-point order. */
  readonly availableLanguages: readonly string[];
  /** Candidate IRIs across every language, in order of first mention. */
  readonly references: readonly string[];
}

/** Arguments of `Query.search`. */
interface SearchArgs extends ConnectionArgs {
  readonly text: string;
}

/** An entity paired with its built view, the entity narrowed to `E`. */
interface EntityRecord<E extends ExampleEntity = ExampleEntity> {
  readonly entity: E;
  readonly view: View;
}

/** One car of a unit whose car type the ABox carries. */
interface ResolvedCarPlacement {
  readonly placement: ExampleCarPlacement;
  readonly carType: EntityRecord<ExampleCarType>;
}

/** One unit of a formation whose unit the ABox carries. */
interface ResolvedUnitPlacement {
  readonly placement: ExampleUnitPlacement;
  readonly unit: EntityRecord<ExampleUnit>;
}

/** The namespace part of an IRI — everything before the local name. */
const namespaceOf = (uri: string): string =>
  uri.slice(0, uri.length - localName(uri).length);

/**
 * Build an executable provider over `dataset`. The dataset is a parameter, not
 * a hard-wired import, so the defensive paths below (a dangling property
 * reference, a class cycle, an entity of an unknown class) are reachable from
 * tests with a purpose-built dataset rather than being untestable dead code.
 *
 * @note Impure: reads the provider SDL from the filesystem on every call.
 */
export const createExampleProvider = (
  dataset: ExampleDataset = exampleDataset,
): ExampleProvider => {
  const sdl = readProviderSdl();
  const schema = buildSchema(sdl);

  /**
   * The field names each object type in this provider's schema declares.
   *
   * Read off the BUILT SCHEMA rather than a hand-kept list, so adding a field
   * to `schema/extension.graphql` is all it takes for that field to become
   * addressable through `_meta.field(name:)`.
   */
  const fieldNamesByType = new Map(
    Object.values(schema.getTypeMap())
      .filter(isObjectType)
      .map((type): [string, ReadonlySet<string>] => [
        type.name,
        new Set(Object.keys(type.getFields())),
      ]),
  );

  /**
   * Does this entity's GraphQL type actually declare a field called `name`?
   *
   * The contract makes `ClassProperty.name` "the field name this property
   * answers to ON THIS CLASS — the exact string `EntityMeta.field(name:)`
   * accepts", and says what to do when a property projects no field at all:
   * return the OWL local name as a LABEL, and accept no such name at
   * `field(name:)`. This dataset has such a case — `metro:note` is declared
   * on the abstract `Stop` and inherited by every station, and no concrete
   * type in the extension SDL exposes a `note` field — so without this the
   * provider fabricated a plausible-but-wrong field name and then honoured it,
   * which is the outcome the contract's fallback clause exists to forbid.
   *
   * PRECONDITION: every `typename` reaching here is an object type this
   * schema declares. The entity typenames are a literal union the extension
   * SDL declares, and the two synthetic ones (`OntologyClass`, `GeoPoint`)
   * are written a few lines below. There is deliberately no "unknown type"
   * arm: an arm no test can reach is dead code rather than defence.
   */
  const projectsField = (typename: string, name: string): boolean =>
    (fieldNamesByType.get(typename) as ReadonlySet<string>).has(name);

  const classByUri = new Map(dataset.classes.map((cls) => [cls.uri, cls]));
  const propertyByUri = new Map(dataset.properties.map((p) => [p.uri, p]));

  // -------------------------------------------------------------------
  // TBox traversal
  // -------------------------------------------------------------------

  /**
   * The compact (curie) form of an IRI: the declared prefix of the longest
   * namespace the IRI starts with, plus the remainder.
   *
   * Longest-match, not first-match, so a namespace that is a prefix of another
   * cannot shadow it. Falls back to the whole IRI when nothing is declared,
   * which keeps the field total.
   *
   * Note this resolves against `dataset.ontologies` — the same prefix/namespace
   * pairs `Query.ontologies` publishes — so a client can derive exactly the
   * same string itself. The compact form is a convenience, never a secret.
   */
  const curieOf = (uri: string): string => {
    const match = dataset.ontologies
      .filter((ontology) => uri.startsWith(ontology.namespace))
      .sort((a, b) => b.namespace.length - a.namespace.length)[0];
    return match === undefined
      ? uri
      : `${match.prefix}:${uri.slice(match.namespace.length)}`;
  };

  const superclassOf = (cls: ExampleClass): ExampleClass | undefined =>
    cls.superclass === undefined ? undefined : classByUri.get(cls.superclass);

  /** The transitive superclass chain, nearest first. `seen` breaks cycles. */
  const ancestorsOf = (
    cls: ExampleClass,
    seen: Set<string> = new Set([cls.uri]),
  ): ExampleClass[] => {
    const parent = superclassOf(cls);
    if (parent === undefined || seen.has(parent.uri)) {
      return [];
    }
    seen.add(parent.uri);
    return [parent, ...ancestorsOf(parent, seen)];
  };

  /**
   * The class's own cardinality declarations followed by every ancestor's,
   * marked `inherited`. Paired with the property IRI so `_meta.field(name:)`
   * has something to match on — see the note on that field below.
   */
  const fieldsOf = (cls: ExampleClass): { uri: string; view: View }[] =>
    [
      ...cls.properties.map((cp) => ({ cp, inherited: false })),
      ...ancestorsOf(cls).flatMap((ancestor) =>
        ancestor.properties.map((cp) => ({ cp, inherited: true })),
      ),
    ].flatMap(({ cp, inherited }) => {
      const property = propertyByUri.get(cp.property);
      return property === undefined
        ? []
        : [
            {
              uri: property.uri,
              view: classPropertyView(cp, property, inherited),
            },
          ];
    });

  // -------------------------------------------------------------------
  // Views
  // -------------------------------------------------------------------

  const nullableClassView = (uri: string | undefined): View | null => {
    const cls = uri === undefined ? undefined : classByUri.get(uri);
    return cls === undefined ? null : classView(cls);
  };

  function propertyView(property: ExampleProperty): View {
    return {
      uri: property.uri,
      label: resolveLabel(property.labels, DEFAULT_LANG),
      definition: resolveLabel(property.definitions, DEFAULT_LANG),
      domain: () => nullableClassView(property.domain),
      range: property.range,
      kind: property.kind,
      functional: property.functional,
      inverse: () => {
        const inverse =
          property.inverse === undefined
            ? undefined
            : propertyByUri.get(property.inverse);
        return inverse === undefined ? null : propertyView(inverse);
      },
      namespace: namespaceOf(property.uri),
    };
  }

  function classPropertyView(
    cp: ExampleClassProperty,
    property: ExampleProperty,
    inherited: boolean,
  ): View {
    return {
      // The key `_meta.field(name:)` accepts — WHEN this property projects a
      // field at all. The contract requires the field but cannot say what a
      // hand-written provider should put in it: for the compiler `name` means
      // "the GraphQL field name I derived", and this provider derives nothing.
      // So it states its own rule — the property IRI's local name — and serves
      // it here so the argument round-trips: read `name` off `_meta.fields`,
      // pass it straight back to `field()`.
      //
      // For a property the schema does not expose the same string is the
      // contract's LABEL fallback instead, and `field()` above declines it.
      // The two readings are deliberately the same characters: the contract
      // asks that the fallback tell a consumer nothing `property.uri` did not
      // already, not that it be visibly different.
      name: localName(property.uri),
      property: () => propertyView(property),
      required: cp.required,
      singular: cp.singular,
      inherited,
    };
  }

  function metaView(source: MetaSource): View {
    return {
      title: (args: LangArgs) =>
        resolveTitle(source.labels, args.lang, source.uri, source.typename),
      label: (args: LangArgs) => resolveLabel(source.labels, args.lang),
      comment: (args: LangArgs) => resolveLabel(source.comments, args.lang),
      definition: (args: LangArgs) =>
        resolveLabel(source.definitions, args.lang),
      // The compact display form of this entity's IRI, and the contract fixes
      // what an embeddable answers: "for a value with no IRI at all (an
      // embedded blank node) — the GraphQL type name". Compacting the CLASS
      // IRI instead reads better in isolation ("this is a geo:GeoPoint") and
      // is the wrong answer: a provider whose job is to demonstrate the
      // contract cannot quietly serve a nicer one. The typename tier is the
      // same tail `title` falls back to, so the two agree.
      curie: () =>
        source.uri === null ? source.typename : curieOf(source.uri),
      type: () => classView(source.cls),
      fields: () => fieldsOf(source.cls).map((field) => field.view),
      // Matches `ClassProperty.name` — but only where that name is a REAL
      // field on this entity's GraphQL type. `fields` publishes an entry for
      // every property the class declares, including ones this provider's
      // schema does not expose (`note`, inherited from `Stop`); for those the
      // published `name` is a label rather than an address, and the contract
      // says plainly that no such name is one `field(name:)` would accept. So
      // the round-trip holds for every PROJECTED field, and an unprojected one
      // answers null rather than handing back metadata for a field a consumer
      // could never select.
      field: (args: { name: string }) =>
        !projectsField(source.typename, args.name)
          ? null
          : (fieldsOf(source.cls).find(
              (field) => localName(field.uri) === args.name,
            )?.view ?? null),
    };
  }

  function classView(cls: ExampleClass): View {
    return {
      __typename: "OntologyClass",
      uri: cls.uri,
      _meta: () =>
        metaView({
          labels: cls.labels,
          comments: cls.comments,
          definitions: cls.definitions,
          uri: cls.uri,
          typename: "OntologyClass",
          // A class is an instance of the metaclass when the dataset declares
          // one, and of itself otherwise: `type` is non-null, so there is no
          // third answer.
          cls: classByUri.get(META_CLASS_URI) ?? cls,
        }),
      label: resolveLabel(cls.labels, DEFAULT_LANG),
      definition: resolveLabel(cls.definitions, DEFAULT_LANG),
      superclass: () => nullableClassView(cls.superclass),
      superclasses: () => ancestorsOf(cls).map(classView),
      subclasses: () =>
        dataset.classes
          .filter((other) => other.superclass === cls.uri)
          .map(classView),
      properties: () => fieldsOf(cls).map((field) => field.view),
      instances: (args: ConnectionArgs) =>
        connectionView(instancesOf(cls), args),
      instanceCount: () => instancesOf(cls).length,
      isAbstract: cls.isAbstract,
      namespace: namespaceOf(cls.uri),
    };
  }

  const geoPointClass = classByUri.get(GEO_POINT_CLASS_URI);

  const geoPointView = (point: ExampleGeoPoint | undefined): View | null =>
    point === undefined || geoPointClass === undefined
      ? null
      : {
          _meta: () =>
            metaView({ uri: null, typename: "GeoPoint", cls: geoPointClass }),
          latitude: point.latitude,
          longitude: point.longitude,
        };

  const diagramPointClass = classByUri.get(DIAGRAM_POINT_CLASS_URI);

  /** A station's place on the schematic, or null when it has none to serve. */
  const buildDiagramPointView = (
    point: ExampleDiagramPoint | undefined,
  ): View | null =>
    point === undefined || diagramPointClass === undefined
      ? null
      : {
          _meta: () =>
            metaView({
              uri: null,
              typename: "DiagramPoint",
              cls: diagramPointClass,
            }),
          x: point.x,
          y: point.y,
        };

  // -------------------------------------------------------------------
  // Routes and calls. Value types like GeoPoint: no IRI, so `_meta.title`
  // reaches the label or the typename and `_meta.curie` is the typename. A
  // value whose class the TBox lacks is not served, for the same reason an
  // entity of an undeclared class is not: `_meta.type` is non-null.
  // -------------------------------------------------------------------

  const routeClass = classByUri.get(ROUTE_CLASS_URI);
  const callClass = classByUri.get(CALL_CLASS_URI);

  /**
   * A route's calls, numbered from FIRST_CALL_POSITION. A call to a stop the
   * ABox does not carry is dropped before numbering, as `servesLine` drops a
   * dangling line, so the positions keep no gap.
   */
  const buildCallViews = (route: ExampleRoute): View[] =>
    callClass === undefined
      ? []
      : route.calls
          .flatMap((uri) => {
            const stop = viewByUri.get(uri);
            return stop === undefined ? [] : [stop];
          })
          .map((stop, index) => ({
            _meta: () =>
              metaView({ uri: null, typename: "Call", cls: callClass }),
            position: FIRST_CALL_POSITION + index,
            stop,
          }));

  /**
   * One route of a line. `siblings` is the line's whole route list, which is
   * where `reverse` looks its partner up by key.
   */
  function buildRouteView(
    siblings: readonly ExampleRoute[],
    route: ExampleRoute,
    cls: ExampleClass,
  ): View {
    return {
      _meta: () =>
        metaView({ labels: route.labels, uri: null, typename: "Route", cls }),
      // The same chain `_meta.title` runs, so the two always agree and the
      // non-null label is total even for a route whose labels are empty.
      label: resolveTitle(route.labels, DEFAULT_LANG, null, "Route"),
      isLoop: route.isLoop,
      calls: () => buildCallViews(route),
      reverse: () => {
        const reverse =
          route.reverse === undefined
            ? undefined
            : siblings.find((other) => other.key === route.reverse);
        return reverse === undefined
          ? null
          : buildRouteView(siblings, reverse, cls);
      },
    };
  }

  // -------------------------------------------------------------------
  // The fleet. A unit's length and capacity are its car types' sums, and a
  // formation's its units', computed here rather than stored, and thunked
  // like every relation: the records they read are indexed after the views
  // are built. A formation's stock and lines are read as the inverses of
  // the stocks' and the lines' `formations`.
  // -------------------------------------------------------------------

  const unitPositionClass = classByUri.get(UNIT_POSITION_CLASS_URI);
  const carPositionClass = classByUri.get(CAR_POSITION_CLASS_URI);

  /** The formation with this IRI, or undefined when none is carried. */
  const findFormationRecord = (
    uri: string,
  ): EntityRecord<ExampleFormation> | undefined => {
    const record = recordByUri.get(uri);
    return record?.entity.typename === "Formation"
      ? { entity: record.entity, view: record.view }
      : undefined;
  };

  /** The unit with this IRI, or undefined when none is carried. */
  const findUnitRecord = (
    uri: string,
  ): EntityRecord<ExampleUnit> | undefined => {
    const record = recordByUri.get(uri);
    return record?.entity.typename === "Unit"
      ? { entity: record.entity, view: record.view }
      : undefined;
  };

  /** The car type with this IRI, or undefined when none is carried. */
  const findCarTypeRecord = (
    uri: string,
  ): EntityRecord<ExampleCarType> | undefined => {
    const record = recordByUri.get(uri);
    return record?.entity.typename === "CarType"
      ? { entity: record.entity, view: record.view }
      : undefined;
  };

  /**
   * A unit's cars paired with their car types. A car whose car type the
   * ABox does not carry is dropped, as a call to a missing stop is, so the
   * positions numbered from these keep no gap.
   */
  const resolveCarPlacements = (unit: ExampleUnit): ResolvedCarPlacement[] =>
    unit.cars.flatMap((placement) => {
      const carType = findCarTypeRecord(placement.carType);
      return carType === undefined ? [] : [{ placement, carType }];
    });

  /** A unit's length and capacity: the sums of its cars' car types. */
  const measureUnit = (unit: ExampleUnit): ExampleMeasures =>
    sumMeasures(
      resolveCarPlacements(unit).map((resolved) => resolved.carType.entity),
    );

  /** A unit's cars, numbered from FIRST_CAR_POSITION at the unit's front. */
  const buildCarPositionViews = (unit: ExampleUnit): View[] =>
    carPositionClass === undefined
      ? []
      : resolveCarPlacements(unit).map((resolved, index) => ({
          _meta: () =>
            metaView({
              uri: null,
              typename: "CarPosition",
              cls: carPositionClass,
            }),
          position: FIRST_CAR_POSITION + index,
          carType: resolved.carType.view,
          reversed: resolved.placement.reversed,
        }));

  /**
   * A formation's units paired with their records. A unit the ABox does not
   * carry is dropped, so the positions numbered from these keep no gap.
   */
  const resolveUnitPlacements = (
    formation: ExampleFormation,
  ): ResolvedUnitPlacement[] =>
    formation.units.flatMap((placement) => {
      const unit = findUnitRecord(placement.unit);
      return unit === undefined ? [] : [{ placement, unit }];
    });

  /** A formation's length and capacity: the sums of its units'. */
  const measureFormation = (formation: ExampleFormation): ExampleMeasures =>
    sumMeasures(
      resolveUnitPlacements(formation).map((resolved) =>
        measureUnit(resolved.unit.entity),
      ),
    );

  /** A formation's units, numbered from FIRST_UNIT_POSITION at its front. */
  const buildUnitPositionViews = (formation: ExampleFormation): View[] =>
    unitPositionClass === undefined
      ? []
      : resolveUnitPlacements(formation).map((resolved, index) => ({
          _meta: () =>
            metaView({
              uri: null,
              typename: "UnitPosition",
              cls: unitPositionClass,
            }),
          position: FIRST_UNIT_POSITION + index,
          unit: resolved.unit.view,
          reversed: resolved.placement.reversed,
        }));

  /** The views of the formations with these IRIs, skipping any not carried. */
  const findFormationViews = (uris: readonly string[]): View[] =>
    uris.flatMap((uri) => {
      const formation = findFormationRecord(uri);
      return formation === undefined ? [] : [formation.view];
    });

  /**
   * The rolling stock that lists the formation, or null when none does. No
   * value is invented: `Formation.stock` is non-null, so graphql-js reports
   * a formation no stock lists as a field error.
   */
  const findStockView = (formationUri: string): View | null =>
    records.find(
      (record) =>
        record.entity.typename === "RollingStock" &&
        record.entity.formations.includes(formationUri),
    )?.view ?? null;

  /** The lines run with the formation, in IRI order. */
  const findLineViews = (formationUri: string): View[] =>
    records
      .filter(
        (record) =>
          record.entity.typename === "Line" &&
          (record.entity.formations ?? []).includes(formationUri),
      )
      .map((record) => record.view);

  const buildRollingStockFields = (stock: ExampleRollingStock): View => ({
    formations: () => findFormationViews(stock.formations),
  });

  const buildFormationFields = (formation: ExampleFormation): View => ({
    stock: () => findStockView(formation.uri),
    units: () => buildUnitPositionViews(formation),
    length: () => measureFormation(formation).length,
    capacity: () => measureFormation(formation).capacity,
    lines: () => findLineViews(formation.uri),
  });

  const buildCarTypeFields = (carType: ExampleCarType): View => ({
    code: carType.code,
    hasCab: carType.hasCab,
    length: carType.length,
    capacity: carType.capacity,
  });

  const buildUnitFields = (unit: ExampleUnit): View => ({
    cars: () => buildCarPositionViews(unit),
    length: () => measureUnit(unit).length,
    capacity: () => measureUnit(unit).capacity,
  });

  /** The fields of a line, a station, an interchange or a fare zone. */
  const buildNetworkFields = (entity: ExampleNetworkEntity): View => ({
    platformCount: entity.platformCount ?? null,
    platformLength: entity.platformLength ?? null,
    // No fallback: the SDL makes both non-null on a Line, so a Line record
    // missing either is an invalid dataset, and graphql-js reports it as a
    // field error rather than this view inventing a value.
    code: entity.code,
    colour: entity.colour,
    routes: () => {
      const routes = entity.routes ?? [];
      return routeClass === undefined
        ? []
        : routes.map((route) => buildRouteView(routes, route, routeClass));
    },
    transferMinutes: entity.transferMinutes ?? null,
    location: () => geoPointView(entity.location),
    diagramPosition: () => buildDiagramPointView(entity.diagramPosition),
    formations: () => findFormationViews(entity.formations ?? []),
    inZone: () =>
      entity.inZone === undefined
        ? null
        : (viewByUri.get(entity.inZone) ?? null),
    servesLine: () =>
      (entity.servesLine ?? []).flatMap((uri) => {
        const line = viewByUri.get(uri);
        return line === undefined ? [] : [line];
      }),
    // The inverse of `servesLine`, over every entity that carries it — which
    // is `Station` AND `Interchange`. The SDL says `[Stop!]!` for exactly that
    // reason: this list is genuinely mixed, and typing it `[Station!]!` served
    // an `Interchange` under the wrong type name. `defaultResolveTypeFn` picks
    // the concrete type off each view's own `__typename`.
    servedBy: () =>
      records
        .filter(
          (record) =>
            isNetworkEntity(record.entity) &&
            (record.entity.servesLine ?? []).includes(entity.uri),
        )
        .map((record) => record.view),
    // The inverse of `inZone`, over every entity that carries it: a fare
    // zone's stops are stations and interchanges alike, so the SDL types
    // the list `[Stop!]!` as it does `servedBy`.
    stops: () =>
      records
        .filter(
          (record) =>
            isNetworkEntity(record.entity) &&
            record.entity.inZone === entity.uri,
        )
        .map((record) => record.view),
  });

  /**
   * The fields particular to the entity's type. Split by type because the
   * same field name can mean different things on different types: a car
   * type stores its `length`, a unit sums its cars', and a line's
   * `formations` are its own while a stock's are its alternatives.
   */
  const buildTypeFields = (entity: ExampleEntity): View => {
    switch (entity.typename) {
      case "RollingStock":
        return buildRollingStockFields(entity);
      case "Formation":
        return buildFormationFields(entity);
      case "CarType":
        return buildCarTypeFields(entity);
      case "Unit":
        return buildUnitFields(entity);
      default:
        return buildNetworkFields(entity);
    }
  };

  /** An entity's view: the fields every Node shares, then its type's own. */
  const buildEntityView = (entity: ExampleEntity, cls: ExampleClass): View => ({
    __typename: entity.typename,
    uri: entity.uri,
    _meta: () =>
      metaView({
        labels: entity.labels,
        comments: entity.comments,
        definitions: entity.definitions,
        uri: entity.uri,
        typename: entity.typename,
        cls,
      }),
    name: resolveLabel(entity.labels, DEFAULT_LANG),
    ...buildTypeFields(entity),
  });

  const ontologyView = (ontology: ExampleOntology): View => ({
    prefix: ontology.prefix,
    namespace: ontology.namespace,
    label: ontology.label ?? null,
    classes: () =>
      dataset.classes
        .filter((cls) => cls.uri.startsWith(ontology.namespace))
        .map(classView),
    properties: () =>
      dataset.properties
        .filter((property) => property.uri.startsWith(ontology.namespace))
        .map(propertyView),
  });

  // -------------------------------------------------------------------
  // ABox index. Entities of an unknown class are dropped: `_meta.type` is
  // non-null, so an entity whose class the TBox does not declare has no
  // conformant representation and must not be served at all.
  // -------------------------------------------------------------------

  const records: EntityRecord[] = [...dataset.entities]
    .sort((a, b) => a.uri.localeCompare(b.uri))
    .flatMap((entity) => {
      const cls = classByUri.get(entity.type);
      return cls === undefined
        ? []
        : [{ entity, view: buildEntityView(entity, cls) }];
    });

  const recordByUri = new Map(
    records.map((record) => [record.entity.uri, record]),
  );

  const viewByUri = new Map(
    records.map((record) => [record.entity.uri, record.view]),
  );

  /** Resolve an IRI as `node(id:)` does: an entity, else a class, else null. */
  const resolveNode = (uri: string): View | null =>
    viewByUri.get(uri) ?? nullableClassView(uri);

  /**
   * Resolve each IRI as `node(id:)` does, and keep the ones that resolve as
   * edges, in the order of `iris`.
   */
  const buildNodeEdges = (iris: readonly string[]): View[] =>
    iris.flatMap((iri) => {
      const node = resolveNode(iri);
      return node === null ? [] : [{ node, cursor: toCursor(iri) }];
    });

  /** Build a `NodeConnection` view over a page's edges and its flags. */
  const buildNodeConnectionView = (
    edges: readonly View[],
    flags: { readonly hasNextPage: boolean; readonly hasPreviousPage: boolean },
  ): View => ({
    edges,
    pageInfo: {
      hasNextPage: flags.hasNextPage,
      hasPreviousPage: flags.hasPreviousPage,
      startCursor: edges.at(0)?.cursor ?? null,
      endCursor: edges.at(-1)?.cursor ?? null,
    },
  });

  /** Instances of a class, including instances of its subclasses. */
  const instancesOf = (cls: ExampleClass): EntityRecord[] =>
    records.filter((record) => {
      const recordClass = classByUri.get(record.entity.type);
      return (
        recordClass !== undefined &&
        (recordClass.uri === cls.uri ||
          ancestorsOf(recordClass).some((ancestor) => ancestor.uri === cls.uri))
      );
    });

  const connectionView = (
    items: readonly EntityRecord[],
    args: ConnectionArgs,
  ): View => {
    const page = sliceConnection(items, (record) => record.entity.uri, args);
    const edges = page.items.map((record) => ({
      node: record.view,
      cursor: toCursor(record.entity.uri),
    }));
    return {
      edges,
      pageInfo: {
        hasNextPage: page.hasNextPage,
        hasPreviousPage: page.hasPreviousPage,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
    };
  };

  // -------------------------------------------------------------------
  // Prose. Indexed once, here, rather than per request: the languages and
  // the references of a text do not change between requests, only which
  // language a request is served.
  // -------------------------------------------------------------------

  /** The declared prefixes, which a CURIE in prose is expanded against. */
  const prefixes = Object.fromEntries(
    dataset.ontologies.map((ontology) => [ontology.prefix, ontology.namespace]),
  );

  /**
   * One entity's prose with its languages ordered and its references
   * extracted. Prose without default-language text is refused: it is what
   * every request falls back to, so a dataset without it cannot be served.
   */
  const indexProse = (uri: string, texts: ProseTexts): ProseRecord => {
    if (!Object.hasOwn(texts, DEFAULT_LANG)) {
      throw new Error(
        `${uri} has prose but none in the default language "${DEFAULT_LANG}"`,
      );
    }
    const availableLanguages = [
      DEFAULT_LANG,
      ...Object.keys(texts)
        .filter((lang) => lang !== DEFAULT_LANG)
        .sort(),
    ];
    return {
      texts,
      availableLanguages,
      references: [
        ...new Set(
          availableLanguages.flatMap((lang) =>
            extractReferences(texts[lang], prefixes),
          ),
        ),
      ],
    };
  };

  const proseByUri = new Map(
    records.flatMap(({ entity }): [string, ProseRecord][] =>
      entity.prose === undefined
        ? []
        : [[entity.uri, indexProse(entity.uri, entity.prose)]],
    ),
  );

  /**
   * Build the page of entities a text links to, each resolved exactly as
   * `node(id:)` resolves an IRI, with every edge on the one page. A
   * reference nothing answers to is dropped.
   */
  const buildReferencesView = (iris: readonly string[]): View =>
    buildNodeConnectionView(buildNodeEdges(iris), {
      hasNextPage: false,
      hasPreviousPage: false,
    });

  /**
   * Build the `Prose` view. The context is read with `?.` because graphql-js
   * hands resolvers whatever context its caller passed, including none.
   */
  const buildProseView = (prose: ProseRecord): View => ({
    markdown: (args: MarkdownArgs, context?: ExampleContext) =>
      prose.texts[
        selectProseLanguage(prose.texts, [
          args.lang ?? undefined,
          context?.locale,
        ])
      ],
    lang: (_args: unknown, context?: ExampleContext) =>
      selectProseLanguage(prose.texts, [context?.locale]),
    availableLanguages: prose.availableLanguages,
    references: () => buildReferencesView(prose.references),
  });

  // -------------------------------------------------------------------
  // Search. The entries are read once, here, from the same records and
  // classes `node(id:)` serves, in the default language `_meta` falls back
  // to; ranking and paging happen per request.
  // -------------------------------------------------------------------

  /** One node's search entry: its title, CURIE and definition. */
  const buildSearchEntry = (
    uri: string,
    labels: LangMap | undefined,
    definitions: LangMap | undefined,
    typename: string,
  ): SearchEntry => ({
    uri,
    title: resolveTitle(labels, DEFAULT_LANG, uri, typename),
    curie: curieOf(uri),
    definition: resolveLabel(definitions, DEFAULT_LANG),
  });

  const searchEntries: readonly SearchEntry[] = [
    ...records.map(({ entity }) =>
      buildSearchEntry(
        entity.uri,
        entity.labels,
        entity.definitions,
        entity.typename,
      ),
    ),
    ...dataset.classes.map((cls) =>
      buildSearchEntry(cls.uri, cls.labels, cls.definitions, "OntologyClass"),
    ),
  ];

  /**
   * Build one page of ranked IRIs as a `NodeConnection`, each node resolved
   * as `node(id:)` resolves it.
   */
  const buildSearchView = (
    uris: readonly string[],
    args: ConnectionArgs,
  ): View => {
    const page = sliceConnection(uris, (uri) => uri, args);
    return buildNodeConnectionView(buildNodeEdges(page.items), page);
  };

  /**
   * Expand the prefixed convenience form (`"metro:Station"`) to an absolute
   * IRI. An absolute IRI passes through untouched: its scheme is never a
   * declared prefix.
   */
  const expandUri = (value: string): string => {
    const colon = value.indexOf(":");
    const ontology = dataset.ontologies.find(
      (candidate) => candidate.prefix === value.slice(0, colon),
    );
    return ontology === undefined
      ? value
      : `${ontology.namespace}${value.slice(colon + 1)}`;
  };

  // -------------------------------------------------------------------
  // The contract's five root fields, plus `prose` and `search`: the two root
  // fields this provider adds (see schema/extension.graphql for why each is
  // a root field). Every type the provider declares is reachable from here.
  // -------------------------------------------------------------------

  const rootValue: Record<string, unknown> = {
    node: (args: { id: string }) => resolveNode(args.id),
    ontologies: () => dataset.ontologies.map(ontologyView),
    ontology: (args: { prefix: string }) => {
      const ontology = dataset.ontologies.find(
        (candidate) => candidate.prefix === args.prefix,
      );
      return ontology === undefined ? null : ontologyView(ontology);
    },
    ontologyClass: (args: { uri: string }) =>
      nullableClassView(expandUri(args.uri)),
    ontologyProperty: (args: { uri: string }) => {
      const property = propertyByUri.get(expandUri(args.uri));
      return property === undefined ? null : propertyView(property);
    },
    prose: (args: { uri: string }) => {
      const prose = proseByUri.get(args.uri);
      return prose === undefined ? null : buildProseView(prose);
    },
    search: (args: SearchArgs) =>
      buildSearchView(rankSearchEntries(searchEntries, args.text), args),
  };

  return { schema, rootValue, sdl };
};
