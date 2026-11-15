import { createContext } from "react";
import type { ProjectionsContextValue } from "./types.js";

/**
 * The site's link renderer, peek and switches, or `undefined` outside a
 * `ProjectionLinkProvider`.
 */
const ProjectionsContext = createContext<ProjectionsContextValue | undefined>(
  undefined,
);

export default ProjectionsContext;
