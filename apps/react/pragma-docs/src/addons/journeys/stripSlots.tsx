import { makeLensContext } from "@canonical/prism-core";
import type React from "react";
import { JourneyViewSwitch } from "./JourneyViewSwitch/index.js";
import { useJourneyView } from "./journeyViewContext.js";

/**
 * The Journeys lens's mode-strip tenant — the component `JourneysLayout`
 * renders into the strip's `controls` socket. RULING 1 moved the Table ⇄
 * Graph switch here from the canvas, mirroring the Definitions lens.
 *
 * It takes NO props: the layout renders it as a sibling of the routed page,
 * so nothing the page holds can reach it as a prop. The ephemeral VIEW
 * reaches it through `journeyViewContext` (see that module for why a context
 * is the smallest bridge between the strip and the page).
 *
 * NO Relay read, and no Suspense guard — unlike the Definitions chips, this
 * tenant's content is DATA-INDEPENDENT (the fixed "Table"/"Graph" labels), so
 * it never touches the graph and therefore can never suspend the layout on a
 * cold store. The switch renders identically on the server and the client
 * (the default is a constant), so there is no empty-then-populated hydration
 * mismatch to guard against either.
 */
const ControlsContent = (): React.ReactElement => {
  const { view, setView } = useJourneyView();
  return <JourneyViewSwitch onViewChange={setView} view={view} />;
};

/**
 * The context tenant: the breadcrumb trail. `Journeys` on the diagram,
 * `Journeys / <job>` on a job view — the job crumb is the `:job` route
 * param (the graph URI), URL-derived, so it reads no query and never
 * suspends the layout.
 */
const Context = makeLensContext({
  lensLabel: "Journeys",
  lensRouteName: "journeys",
  paramKey: "job",
});

export const journeysStripSlots = {
  Context,
  Controls: ControlsContent,
} as const;
