import { createContext } from "react";
import type { ProjectionsContextValue } from "./types.js";

/**
 * The site's projection maps and link renderer, or `undefined` outside a
 * `ProjectionsProvider`.
 */
const ProjectionsContext = createContext<ProjectionsContextValue | undefined>(
  undefined,
);

export default ProjectionsContext;
