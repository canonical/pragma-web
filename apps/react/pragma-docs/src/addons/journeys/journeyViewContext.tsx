import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_JOURNEY_VIEW,
  type JourneyView,
} from "./JourneysExplorer/types.js";

/**
 * THE ONE CONTEXT IN THIS LENS, and the constraint that forced it (RULING 1,
 * mirroring the Definitions lens's `lensFilterContext`).
 *
 * The Table ⇄ Graph switch moved out of the canvas and into the mode strip's
 * `controls` socket, exactly as the Definitions chips fill it. The strip is
 * rendered by the lens's own layout (`JourneysLayout`) as a sibling of the
 * routed page, not a descendant: the router hands the layout the page as
 * `children`, and the switch sits beside it. So there is no prop path from
 * `JourneysExplorer` across to the switch — the toolbar is rendered above
 * the state it needs to read and write.
 *
 * Props cannot cross that boundary. Context can, and it is the smallest
 * bridge that does: no store, no router change, nothing every other lens
 * would have to carry. `JourneysLayout` puts the provider around both the
 * strip and the canvas, so the switch and the explorer share ONE ephemeral
 * view. The provider lives as long as the layout, which the router
 * remounts whenever the matched route changes, so the view survives a move
 * from one job to another (the same route, new params) and starts from its
 * default on a move to the lens index or to another lens.
 *
 * THE SSR DETERMINISM RULE. The initial value is `DEFAULT_JOURNEY_VIEW` —
 * "table", the primary surface — read from NOTHING: never `localStorage`,
 * `window` or the query string. It is therefore a no-op producing
 * byte-identical markup on both sides (the server's first paint is the table,
 * the two-track grid), and switching to the graph is a client transition.
 *
 * The fallback matters too: a consumer outside any provider degrades to the
 * same no-op default rather than throwing, so a stray mount can never take
 * the layout down.
 */

/** What the lens's consumers share: the view and the way to change it. */
export interface JourneyViewValue {
  readonly view: JourneyView;
  readonly setView: (next: JourneyView) => void;
}

const FALLBACK: JourneyViewValue = {
  view: DEFAULT_JOURNEY_VIEW,
  setView: () => {},
};

const JourneyViewContext = createContext<JourneyViewValue>(FALLBACK);

export interface JourneyViewProviderProps {
  readonly children: ReactNode;
}

export const JourneyViewProvider = ({
  children,
}: JourneyViewProviderProps): ReactNode => {
  const [view, setView] = useState<JourneyView>(DEFAULT_JOURNEY_VIEW);
  const value = useMemo<JourneyViewValue>(() => ({ view, setView }), [view]);
  return (
    <JourneyViewContext.Provider value={value}>
      {children}
    </JourneyViewContext.Provider>
  );
};

/** Read the lens's view. Degrades to the no-op default outside a provider
 * (see the module doc) rather than throwing. */
export const useJourneyView = (): JourneyViewValue =>
  useContext(JourneyViewContext);
