/**
 * Reading Markdown for the site's own components: the first paragraph of a
 * text, and the elements a summary renders it through.
 *
 * NOT barrelled from `#lib/index.js`: that barrel carries the app's
 * components, and nothing here is one. Import from `#lib/markdown`.
 */

export { SUMMARY_COMPONENTS } from "./constants.js";
export { default as findFirstParagraph } from "./findFirstParagraph.js";
