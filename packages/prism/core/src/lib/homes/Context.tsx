import { createContext } from "react";
import type { Homes } from "./types.js";

/** The site's homes, or `undefined` outside a `HomesProvider`. */
const HomesContext = createContext<Homes | undefined>(undefined);

export default HomesContext;
