/**
 * Marks the prepare step's graph requests as this site's own server-side
 * traffic. The graph server logs `ssr` vs `client` off it, which is what
 * lets the e2e suite prove a server-rendered first load made no BROWSER
 * requests.
 */
export const SSR_HEADERS = { "x-pragma-ssr": "1" } as const;

/**
 * The styles context and density every page renders in, on `<html>`: the
 * `docs` context at `comfortable` density, which together choose the
 * `--density-*` channel the chrome's line unit reads.
 */
export const DOCUMENT_CONTEXT_CLASS_NAME = "docs comfortable";
