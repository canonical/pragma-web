import { createContext } from "react";
import { DEFAULT_LENS_FILTER } from "../../constants.js";
import type { LensFilterValue } from "./types.js";

/**
 * The one context in the lens: the reader's filter, shared by the strip's
 * chips, the explorer and the inspector, and the latest region a reader
 * asked the graph to fit from the inspector.
 *
 * The mode strip is rendered by the lens's own layout (`DefinitionsLayout`)
 * as a sibling of the routed page, not a descendant: the router hands the
 * layout the page as `children`, and the strip's chips sit beside it. So no
 * prop path runs from `DefinitionsExplorer` across to the chips; the toolbar
 * is rendered above the state it needs to read and write. Context crosses
 * that boundary and is the smallest bridge that does: no store, no router
 * change, nothing every other lens would have to carry.
 *
 * It deliberately does not carry the graph data. Data announced by the
 * explorer could only arrive in an effect, client-only and after paint, so
 * the strip would render empty on the server and populated on the client: a
 * hydration mismatch in the strip itself. The strip reads the same Relay
 * operation from the same warm store instead (see `DefinitionsLayout`'s `useExplorerQuery`), and
 * this context holds only the reader's choices and where the graph's camera
 * stood.
 *
 * Its default is the no-op filter with an inert setter, so a consumer
 * outside any provider degrades to "show everything" rather than throwing,
 * and a stray mount can never take the layout down.
 */
const LensFilterContext = createContext<LensFilterValue>({
  filter: DEFAULT_LENS_FILTER,
  setFilter: () => {},
  search: "",
  setSearch: () => {},
  region: undefined,
  requestRegion: () => {},
  camera: undefined,
});

export default LensFilterContext;
