/**
 * Reading Markdown for the site's own components: the first paragraph of a
 * text, and the elements a summary renders it through.
 *
 * Not barrelled from `#lib/ui`: nothing here is a component. Import from
 * `#lib/markdown`.
 */

export { SUMMARY_COMPONENTS } from "./constants.js";
export { default as findFirstParagraph } from "./findFirstParagraph.js";
