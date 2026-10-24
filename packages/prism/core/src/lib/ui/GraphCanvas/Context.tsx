import { createContext } from "react";
import type { GraphZoomBucket } from "./types.js";

/**
 * The zoom bucket of the nearest `GraphCanvas`: `full` outside any canvas
 * and on the server, where nothing is measured.
 */
const Context = createContext<GraphZoomBucket>("full");

export default Context;
