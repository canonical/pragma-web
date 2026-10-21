import type { ReactNode } from "react";
import type { MarkdownComponents } from "../types.js";

/**
 * Props accepted by `MdxProvider`.
 *
 * Exempt from the native-prop extension convention: `MdxProvider` renders a
 * context provider and no DOM element at all, so it has no root tag whose
 * native props these could extend.
 */
export type MdxProviderProps = {
  /** The tree whose compiled MDX pages render through `components`. */
  readonly children: ReactNode;
  /**
   * Which component renders each HTML element of an MDX page, keyed by tag
   * name. Replaces `defaultComponents` rather than merging with it; spread
   * `defaultComponents` into the map to keep them. Declare it at module scope,
   * so the context value is referentially stable.
   *
   * Required: a provider without a map would provide nothing, and pages
   * already render `defaultComponents` with no provider above them.
   */
  readonly components: MarkdownComponents;
};
