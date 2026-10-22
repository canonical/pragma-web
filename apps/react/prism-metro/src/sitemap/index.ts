/**
 * The sitemap execution domain: the factory each server dispatches
 * `/sitemap.xml` to, and the entries it lists.
 *
 * @module
 */

export { default as getSitemapItems } from "./getSitemapItems.js";
export { default as createSitemapRenderer } from "./renderer.js";
