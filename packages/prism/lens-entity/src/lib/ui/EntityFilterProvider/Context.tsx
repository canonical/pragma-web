import { createContext } from "react";
import { DEFAULT_ENTITY_FILTER } from "../../constants.js";
import type { EntityFilterValue } from "./types.js";

/**
 * The reader's filter, shared by the strip's controls and the index.
 *
 * The mode strip is rendered by the lens's own layout (`EntityLayout`) as a
 * sibling of the routed page, not a descendant, so no prop path runs from
 * the index across to the search box. Context crosses that boundary and is
 * the smallest bridge that does.
 *
 * It holds only the reader's ephemeral choices, never graph data: data the
 * index announced could only arrive in an effect, so the strip would render
 * empty on the server and populated on the client. The strip reads the
 * index's own operation from the warm store instead.
 *
 * Its default is the no-op filter with an inert setter, so a consumer outside
 * any provider degrades to "show everything" rather than throwing.
 */
const EntityFilterContext = createContext<EntityFilterValue>({
  filter: DEFAULT_ENTITY_FILTER,
  setFilter: () => {},
});

export default EntityFilterContext;
