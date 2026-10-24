import { DEFAULT_PORT } from "./constants.js";

/**
 * Resolve the port the site listens on: `PORT` when it parses as a non-zero
 * number, otherwise `DEFAULT_PORT`.
 *
 * An empty or non-numeric `PORT` falls back rather than failing, so both Bun
 * servers and the sitemap's localhost fallback always name the same port,
 * the one the running server actually listens on.
 *
 * @returns The port number.
 * @note Impure: reads the ambient environment.
 */
export default function resolvePort(): number {
  return Number(process.env.PORT) || DEFAULT_PORT;
}
