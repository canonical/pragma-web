import { ProseLink } from "./ProseLink/index.js";

/**
 * The element overrides a Markdown renderer takes to render a page's prose:
 * a link to one of the page's prose references renders as that node's chip.
 */
export const markdownComponents = { a: ProseLink } as const;
