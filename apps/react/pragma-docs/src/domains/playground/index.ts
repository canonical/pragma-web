/**
 * The playground domain: one component off the live graph in every form
 * the site projects it in, its route, its warm step and its layout.
 *
 * @module
 */

export { default as playgroundLayout } from "./layout.js";
export {
  componentProbeQueryNode,
  componentProbeVariables,
  PROBE_URI,
} from "./probeQuery.js";
export { default as playgroundRoutes } from "./routes.js";
