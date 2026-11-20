import { createContext } from "react";
import type { I18nContextValue } from "./types.js";

/**
 * React context carrying the i18n runtime. `I18nProvider` writes it; the
 * i18n-react hooks read it.
 */
const Context = createContext<I18nContextValue | null>(null);

export default Context;
