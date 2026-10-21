import { createContext } from "react";
import type { ProseReferenceIndex } from "./types.js";

/**
 * The page's prose references. Its default is an empty index, so prose
 * rendered with no `ProseReferencesProvider` above links nowhere new: every
 * link stays the plain anchor its author wrote.
 */
const ProseReferencesContext = createContext<ProseReferenceIndex>(new Map());

export default ProseReferencesContext;
