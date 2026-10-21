import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LENS_FILTER } from "./constants.js";
import type { LensFilter } from "./types.js";

/**
 * THE ONE CONTEXT IN THIS LENS, and the constraint that forced it.
 *
 * The spec's judgement was "lifted state and props, not context — UNLESS
 * wiring the strip's Controls forces one". It does, and here is the exact
 * reason, so the next reader does not undo this on principle:
 *
 * The mode strip is rendered by the lens's own layout (`DefinitionsLayout`)
 * as a sibling of the routed page, not a descendant: the router hands the
 * layout the page as `children`, and the strip's chips sit beside it. So
 * there is no prop path from `DefinitionsExplorer` across to the chips —
 * the toolbar is rendered above the state it needs to read and write.
 *
 * Props cannot cross that boundary. Context can, and it is the smallest
 * bridge that does: no store, no router change, nothing every other lens
 * would have to carry. `DefinitionsLayout` puts the provider around both
 * the strip and the canvas, so the chips and the explorer share ONE
 * filter. The provider lives as long as the layout, which the router
 * remounts whenever the matched route changes, so the filter survives a
 * move from one term to another (the same route, new params) and starts
 * from its default on a move to the lens index or to another lens.
 *
 * WHAT THIS CONTEXT DELIBERATELY DOES NOT CARRY: the graph data. An
 * earlier attempt had the explorer ANNOUNCE its ontologies here, which
 * could only happen in an effect — client-only, after paint — so the strip
 * rendered empty on the server and populated on the client: a hydration
 * mismatch in the strip itself. The strip instead reads the same Relay
 * operation from the same warm store (see `stripSlots.tsx`). This context
 * holds ONLY the reader's ephemeral choices, which is all that genuinely
 * needs sharing.
 *
 * THE SSR DETERMINISM RULE. The initial value is `DEFAULT_LENS_FILTER`,
 * whose `namespaces` is empty — read by every consumer as "no chip has
 * been touched, so show everything", exactly as the explorer's own seed
 * does. It is therefore a no-op producing byte-identical markup on both
 * sides. Nothing here may be seeded from `localStorage`, `window` or the
 * query string.
 *
 * The fallback matters too: a consumer outside any provider degrades to
 * the same no-op rather than throwing, so a stray mount can never take the
 * layout down.
 */

/** What the lens's consumers share: the filter and the way to change it. */
export interface LensFilterValue {
  readonly filter: LensFilter;
  readonly setFilter: (next: LensFilter) => void;
}

const FALLBACK: LensFilterValue = {
  filter: DEFAULT_LENS_FILTER,
  setFilter: () => {},
};

const LensFilterContext = createContext<LensFilterValue>(FALLBACK);

export interface LensFilterProviderProps {
  readonly children: ReactNode;
}

export const LensFilterProvider = ({
  children,
}: LensFilterProviderProps): ReactNode => {
  const [filter, setFilter] = useState<LensFilter>(DEFAULT_LENS_FILTER);
  const value = useMemo<LensFilterValue>(
    () => ({ filter, setFilter }),
    [filter],
  );
  return (
    <LensFilterContext.Provider value={value}>
      {children}
    </LensFilterContext.Provider>
  );
};

/** Read the lens's filter. Degrades to the no-op default outside a
 * provider (see the module doc) rather than throwing. */
export const useLensFilter = (): LensFilterValue =>
  useContext(LensFilterContext);
