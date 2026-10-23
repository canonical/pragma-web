import { useContext } from "react";
import MdxContext from "../Context.js";
import type { UseMDXComponentsResult } from "./types.js";

/**
 * Read the components map of the nearest `MdxProvider`, or
 * `defaultComponents` when there is none.
 *
 * This is the hook compiled `.mdx` modules call to find their components:
 * `createMdxVitePreset` points MDX's provider import at this entry, and MDX
 * requires the hook to have exactly this name. Application code does not
 * need to call it.
 */
export default function useMDXComponents(): UseMDXComponentsResult {
  return useContext(MdxContext);
}
