/**
 * The data file. A small fictional metro network — a TBox and an ABox.
 *
 * WHY A METRO NETWORK. This provider exists to show that the contract is
 * implementable by someone who has never heard of pragma, so its subject
 * matter must share no vocabulary with pragma's own graph (design systems,
 * components, code standards, jobs, personas, surfaces, layouts). A transit
 * network shares none. Biology and taxonomy were deliberately avoided: a
 * domain with its own taxonomic ranks blurs the line between the subject's
 * hierarchy and RDFS subclassing, and this file needs that line sharp.
 *
 * EVERYTHING HERE IS INERT. No functions, no getters, no computation — records
 * and nothing else. All view construction lives in createExampleProvider.ts,
 * which is what makes "a provider is some code and a data file" literally
 * true rather than a figure of speech.
 */

import {
  CALL_CLASS_URI,
  CAR_POSITION_CLASS_URI,
  DIAGRAM_POINT_CLASS_URI,
  GEO_NAMESPACE,
  GEO_PREFIX,
  META_CLASS_URI,
  METRO_NAMESPACE,
  METRO_PREFIX,
  RDFS_NAMESPACE,
  RDFS_PREFIX,
  ROUTE_CLASS_URI,
  UNIT_POSITION_CLASS_URI,
} from "./constants.js";
import type { ExampleDataset } from "./types.js";

const STOP = `${METRO_NAMESPACE}Stop`;
const STATION = `${METRO_NAMESPACE}Station`;
const INTERCHANGE = `${METRO_NAMESPACE}Interchange`;
const LINE = `${METRO_NAMESPACE}Line`;
const GEO_POINT = `${GEO_NAMESPACE}GeoPoint`;
const ZONE = `${GEO_NAMESPACE}Zone`;
const ROLLING_STOCK = `${METRO_NAMESPACE}RollingStock`;
const FORMATION = `${METRO_NAMESPACE}Formation`;
const UNIT = `${METRO_NAMESPACE}Unit`;
const CAR_TYPE = `${METRO_NAMESPACE}CarType`;

const NAME = `${METRO_NAMESPACE}name`;
const NOTE = `${METRO_NAMESPACE}note`;
const PLATFORM_COUNT = `${METRO_NAMESPACE}platformCount`;
const PLATFORM_LENGTH = `${METRO_NAMESPACE}platformLength`;
const SERVES_LINE = `${METRO_NAMESPACE}servesLine`;
const SERVED_BY = `${METRO_NAMESPACE}servedBy`;
const TRANSFER_MINUTES = `${METRO_NAMESPACE}transferMinutes`;
const LOCATION = `${GEO_NAMESPACE}location`;
const LATITUDE = `${GEO_NAMESPACE}latitude`;
const LONGITUDE = `${GEO_NAMESPACE}longitude`;
const IN_ZONE = `${GEO_NAMESPACE}inZone`;
const LABEL = `${RDFS_NAMESPACE}label`;
const CODE = `${METRO_NAMESPACE}code`;
const COLOUR = `${METRO_NAMESPACE}colour`;
const ROUTES = `${METRO_NAMESPACE}routes`;
const IS_LOOP = `${METRO_NAMESPACE}isLoop`;
const CALLS = `${METRO_NAMESPACE}calls`;
const REVERSE = `${METRO_NAMESPACE}reverse`;
const POSITION = `${METRO_NAMESPACE}position`;
const CALL_STOP = `${METRO_NAMESPACE}stop`;
const DIAGRAM_POSITION = `${METRO_NAMESPACE}diagramPosition`;
const X = `${METRO_NAMESPACE}x`;
const Y = `${METRO_NAMESPACE}y`;
const LENGTH = `${METRO_NAMESPACE}length`;
const CAPACITY = `${METRO_NAMESPACE}capacity`;
const REVERSED = `${METRO_NAMESPACE}reversed`;
const CARS = `${METRO_NAMESPACE}cars`;
const HAS_CAB = `${METRO_NAMESPACE}hasCab`;
const CAR_TYPE_PROPERTY = `${METRO_NAMESPACE}carType`;
const FORMATIONS = `${METRO_NAMESPACE}formations`;
const STOCK = `${METRO_NAMESPACE}stock`;
const UNITS = `${METRO_NAMESPACE}units`;
const LINES = `${METRO_NAMESPACE}lines`;
const UNIT_PROPERTY = `${METRO_NAMESPACE}unit`;

/** IRI of the entity carrying no descriptive predicates whatsoever. */
export const BARE_ENTITY_URI = `${METRO_NAMESPACE}ghost`;

/** IRI of the station carrying labels in more than one language. */
export const MULTILINGUAL_ENTITY_URI = `${METRO_NAMESPACE}northgate`;

/** IRI of an entity in the SECOND namespace — the curie prefix must differ. */
export const SECOND_NAMESPACE_ENTITY_URI = `${GEO_NAMESPACE}central-zone`;

