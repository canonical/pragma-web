import type { Theme } from "@canonical/react-hooks";
import { createContext } from "react";

/**
 * The theme the reader's cookie stores, as the request carried it. Its
 * default is `undefined`, no stored theme: a page rendered with no provider
 * mounted reads the cookie on the client alone.
 */
const StoredThemeContext = createContext<Theme | undefined>(undefined);

export default StoredThemeContext;
