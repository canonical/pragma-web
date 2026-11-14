/**
 * Static fixtures for the site lens tests.
 *
 * The outline is a small hierarchy with a diamond: `Hub` is both an `Agent`
 * and a `Place`, which declare disagreeing lens facts at the same distance.
 * `Spectre` descends from `Ghost`, a class the outline does not know.
 */

import type { SiteLens, TBoxOutline } from "../lib/lens/types.js";

/** The fixtures' namespace. */
export const EX = "http://example.org/";

/** The fixtures' class hierarchy, inverse pairs and asserted labels. */
export const LENS_OUTLINE: TBoxOutline = {
  classes: [
    { uri: `${EX}Thing`, parents: [] },
    { uri: `${EX}Agent`, parents: [`${EX}Thing`] },
    { uri: `${EX}Place`, parents: [`${EX}Thing`] },
    { uri: `${EX}Hub`, parents: [`${EX}Agent`, `${EX}Place`] },
    { uri: `${EX}Person`, parents: [`${EX}Agent`] },
    { uri: `${EX}Employee`, parents: [`${EX}Person`] },
    { uri: `${EX}Spectre`, parents: [`${EX}Ghost`] },
  ],
  properties: [
    { uri: `${EX}name` },
    { uri: `${EX}code` },
    {
      uri: `${EX}worksFor`,
      inverse: `${EX}employs`,
      labels: { en: "works for" },
    },
    {
      uri: `${EX}employs`,
      inverse: `${EX}worksFor`,
      labels: { en: "employs", "": "employs (untagged)" },
    },
    { uri: `${EX}locatedIn` },
  ],
};

/** A site lens over {@link LENS_OUTLINE}. */
export const SITE_LENS_FIXTURE: SiteLens = {
  groups: [
    { uri: `${EX}identity`, labels: { en: "Identity" }, order: 1 },
    { uri: `${EX}links` },
  ],
  classes: [
    {
      uri: `${EX}Thing`,
      visibility: "NORMAL",
      glyph: "thing",
      fields: [
        {
          property: `${EX}name`,
          group: `${EX}identity`,
          order: 1,
          role: "LABEL",
        },
        { property: `${EX}code`, visibility: "HIDDEN" },
        { property: `${EX}ghostProperty`, order: 9 },
      ],
    },
    {
      uri: `${EX}Agent`,
      visibility: "PROMINENT",
      glyph: "shared",
      pluralLabels: { en: "Agents" },
      fields: [{ property: `${EX}name`, order: 2, role: "CLASSIFICATION" }],
    },
    {
      uri: `${EX}Place`,
      visibility: "HIDDEN",
      glyph: "shared",
      fields: [
        { property: `${EX}name`, role: "DESCRIPTION" },
        { property: `${EX}locatedIn`, group: `${EX}links` },
      ],
    },
    {
      uri: `${EX}Ghost`,
      visibility: "HIDDEN",
      fields: [{ property: `${EX}haunts` }],
    },
  ],
  properties: [
    { uri: `${EX}name`, visibility: "NORMAL", pluralLabels: { en: "names" } },
    { uri: `${EX}code`, visibility: "PROMINENT" },
    { uri: `${EX}worksFor`, inverseLabels: { fr: "emploie" } },
    {
      uri: `${EX}employs`,
      visibility: "HIDDEN",
      pluralLabels: { en: "employ" },
      inverseLabels: { "": "is employed by" },
      inverseVisibility: "PROMINENT",
    },
    { uri: `${EX}ghostProperty`, visibility: "HIDDEN" },
  ],
};
