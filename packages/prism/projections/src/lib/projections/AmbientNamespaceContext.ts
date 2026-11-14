import { createContext } from "react";

/**
 * The prefix of the page's ambient namespace, as its CURIEs write it
 * (`ds`), or `undefined` where no page declares one.
 */
const AmbientNamespaceContext = createContext<string | undefined>(undefined);

export default AmbientNamespaceContext;
