/**
 * Domain constants for the site lens.
 */

import type { PropertyRole, TermVisibility } from "./types.js";

/** The {@link LangLiterals} key that holds the untagged literal. */
export const UNTAGGED = "";

/**
 * The visibility a lens gives a class whose instances are values, never
 * entities: no index, search or list may show them.
 */
export const HIDDEN_VISIBILITY: TermVisibility = "HIDDEN";

/** The XML Schema namespace the ranges of literal properties use. */
const XSD = "http://www.w3.org/2001/XMLSchema#";

/** The datatype ranges whose values a list reads as numbers. */
export const NUMBER_RANGES: ReadonlySet<string> = new Set(
  [
    "decimal",
    "double",
    "float",
    "integer",
    "int",
    "long",
    "short",
    "byte",
    "nonNegativeInteger",
    "positiveInteger",
    "nonPositiveInteger",
    "negativeInteger",
    "unsignedInt",
    "unsignedLong",
    "unsignedShort",
    "unsignedByte",
  ].map((name) => `${XSD}${name}`),
);

/** The datatype ranges whose values a list reads as dates. */
export const DATE_RANGES: ReadonlySet<string> = new Set(
  ["date", "dateTime", "dateTimeStamp"].map((name) => `${XSD}${name}`),
);

/** The datatype range whose values a list reads as a flag. */
export const FLAG_RANGE = `${XSD}boolean`;

/** The roles whose fields a list never shows as a fact: the row says them. */
export const UNLISTED_ROLES: ReadonlySet<PropertyRole> = new Set([
  "LABEL",
  "DESCRIPTION",
  "DEPICTION",
  "ICON",
]);

/** The visibility that shows a field first. */
export const PROMINENT_VISIBILITY: TermVisibility = "PROMINENT";
