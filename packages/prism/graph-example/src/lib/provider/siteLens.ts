import type { SiteLens } from "@canonical/prism-contract";
import {
  GEO_NAMESPACE as GEO,
  METRO_NAMESPACE as METRO,
  RDFS_NAMESPACE as RDFS,
} from "./constants.js";

const OVERVIEW = `${METRO}section.overview`;
const SERVICE = `${METRO}section.service`;
const PLACE = `${METRO}section.place`;

/**
 * The metro's type lens: how prominent each class and property is, the glyph
 * and plural name of each class, the sections and order of its fields, and
 * how a relation reads from its object's side.
 *
 * The data has the shape of a Turtle lens (`sh:PropertyGroup`, lens shapes
 * with `sh:group`, `sh:order` and `shui:propertyRole`, and `prism:` terms),
 * so it moves into the ontology as a data move. Fare zones are hidden: their
 * instances are values the stations point at, never entities of their own.
 * Glyphs name icons of `@canonical/ds-assets`.
 */
export const siteLens: SiteLens = {
  groups: [
    { uri: OVERVIEW, labels: { en: "Overview" }, order: 1 },
    { uri: SERVICE, labels: { en: "Service" }, order: 2 },
    { uri: PLACE, labels: { en: "Place" }, order: 3 },
  ],
  classes: [
    {
      uri: `${METRO}Stop`,
      glyph: "location",
      pluralLabels: { en: "Stops" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
      ],
    },
    {
      uri: `${METRO}Station`,
      visibility: "PROMINENT",
      pluralLabels: { en: "Stations", fr: "Gares" },
      fields: [
        { property: `${METRO}platformCount`, group: OVERVIEW, order: 2 },
        { property: `${METRO}platformLength`, group: OVERVIEW, order: 3 },
        {
          property: `${METRO}servesLine`,
          group: SERVICE,
          order: 1,
          visibility: "PROMINENT",
        },
        {
          property: `${GEO}location`,
          group: PLACE,
          order: 1,
          visibility: "PROMINENT",
        },
        { property: `${GEO}inZone`, group: PLACE, order: 2 },
        { property: `${METRO}diagramPosition`, group: PLACE, order: 3 },
      ],
    },
    {
      uri: `${METRO}Interchange`,
      glyph: "swap",
      pluralLabels: { en: "Interchanges" },
      fields: [
        {
          property: `${METRO}transferMinutes`,
          group: OVERVIEW,
          order: 2,
          visibility: "PROMINENT",
        },
        { property: `${METRO}platformCount`, order: 3 },
      ],
    },
    {
      uri: `${METRO}Line`,
      visibility: "PROMINENT",
      glyph: "connected",
      pluralLabels: { en: "Lines" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${METRO}code`,
          group: OVERVIEW,
          order: 2,
          visibility: "PROMINENT",
        },
        { property: `${METRO}colour`, group: OVERVIEW, order: 3 },
        { property: `${METRO}routes`, group: SERVICE, order: 1 },
        { property: `${METRO}servedBy`, group: SERVICE, order: 2 },
        { property: `${METRO}formations`, group: SERVICE, order: 3 },
      ],
    },
    {
      uri: `${METRO}Route`,
      pluralLabels: { en: "Routes" },
      fields: [
        {
          property: `${RDFS}label`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        { property: `${METRO}isLoop`, group: OVERVIEW, order: 2 },
        { property: `${METRO}calls`, group: SERVICE, order: 1 },
        { property: `${METRO}reverse`, group: SERVICE, order: 2 },
      ],
    },
    {
      uri: `${METRO}Call`,
      pluralLabels: { en: "Calls" },
      fields: [
        { property: `${METRO}position`, order: 1 },
        { property: `${METRO}stop`, order: 2, visibility: "PROMINENT" },
      ],
    },
    { uri: `${METRO}DiagramPoint`, pluralLabels: { en: "Diagram points" } },
    {
      uri: `${METRO}RollingStock`,
      visibility: "PROMINENT",
      glyph: "containers",
      pluralLabels: { en: "Rolling stock" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        { property: `${METRO}formations`, group: SERVICE, order: 1 },
      ],
    },
    {
      uri: `${METRO}Formation`,
      glyph: "units",
      pluralLabels: { en: "Formations" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        { property: `${METRO}length`, group: OVERVIEW, order: 2 },
        {
          property: `${METRO}capacity`,
          group: OVERVIEW,
          order: 3,
          visibility: "PROMINENT",
        },
        { property: `${METRO}stock`, group: SERVICE, order: 1 },
        { property: `${METRO}units`, group: SERVICE, order: 2 },
        { property: `${METRO}lines`, group: SERVICE, order: 3 },
      ],
    },
    {
      uri: `${METRO}Unit`,
      glyph: "bundle",
      pluralLabels: { en: "Units" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        { property: `${METRO}length`, group: OVERVIEW, order: 2 },
        { property: `${METRO}capacity`, group: OVERVIEW, order: 3 },
        { property: `${METRO}cars`, group: SERVICE, order: 1 },
      ],
    },
    {
      uri: `${METRO}CarType`,
      glyph: "blueprint",
      pluralLabels: { en: "Car types" },
      fields: [
        {
          property: `${METRO}name`,
          group: OVERVIEW,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${METRO}code`,
          group: OVERVIEW,
          order: 2,
          visibility: "PROMINENT",
        },
        { property: `${METRO}hasCab`, group: OVERVIEW, order: 3 },
        { property: `${METRO}length`, group: OVERVIEW, order: 4 },
        { property: `${METRO}capacity`, group: OVERVIEW, order: 5 },
      ],
    },
    { uri: `${METRO}UnitPosition`, pluralLabels: { en: "Unit positions" } },
    { uri: `${METRO}CarPosition`, pluralLabels: { en: "Car positions" } },
    { uri: `${GEO}GeoPoint`, pluralLabels: { en: "Geo points" } },
    {
      uri: `${GEO}Zone`,
      visibility: "HIDDEN",
      glyph: "map",
      pluralLabels: { en: "Fare zones" },
    },
    { uri: `${RDFS}Class`, pluralLabels: { en: "Classes" } },
  ],
  properties: [
    {
      uri: `${METRO}servesLine`,
      visibility: "PROMINENT",
      pluralLabels: { en: "serves lines" },
    },
    { uri: `${METRO}servedBy`, pluralLabels: { en: "served by" } },
    { uri: `${GEO}inZone`, pluralLabels: { en: "in zones" } },
    { uri: `${GEO}stops`, pluralLabels: { en: "stops" } },
    { uri: `${GEO}location`, visibility: "PROMINENT" },
    {
      uri: `${METRO}stop`,
      inverseLabels: { en: "Called at by" },
      inversePluralLabels: { en: "Called at by" },
    },
    {
      uri: `${METRO}routes`,
      pluralLabels: { en: "routes" },
      inverseLabels: { en: "Line" },
      inversePluralLabels: { en: "Lines" },
    },
    {
      uri: `${METRO}formations`,
      pluralLabels: { en: "formations" },
      inverseLabels: { en: "Run on" },
      inversePluralLabels: { en: "Run on" },
    },
    {
      uri: `${METRO}unit`,
      inverseLabels: { en: "Placed in" },
      inversePluralLabels: { en: "Placed in" },
    },
    {
      uri: `${METRO}carType`,
      inverseLabels: { en: "Placed in" },
      inversePluralLabels: { en: "Placed in" },
    },
    { uri: `${METRO}note`, visibility: "HIDDEN" },
  ],
};
