/**
 * The part of the contract a browser loads: the site lens model, its
 * resolver and the list fields it derives. The package's root also reads
 * the shipped SDL from disk, which a browser cannot do, so client code
 * imports runtime values from here and only types from the root.
 *
 * @module browser
 */

export * from "../lib/lens/index.js";
