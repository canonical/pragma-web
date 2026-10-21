import { createContext } from "react";
import type { ProjectionMaps } from "./types.js";

/** The site's projection maps, or `undefined` outside a `ProjectionsProvider`. */
const ProjectionsContext = createContext<ProjectionMaps | undefined>(undefined);

export default ProjectionsContext;