export const exampleDataset: ExampleDataset = {
  ontologies: [
    {
      prefix: METRO_PREFIX,
      namespace: METRO_NAMESPACE,
      label: "Metro Network Ontology",
    },
    // No label: Ontology.label is nullable, and something has to prove it.
    { prefix: GEO_PREFIX, namespace: GEO_NAMESPACE },
    { prefix: RDFS_PREFIX, namespace: RDFS_NAMESPACE, label: "RDF Schema" },
  ],

  // ---------------------------------------------------------------------
  // TBox. Three levels of metro hierarchy (Stop -> Station -> Interchange)
  // so `superclasses` has something transitive to be transitive about, plus
  // two further roots so `superclass: null` is exercised.
  // ---------------------------------------------------------------------
  classes: [
    {
      uri: STOP,
      labels: { "": "Stop" },
      definitions: { "": "Any place a service calls at." },
      comments: { "": "Abstract: instantiate Station or a subclass instead." },
      isAbstract: true,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: NOTE, required: false, singular: true },
      ],
    },
    {
      uri: STATION,
      labels: { "": "Station", fr: "Gare" },
      definitions: { "": "A staffed stop with platforms." },
      superclass: STOP,
      isAbstract: false,
      properties: [
        { property: PLATFORM_COUNT, required: false, singular: true },
        { property: PLATFORM_LENGTH, required: false, singular: true },
        { property: SERVES_LINE, required: true, singular: false },
        { property: LOCATION, required: false, singular: true },
        { property: IN_ZONE, required: false, singular: true },
        { property: DIAGRAM_POSITION, required: false, singular: true },
      ],
    },
    {
      uri: INTERCHANGE,
      labels: { "": "Interchange" },
      definitions: {
        "": "A station where lines serving different stops meet, so passengers change there.",
      },
      superclass: STATION,
      isAbstract: false,
      properties: [
        { property: TRANSFER_MINUTES, required: false, singular: true },
      ],
    },
    {
      uri: LINE,
      labels: { "": "Line" },
      definitions: { "": "A named service over one or more routes." },
      isAbstract: false,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: SERVED_BY, required: false, singular: false },
        { property: CODE, required: true, singular: true },
        { property: COLOUR, required: true, singular: true },
        { property: ROUTES, required: true, singular: false },
        { property: FORMATIONS, required: true, singular: false },
      ],
    },
    {
      // A value class, like geo:GeoPoint: routes have no IRI and no
      // instances of their own, and are reached only through their line.
      uri: ROUTE_CLASS_URI,
      labels: { "": "Route" },
      definitions: {
        "": "One direction of a line's service: the stops it calls at, in order.",
      },
      isAbstract: false,
      properties: [
        { property: LABEL, required: true, singular: true },
        { property: IS_LOOP, required: true, singular: true },
        { property: CALLS, required: true, singular: false },
        { property: REVERSE, required: false, singular: true },
      ],
    },
    {
      uri: CALL_CLASS_URI,
      labels: { "": "Call" },
      definitions: { "": "One stop on a route, at its place in the order." },
      isAbstract: false,
      properties: [
        { property: POSITION, required: true, singular: true },
        { property: CALL_STOP, required: true, singular: true },
      ],
    },
    {
      // A value class, like geo:GeoPoint: a place on the schematic, held by
      // the station it positions.
      uri: DIAGRAM_POINT_CLASS_URI,
      labels: { "": "Diagram point" },
      definitions: {
        "": "A place on the schematic network diagram, in grid units.",
      },
      isAbstract: false,
      properties: [
        { property: X, required: true, singular: true },
        { property: Y, required: true, singular: true },
      ],
    },
    {
      // The fleet's classes are roots, like metro:Line. A formation's and a
      // unit's measures are sums computed by the provider, so the TBox
      // declares them while the ABox stores them only on car types.
      uri: ROLLING_STOCK,
      labels: { "": "Rolling stock" },
      definitions: {
        "": "A class of train: cars of one design, and the formations they run in.",
      },
      isAbstract: false,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: FORMATIONS, required: true, singular: false },
      ],
    },
    {
      uri: FORMATION,
      labels: { "": "Formation" },
      definitions: {
        "": "A train as it runs: an ordered list of units, each possibly reversed.",
      },
      isAbstract: false,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: STOCK, required: true, singular: true },
        { property: UNITS, required: true, singular: false },
        { property: LENGTH, required: true, singular: true },
        { property: CAPACITY, required: true, singular: true },
        { property: LINES, required: false, singular: false },
      ],
    },
    {
      uri: UNIT,
      labels: { "": "Unit" },
      definitions: {
        "": "A set of cars permanently coupled in order, which runs on its own.",
      },
      isAbstract: false,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: CARS, required: true, singular: false },
        { property: LENGTH, required: true, singular: true },
        { property: CAPACITY, required: true, singular: true },
      ],
    },
    {
      uri: CAR_TYPE,
      labels: { "": "Car type" },
      definitions: {
        "": "A kind of car: its code, whether it has a driving cab, its length and how many it carries.",
      },
      isAbstract: false,
      properties: [
        { property: NAME, required: true, singular: true },
        { property: CODE, required: true, singular: true },
        { property: HAS_CAB, required: true, singular: true },
        { property: LENGTH, required: true, singular: true },
        { property: CAPACITY, required: true, singular: true },
      ],
    },
    {
      // A value class, like metro:Call: a unit's place exists only within
      // its formation.
      uri: UNIT_POSITION_CLASS_URI,
      labels: { "": "Unit position" },
      definitions: {
        "": "One unit in a formation, at its place in the order.",
      },
      isAbstract: false,
      properties: [
        { property: POSITION, required: true, singular: true },
        { property: UNIT_PROPERTY, required: true, singular: true },
        { property: REVERSED, required: true, singular: true },
      ],
    },
    {
      // A value class, like metro:Call: a car's place exists only within
      // its unit.
      uri: CAR_POSITION_CLASS_URI,
      labels: { "": "Car position" },
      definitions: { "": "One car in a unit, at its place in the order." },
      isAbstract: false,
      properties: [
        { property: POSITION, required: true, singular: true },
        { property: CAR_TYPE_PROPERTY, required: true, singular: true },
        { property: REVERSED, required: true, singular: true },
      ],
    },
    {
      uri: GEO_POINT,
      labels: { "": "Geo point" },
      definitions: { "": "A latitude/longitude pair on the WGS 84 datum." },
      isAbstract: false,
      properties: [
        { property: LATITUDE, required: true, singular: true },
        { property: LONGITUDE, required: true, singular: true },
      ],
    },
    {
      // A class in the SECOND namespace that actually has instances. Without
      // it every entity would compact to `metro:` and the curie logic could
      // hardcode one prefix and still look correct.
      uri: ZONE,
      labels: { "": "Fare zone" },
      definitions: { "": "A fare band covering part of the network." },
      isAbstract: false,
      properties: [{ property: NAME, required: true, singular: true }],
    },
    {
      // The metaclass. Present because `EntityMeta.type` is non-null and
      // OntologyClass implements Node, so a class needs a class. In RDFS
      // `rdfs:Class` is an instance of itself, so the tower terminates
      // honestly rather than by fiat. It declares no properties, which also
      // gives `_meta.fields` an empty-list case to be tested against.
      uri: META_CLASS_URI,
      labels: { "": "Class" },
      definitions: { "": "The class of classes." },
      isAbstract: false,
      properties: [],
    },
  ],

  // ---------------------------------------------------------------------
  // Properties. All three PropertyKind members appear, `functional` appears
  // in both states, `domain` appears both asserted and absent (the contract
  // makes it nullable), and one inverse pair round-trips.
  // ---------------------------------------------------------------------
  properties: [
    {
      uri: NAME,
      labels: { "": "name" },
      definitions: { "": "The name shown to passengers." },
      range: "String",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: NOTE,
      labels: { "": "note" },
      range: "String",
      kind: "ANNOTATION",
      functional: false,
    },
    {
      uri: PLATFORM_COUNT,
      labels: { "": "platform count" },
      domain: STATION,
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: PLATFORM_LENGTH,
      labels: { "": "platform length" },
      definitions: {
        "": "The usable length of the station's shortest platform, in millimetres.",
      },
      domain: STATION,
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: SERVES_LINE,
      labels: { "": "serves line" },
      domain: STATION,
      range: "metro:Line",
      kind: "OBJECT",
      functional: false,
      inverse: SERVED_BY,
    },
    {
      uri: SERVED_BY,
      labels: { "": "served by" },
      domain: LINE,
      range: "metro:Station",
      kind: "OBJECT",
      functional: false,
      inverse: SERVES_LINE,
    },
    {
      uri: TRANSFER_MINUTES,
      labels: { "": "transfer minutes" },
      domain: INTERCHANGE,
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: LOCATION,
      labels: { "": "location" },
      domain: STATION,
      range: "geo:GeoPoint",
      kind: "OBJECT",
      functional: true,
    },
    {
      uri: LATITUDE,
      labels: { "": "latitude" },
      domain: GEO_POINT,
      range: "Float",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: LONGITUDE,
      labels: { "": "longitude" },
      domain: GEO_POINT,
      range: "Float",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: IN_ZONE,
      labels: { "": "in zone" },
      domain: STATION,
      range: "geo:Zone",
      kind: "OBJECT",
      functional: true,
    },
    {
      // Global, like metro:name. A route's label is its rdfs:label, which is
      // also what `_meta.label` serves, so the two cannot disagree.
      uri: LABEL,
      labels: { "": "label" },
      definitions: { "": "The human-readable name of a resource." },
      range: "String",
      kind: "ANNOTATION",
      functional: false,
    },
    {
      // Global: a line and a car type both answer to a `code` field, and a
      // property's local name is the field it projects.
      uri: CODE,
      labels: { "": "code" },
      definitions: { "": "The short code a line or a car type is known by." },
      range: "String",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: COLOUR,
      labels: { "": "colour" },
      definitions: {
        "": "The line's colour on maps and signs, as a hex triplet.",
      },
      domain: LINE,
      range: "String",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: ROUTES,
      labels: { "": "routes" },
      domain: LINE,
      range: "metro:Route",
      kind: "OBJECT",
      functional: false,
    },
    {
      uri: IS_LOOP,
      labels: { "": "is loop" },
      domain: ROUTE_CLASS_URI,
      range: "Boolean",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: CALLS,
      labels: { "": "calls" },
      domain: ROUTE_CLASS_URI,
      range: "metro:Call",
      kind: "OBJECT",
      functional: false,
    },
    {
      // Symmetric: a route's reverse has that route as its reverse, so the
      // property is its own inverse.
      uri: REVERSE,
      labels: { "": "reverse" },
      domain: ROUTE_CLASS_URI,
      range: "metro:Route",
      kind: "OBJECT",
      functional: true,
      inverse: REVERSE,
    },
    {
      // Global: calls and car positions both answer to a `position` field.
      uri: POSITION,
      labels: { "": "position" },
      definitions: { "": "A place in an ordered list, counted from 1." },
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: CALL_STOP,
      labels: { "": "stop" },
      domain: CALL_CLASS_URI,
      range: "metro:Stop",
      kind: "OBJECT",
      functional: true,
    },
    {
      uri: DIAGRAM_POSITION,
      labels: { "": "diagram position" },
      domain: STATION,
      range: "metro:DiagramPoint",
      kind: "OBJECT",
      functional: true,
    },
    {
      uri: X,
      labels: { "": "x" },
      definitions: { "": "Grid columns east of the diagram's west edge." },
      domain: DIAGRAM_POINT_CLASS_URI,
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: Y,
      labels: { "": "y" },
      definitions: { "": "Grid rows south of the diagram's north edge." },
      domain: DIAGRAM_POINT_CLASS_URI,
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      // Global, like metro:position: units and car types both measure a
      // length.
      uri: LENGTH,
      labels: { "": "length" },
      definitions: {
        "": "A length in whole millimetres, measured over couplers.",
      },
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: CAPACITY,
      labels: { "": "capacity" },
      definitions: { "": "The passengers carried, seated plus standing." },
      range: "Int",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: REVERSED,
      labels: { "": "reversed" },
      definitions: {
        "": "True when a car or a unit runs the other way round in its place.",
      },
      range: "Boolean",
      kind: "DATATYPE",
      functional: true,
    },
    {
      // Global: a line and a rolling stock both answer to a `formations`
      // field, so the property cannot name one inverse either.
      uri: FORMATIONS,
      labels: { "": "formations" },
      definitions: {
        "": "The formations a line is run with, or a rolling stock runs in.",
      },
      range: "metro:Formation",
      kind: "OBJECT",
      functional: false,
    },
    {
      uri: STOCK,
      labels: { "": "stock" },
      definitions: { "": "The rolling stock that lists the formation." },
      domain: FORMATION,
      range: "metro:RollingStock",
      kind: "OBJECT",
      functional: true,
    },
    {
      uri: UNITS,
      labels: { "": "units" },
      definitions: { "": "The units of a formation, from its front." },
      domain: FORMATION,
      range: "metro:UnitPosition",
      kind: "OBJECT",
      functional: false,
    },
    {
      uri: LINES,
      labels: { "": "lines" },
      definitions: { "": "The lines run with the formation." },
      domain: FORMATION,
      range: "metro:Line",
      kind: "OBJECT",
      functional: false,
    },
    {
      uri: UNIT_PROPERTY,
      labels: { "": "unit" },
      domain: UNIT_POSITION_CLASS_URI,
      range: "metro:Unit",
      kind: "OBJECT",
      functional: true,
    },
    {
      uri: CARS,
      labels: { "": "cars" },
      definitions: { "": "The cars of a unit, from its front." },
      domain: UNIT,
      range: "metro:CarPosition",
      kind: "OBJECT",
      functional: false,
    },
    {
      uri: HAS_CAB,
      labels: { "": "has cab" },
      definitions: {
        "": "True when the car has a driving cab at its leading end.",
      },
      domain: CAR_TYPE,
      range: "Boolean",
      kind: "DATATYPE",
      functional: true,
    },
    {
      uri: CAR_TYPE_PROPERTY,
      labels: { "": "car type" },
      domain: CAR_POSITION_CLASS_URI,
      range: "metro:CarType",
      kind: "OBJECT",
      functional: true,
    },
  ],

  // ---------------------------------------------------------------------
  // ABox. Seven lines over twenty-three direct Stations (two of them bare)
  // plus four Interchanges, so `instances` paging has more than one page to
  // page over and `hasNextPage` is a real answer rather than a constant. The
  // lines cover four topologies: linear lines (North, Coastal), a loop run
  // both ways (Circle), two linear lines closing a ring between shared
  // termini (Upland, Lowland), and a ring run by two lines in opposite
  // directions (the two Ringways). Three rolling stocks run them, in four
  // formations of three units over seven car types.
  // ---------------------------------------------------------------------
  entities: [
    {
      uri: `${METRO_NAMESPACE}north-line`,
      type: LINE,
      typename: "Line",
      labels: { "": "North Line" },
      definitions: { "": "Northgate to Marsh End, via the old cutting." },
      code: "1",
      colour: "#c8102e",
      formations: [`${METRO_NAMESPACE}series-90-six-car`],
      routes: [
        {
          key: "southbound",
          labels: { "": "To Marsh End" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}northgate`,
            `${METRO_NAMESPACE}verge-park`,
            `${METRO_NAMESPACE}foundry-row`,
            `${METRO_NAMESPACE}central-exchange`,
            `${METRO_NAMESPACE}marsh-end`,
          ],
          reverse: "northbound",
        },
        {
          key: "northbound",
          labels: { "": "To Northgate" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}marsh-end`,
            `${METRO_NAMESPACE}central-exchange`,
            `${METRO_NAMESPACE}foundry-row`,
            `${METRO_NAMESPACE}verge-park`,
            `${METRO_NAMESPACE}northgate`,
          ],
          reverse: "southbound",
        },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}circle-line`,
      type: LINE,
      typename: "Line",
      labels: { "": "Circle Line", fr: "Ligne Circulaire" },
      comments: { "": "Runs both directions; timetable is symmetric." },
      code: "2",
      colour: "#f2b705",
      formations: [`${METRO_NAMESPACE}series-70-fixed`],
      routes: [
        {
          key: "clockwise",
          labels: { "": "Clockwise" },
          isLoop: true,
          calls: [
            `${METRO_NAMESPACE}central-exchange`,
            `${METRO_NAMESPACE}kilnwood`,
            `${METRO_NAMESPACE}quarry-hill`,
            `${METRO_NAMESPACE}tannery-lane`,
            `${METRO_NAMESPACE}willowbank`,
            `${METRO_NAMESPACE}riverside-junction`,
          ],
          reverse: "anticlockwise",
        },
        {
          key: "anticlockwise",
          labels: { "": "Anticlockwise" },
          isLoop: true,
          calls: [
            `${METRO_NAMESPACE}central-exchange`,
            `${METRO_NAMESPACE}riverside-junction`,
            `${METRO_NAMESPACE}willowbank`,
            `${METRO_NAMESPACE}tannery-lane`,
            `${METRO_NAMESPACE}quarry-hill`,
            `${METRO_NAMESPACE}kilnwood`,
          ],
          reverse: "clockwise",
        },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}coastal-line`,
      type: LINE,
      typename: "Line",
      labels: { "": "Coastal Line" },
      code: "3",
      colour: "#0072ce",
      formations: [
        `${METRO_NAMESPACE}series-90-six-car`,
        `${METRO_NAMESPACE}series-50-four-car`,
      ],
      routes: [
        {
          key: "eastbound",
          labels: { "": "To Eastcliff" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}central-exchange`,
            `${METRO_NAMESPACE}riverside-junction`,
            `${METRO_NAMESPACE}harbourside`,
            `${METRO_NAMESPACE}saltford`,
            `${METRO_NAMESPACE}greenhithe`,
            `${METRO_NAMESPACE}eastcliff`,
          ],
          reverse: "westbound",
        },
        {
          key: "westbound",
          labels: { "": "To Central Exchange" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}eastcliff`,
            `${METRO_NAMESPACE}greenhithe`,
            `${METRO_NAMESPACE}saltford`,
            `${METRO_NAMESPACE}harbourside`,
            `${METRO_NAMESPACE}riverside-junction`,
            `${METRO_NAMESPACE}central-exchange`,
          ],
          reverse: "eastbound",
        },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}upland-line`,
      type: LINE,
      typename: "Line",
      labels: { "": "Upland Line" },
      definitions: {
        "": "Tannery Lane to Eastwick Cross over the hills; with the Lowland Line it closes the eastern ring.",
      },
      code: "4",
      colour: "#00843d",
      formations: [`${METRO_NAMESPACE}series-90-three-car`],
      routes: [
        {
          key: "eastbound",
          labels: { "": "To Eastwick Cross" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}tannery-lane`,
            `${METRO_NAMESPACE}larkrise`,
            `${METRO_NAMESPACE}highmoor`,
            `${METRO_NAMESPACE}eastwick-cross`,
          ],
          reverse: "westbound",
        },
        {
          key: "westbound",
          labels: { "": "To Tannery Lane" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}eastwick-cross`,
            `${METRO_NAMESPACE}highmoor`,
            `${METRO_NAMESPACE}larkrise`,
            `${METRO_NAMESPACE}tannery-lane`,
          ],
          reverse: "eastbound",
        },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}lowland-line`,
      type: LINE,
      typename: "Line",
      labels: { "": "Lowland Line" },
      definitions: {
        "": "Tannery Lane to Eastwick Cross through the valley; with the Upland Line it closes the eastern ring.",
      },
      code: "5",
      colour: "#8e3ba3",
      formations: [`${METRO_NAMESPACE}series-50-four-car`],
      routes: [
        {
          key: "eastbound",
          labels: { "": "To Eastwick Cross" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}tannery-lane`,
            `${METRO_NAMESPACE}millford`,
            `${METRO_NAMESPACE}reedmere`,
            `${METRO_NAMESPACE}eastwick-cross`,
          ],
          reverse: "westbound",
        },
        {
          key: "westbound",
          labels: { "": "To Tannery Lane" },
          isLoop: false,
          calls: [
            `${METRO_NAMESPACE}eastwick-cross`,
            `${METRO_NAMESPACE}reedmere`,
            `${METRO_NAMESPACE}millford`,
            `${METRO_NAMESPACE}tannery-lane`,
          ],
          reverse: "eastbound",
        },
      ],
    },
    {
      // A ring run by two lines in opposite directions over the same stops:
      // each line has one loop route and no reverse.
      uri: `${METRO_NAMESPACE}ringway-clockwise`,
      type: LINE,
      typename: "Line",
      labels: { "": "Ringway Clockwise" },
      definitions: { "": "The southern ring, run clockwise only." },
      code: "R1",
      colour: "#c46a2b",
      formations: [`${METRO_NAMESPACE}series-50-four-car`],
      routes: [
        {
          key: "clockwise",
          labels: { "": "Clockwise" },
          isLoop: true,
          calls: [
            `${METRO_NAMESPACE}dyers-green`,
            `${METRO_NAMESPACE}fernside`,
            `${METRO_NAMESPACE}nettlebed`,
            `${METRO_NAMESPACE}orchard-gate`,
            `${METRO_NAMESPACE}pinfold`,
            `${METRO_NAMESPACE}ropewalk`,
          ],
        },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}ringway-anticlockwise`,
      type: LINE,
      typename: "Line",
      labels: { "": "Ringway Anticlockwise" },
      definitions: { "": "The southern ring, run anticlockwise only." },
      code: "R2",
      colour: "#7a4b2a",
      formations: [`${METRO_NAMESPACE}series-50-four-car`],
      routes: [
        {
          key: "anticlockwise",
          labels: { "": "Anticlockwise" },
          isLoop: true,
          calls: [
            `${METRO_NAMESPACE}dyers-green`,
            `${METRO_NAMESPACE}ropewalk`,
            `${METRO_NAMESPACE}pinfold`,
            `${METRO_NAMESPACE}orchard-gate`,
            `${METRO_NAMESPACE}nettlebed`,
            `${METRO_NAMESPACE}fernside`,
          ],
        },
      ],
    },

    // Entities in the geo namespace. Their curies must come out `geo:…`
    // while every station comes out `metro:…`, which is only possible if the
    // prefix is resolved per entity.
    {
      uri: SECOND_NAMESPACE_ENTITY_URI,
      type: ZONE,
      typename: "Zone",
      labels: { "": "Central Zone" },
      definitions: { "": "The innermost fare band." },
    },
    {
      uri: `${GEO_NAMESPACE}coastal-zone`,
      type: ZONE,
      typename: "Zone",
      labels: { "": "Coastal Zone" },
    },

    {
      uri: MULTILINGUAL_ENTITY_URI,
      type: STATION,
      typename: "Station",
      inZone: SECOND_NAMESPACE_ENTITY_URI,
      // Two languages, so `title(lang:)` and `label(lang:)` are demonstrably
      // implemented rather than accepted and ignored.
      labels: { "": "Northgate", fr: "Porte-Nord" },
      definitions: { "": "The northern terminus." },
      platformCount: 4,
      platformLength: 125000,
      location: { latitude: 51.5412, longitude: -0.1435 },
      diagramPosition: { x: 0, y: 0 },
      servesLine: [`${METRO_NAMESPACE}north-line`],
      // Two languages again, so `Prose.lang` and `markdown(lang:)` have a
      // choice to make. The links cover every way a reference is written: a
      // CURIE, a CURIE in the second namespace, a full IRI and a class. The
      // code span and the external link must not resolve.
      prose: {
        en: `# Northgate

The northern terminus of the [North Line](metro:north-line), in the
[Central Zone](geo:central-zone). Change at Central Exchange for the
[Circle Line](https://metro.example/onto#circle-line).

Like every [station](metro:Station), it is written
\`[Coastal Line](metro:coastal-line)\` in a timetable's source.

Fares are set by the [transport authority](https://transport.example/fares).
`,
        fr: `# Porte-Nord

Le terminus nord de la [ligne Nord](metro:north-line).
`,
      },
    },
    {
      uri: `${METRO_NAMESPACE}harbourside`,
      inZone: `${GEO_NAMESPACE}coastal-zone`,
      type: STATION,
      typename: "Station",
      labels: { "": "Harbourside" },
      comments: { "": "Step-free to all platforms." },
      platformCount: 2,
      platformLength: 125000,
      location: { latitude: 51.5008, longitude: -0.1246 },
      diagramPosition: { x: 9, y: 18 },
      servesLine: [`${METRO_NAMESPACE}coastal-line`],
    },
    {
      uri: `${METRO_NAMESPACE}kilnwood`,
      type: STATION,
      typename: "Station",
      labels: { "": "Kilnwood" },
      platformCount: 2,
      platformLength: 110000,
      diagramPosition: { x: 4, y: 5 },
      servesLine: [`${METRO_NAMESPACE}circle-line`],
    },
    {
      uri: `${METRO_NAMESPACE}marsh-end`,
      type: STATION,
      typename: "Station",
      labels: { "": "Marsh End" },
      platformCount: 1,
      platformLength: 100000,
      diagramPosition: { x: 0, y: 12 },
      servesLine: [`${METRO_NAMESPACE}north-line`],
    },
    {
      uri: `${METRO_NAMESPACE}quarry-hill`,
      type: STATION,
      typename: "Station",
      labels: { "": "Quarry Hill" },
      platformCount: 2,
      platformLength: 110000,
      diagramPosition: { x: 10, y: 5 },
      servesLine: [`${METRO_NAMESPACE}circle-line`],
    },
    {
      uri: `${METRO_NAMESPACE}saltford`,
      inZone: `${GEO_NAMESPACE}coastal-zone`,
      type: STATION,
      typename: "Station",
      labels: { "": "Saltford" },
      platformCount: 3,
      platformLength: 125000,
      diagramPosition: { x: 13, y: 18 },
      servesLine: [`${METRO_NAMESPACE}coastal-line`],
    },
    {
      uri: `${METRO_NAMESPACE}verge-park`,
      type: STATION,
      typename: "Station",
      labels: { "": "Verge Park" },
      platformCount: 2,
      platformLength: 125000,
      diagramPosition: { x: 0, y: 3 },
      servesLine: [`${METRO_NAMESPACE}north-line`],
    },
    {
      uri: `${METRO_NAMESPACE}willowbank`,
      type: STATION,
      typename: "Station",
      labels: { "": "Willowbank" },
      platformCount: 1,
      platformLength: 110000,
      diagramPosition: { x: 10, y: 13 },
      servesLine: [`${METRO_NAMESPACE}circle-line`],
    },
    {
      uri: `${METRO_NAMESPACE}eastcliff`,
      inZone: `${GEO_NAMESPACE}coastal-zone`,
      type: STATION,
      typename: "Station",
      labels: { "": "Eastcliff" },
      platformCount: 2,
      platformLength: 125000,
      location: { latitude: 51.4934, longitude: 0.0098 },
      diagramPosition: { x: 21, y: 18 },
      servesLine: [`${METRO_NAMESPACE}coastal-line`],
    },
    {
      uri: `${METRO_NAMESPACE}foundry-row`,
      type: STATION,
      typename: "Station",
      labels: { "": "Foundry Row" },
      platformCount: 2,
      platformLength: 125000,
      diagramPosition: { x: 0, y: 6 },
      servesLine: [`${METRO_NAMESPACE}north-line`],
    },
    {
      uri: `${METRO_NAMESPACE}greenhithe`,
      type: STATION,
      typename: "Station",
      labels: { "": "Greenhithe" },
      platformCount: 1,
      platformLength: 125000,
      diagramPosition: { x: 17, y: 18 },
      servesLine: [`${METRO_NAMESPACE}coastal-line`],
    },

    // The eastern ring: the Upland and Lowland lines leave Tannery Lane on
    // different stops and meet again at Eastwick Cross.
    {
      uri: `${METRO_NAMESPACE}larkrise`,
      type: STATION,
      typename: "Station",
      labels: { "": "Larkrise" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 18, y: 5 },
      servesLine: [`${METRO_NAMESPACE}upland-line`],
    },
    {
      uri: `${METRO_NAMESPACE}highmoor`,
      type: STATION,
      typename: "Station",
      labels: { "": "Highmoor" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 24, y: 5 },
      servesLine: [`${METRO_NAMESPACE}upland-line`],
    },
    {
      uri: `${METRO_NAMESPACE}millford`,
      type: STATION,
      typename: "Station",
      labels: { "": "Millford" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 18, y: 13 },
      servesLine: [`${METRO_NAMESPACE}lowland-line`],
    },
    {
      uri: `${METRO_NAMESPACE}reedmere`,
      type: STATION,
      typename: "Station",
      labels: { "": "Reedmere" },
      platformCount: 1,
      platformLength: 70000,
      diagramPosition: { x: 24, y: 13 },
      servesLine: [`${METRO_NAMESPACE}lowland-line`],
    },

    // The southern ring. Both Ringway lines call at every one of these, over
    // the same stops, so none of them is an interchange.
    {
      uri: `${METRO_NAMESPACE}dyers-green`,
      type: STATION,
      typename: "Station",
      labels: { "": "Dyers Green" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 11, y: 22 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}fernside`,
      type: STATION,
      typename: "Station",
      labels: { "": "Fernside" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 19, y: 22 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}nettlebed`,
      type: STATION,
      typename: "Station",
      labels: { "": "Nettlebed" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 23, y: 26 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}orchard-gate`,
      type: STATION,
      typename: "Station",
      labels: { "": "Orchard Gate" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 19, y: 30 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}pinfold`,
      type: STATION,
      typename: "Station",
      labels: { "": "Pinfold" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 11, y: 30 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}ropewalk`,
      type: STATION,
      typename: "Station",
      labels: { "": "Ropewalk" },
      platformCount: 2,
      platformLength: 70000,
      diagramPosition: { x: 7, y: 26 },
      servesLine: [
        `${METRO_NAMESPACE}ringway-clockwise`,
        `${METRO_NAMESPACE}ringway-anticlockwise`,
      ],
    },

    // The awkward one: no label, no comment, no definition, no name, no
    // line. Only an IRI and a class — the minimum an entity can be — and the
    // contract still demands a non-null `_meta.title`. Title falls to the
    // local name, "ghost". No entity sits at a namespace IRI itself: that is
    // the ontology's own address, and an instance there would be listed
    // among the stations as the ontology.
    {
      uri: BARE_ENTITY_URI,
      type: STATION,
      typename: "Station",
    },

    {
      uri: `${METRO_NAMESPACE}central-exchange`,
      inZone: `${GEO_NAMESPACE}central-zone`,
      type: INTERCHANGE,
      typename: "Interchange",
      labels: { "": "Central Exchange" },
      definitions: { "": "The busiest transfer point on the network." },
      platformCount: 8,
      platformLength: 160000,
      transferMinutes: 4,
      location: { latitude: 51.5074, longitude: -0.1278 },
      diagramPosition: { x: 0, y: 9 },
      servesLine: [
        `${METRO_NAMESPACE}north-line`,
        `${METRO_NAMESPACE}circle-line`,
        `${METRO_NAMESPACE}coastal-line`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}riverside-junction`,
      type: INTERCHANGE,
      typename: "Interchange",
      labels: { "": "Riverside Junction" },
      platformCount: 5,
      platformLength: 125000,
      transferMinutes: 7,
      diagramPosition: { x: 4, y: 13 },
      servesLine: [
        `${METRO_NAMESPACE}circle-line`,
        `${METRO_NAMESPACE}coastal-line`,
      ],
    },
    {
      // Where the Circle meets the eastern ring: four routes leave it on four
      // different stops.
      uri: `${METRO_NAMESPACE}tannery-lane`,
      type: INTERCHANGE,
      typename: "Interchange",
      labels: { "": "Tannery Lane" },
      platformCount: 2,
      platformLength: 110000,
      transferMinutes: 3,
      diagramPosition: { x: 14, y: 9 },
      servesLine: [
        `${METRO_NAMESPACE}circle-line`,
        `${METRO_NAMESPACE}upland-line`,
        `${METRO_NAMESPACE}lowland-line`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}eastwick-cross`,
      type: INTERCHANGE,
      typename: "Interchange",
      labels: { "": "Eastwick Cross" },
      platformCount: 4,
      platformLength: 70000,
      transferMinutes: 2,
      diagramPosition: { x: 28, y: 9 },
      servesLine: [
        `${METRO_NAMESPACE}upland-line`,
        `${METRO_NAMESPACE}lowland-line`,
      ],
    },

    // The fleet. Car types carry the measures; a unit's are its cars' sums
    // and a formation's its units', computed by the provider, so neither
    // states a length or a capacity.
    {
      uri: `${METRO_NAMESPACE}car-70-driving`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 70 driving motor car" },
      code: "DM",
      hasCab: true,
      length: 18400,
      capacity: 140,
    },
    {
      uri: `${METRO_NAMESPACE}car-70-motor`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 70 motor car" },
      code: "M",
      hasCab: false,
      length: 17600,
      capacity: 150,
    },
    {
      uri: `${METRO_NAMESPACE}car-70-trailer`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 70 trailer car" },
      code: "T",
      hasCab: false,
      length: 17600,
      capacity: 150,
    },
    {
      uri: `${METRO_NAMESPACE}car-90-driving`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 90 driving motor car" },
      code: "DM",
      hasCab: true,
      length: 20000,
      capacity: 160,
    },
    {
      uri: `${METRO_NAMESPACE}car-90-trailer`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 90 trailer car" },
      code: "T",
      hasCab: false,
      length: 20000,
      capacity: 170,
    },
    {
      uri: `${METRO_NAMESPACE}car-50-driving`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 50 driving motor car" },
      code: "DM",
      hasCab: true,
      length: 16000,
      capacity: 110,
    },
    {
      uri: `${METRO_NAMESPACE}car-50-trailer`,
      type: CAR_TYPE,
      typename: "CarType",
      labels: { "": "Series 50 trailer car" },
      code: "T",
      hasCab: false,
      length: 15000,
      capacity: 120,
    },
    {
      // A cab at each end: the rear driving car runs reversed, its cab
      // facing outwards.
      uri: `${METRO_NAMESPACE}unit-70`,
      type: UNIT,
      typename: "Unit",
      labels: { "": "Series 70 unit" },
      cars: [
        { carType: `${METRO_NAMESPACE}car-70-driving`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-70-motor`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-70-trailer`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-70-trailer`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-70-motor`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-70-driving`, reversed: true },
      ],
    },
    {
      uri: `${METRO_NAMESPACE}unit-90`,
      type: UNIT,
      typename: "Unit",
      labels: { "": "Series 90 unit" },
      cars: [
        { carType: `${METRO_NAMESPACE}car-90-driving`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-90-trailer`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-90-driving`, reversed: true },
      ],
    },
    {
      // Asymmetric: one cab, at the front. Two of these coupled back to back
      // make a train with a cab at each end.
      uri: `${METRO_NAMESPACE}unit-50`,
      type: UNIT,
      typename: "Unit",
      labels: { "": "Series 50 unit" },
      cars: [
        { carType: `${METRO_NAMESPACE}car-50-driving`, reversed: false },
        { carType: `${METRO_NAMESPACE}car-50-trailer`, reversed: false },
      ],
    },

    // Formations: a fixed one, one unit alone and coupled, and an asymmetric
    // unit reversed against its partner. No formation states a length or a
    // capacity; each is its units' sums.
    {
      uri: `${METRO_NAMESPACE}series-70-fixed`,
      type: FORMATION,
      typename: "Formation",
      labels: { "": "Series 70 fixed formation" },
      units: [{ unit: `${METRO_NAMESPACE}unit-70`, reversed: false }],
    },
    {
      uri: `${METRO_NAMESPACE}series-90-three-car`,
      type: FORMATION,
      typename: "Formation",
      labels: { "": "Series 90 three-car" },
      units: [{ unit: `${METRO_NAMESPACE}unit-90`, reversed: false }],
    },
    {
      uri: `${METRO_NAMESPACE}series-90-six-car`,
      type: FORMATION,
      typename: "Formation",
      labels: { "": "Series 90 six-car" },
      units: [
        { unit: `${METRO_NAMESPACE}unit-90`, reversed: false },
        { unit: `${METRO_NAMESPACE}unit-90`, reversed: false },
      ],
    },
    {
      // Two one-cab units back to back: the second runs last car first, so
      // the train has a cab at each end and none in the middle.
      uri: `${METRO_NAMESPACE}series-50-four-car`,
      type: FORMATION,
      typename: "Formation",
      labels: { "": "Series 50 four-car" },
      units: [
        { unit: `${METRO_NAMESPACE}unit-50`, reversed: false },
        { unit: `${METRO_NAMESPACE}unit-50`, reversed: true },
      ],
    },

    // Rolling stocks, each listing its formations shortest first.
    {
      uri: `${METRO_NAMESPACE}series-70`,
      type: ROLLING_STOCK,
      typename: "RollingStock",
      labels: { "": "Series 70" },
      formations: [`${METRO_NAMESPACE}series-70-fixed`],
    },
    {
      uri: `${METRO_NAMESPACE}series-90`,
      type: ROLLING_STOCK,
      typename: "RollingStock",
      labels: { "": "Series 90" },
      formations: [
        `${METRO_NAMESPACE}series-90-three-car`,
        `${METRO_NAMESPACE}series-90-six-car`,
      ],
    },
    {
      uri: `${METRO_NAMESPACE}series-50`,
      type: ROLLING_STOCK,
      typename: "RollingStock",
      labels: { "": "Series 50" },
      formations: [`${METRO_NAMESPACE}series-50-four-car`],
    },
  ],
};
