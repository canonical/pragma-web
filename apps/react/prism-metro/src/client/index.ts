/**
 * The browser execution domain. `entry.tsx` is the bundle entry point and is
 * executed, never imported, so it is not part of this surface.
 *
 * @module
 */

export { default as hydrateApp } from "./hydrateApp.js";
