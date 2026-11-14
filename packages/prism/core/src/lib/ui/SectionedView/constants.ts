/**
 * The id of the section index's label, which names the index's `<nav>`.
 * Fixed rather than generated: a page holds one view, and an id the server
 * and the browser derive alike keeps hydration silent wherever the server
 * renders more of the document than the browser hydrates.
 */
export const CONTENTS_LABEL_ID = "sectioned-view-contents";
