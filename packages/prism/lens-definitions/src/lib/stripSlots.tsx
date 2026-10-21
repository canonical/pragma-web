import { ErrorBoundary, makeLensContext } from "@canonical/prism-core";
import { useRouterState } from "@canonical/router-react";
import type React from "react";
import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import type { DefinitionsExplorerQuery } from "../__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../__generated__/DefinitionsExplorerQuery.graphql.js";
import {
  buildDefinitionsExplorerVariables,
  readTermParam,
} from "./definitionsQuery.js";
import { ExplorerControls } from "./ExplorerControls/index.js";
import { ExplorerStatus } from "./ExplorerStatus/index.js";
import { useLensFilter } from "./LensFilter/index.js";
import {
  classifyAbstraction,
  matchesChips,
  resolveFilter,
} from "./lensFilter.js";

/**
 * The Definitions lens's mode-strip tenants — the components
 * `DefinitionsLayout` renders into the strip's `context`, `controls` and
 * `status` sockets.
 *
 * They take NO props: the layout renders them as siblings of the routed
 * page, so nothing the page holds can reach them as a prop. The FILTER
 * reaches them through `LensFilter` (see that module for why a
 * context is the smallest bridge between the strip and the page).
 *
 * THE DATA does NOT come through that context, and the reason is the SSR
 * determinism rule. An announcement from the explorer could only arrive in
 * an effect — client-only, after paint — so the strip would render empty
 * on the server and populated on the client: a hydration mismatch in the
 * strip itself. Instead these components read the SAME operation the
 * explorer reads, from the same warm store: the layout renders inside
 * `RelayEnvironmentProvider`, and the route's prepare step has already
 * executed and serialised exactly this query. The read is a store hit on
 * both sides, the markup matches, and no second network request exists —
 * the one-operation-per-page register holds, because this is the same
 * operation with the same variables, not another one.
 *
 * THE STRIP MUST NEVER DEPEND ON WARM DATA. `useLazyLoadQuery` SUSPENDS on
 * a cold store, and these components render in the layout — outside any
 * page-level boundary. Unguarded, a cold render (a failed prepare step, a
 * graph that did not answer) suspends the whole layout and takes the
 * rail, the strip and the canvas down with it. So each socket carries its
 * OWN Suspense and error
 * boundary, both falling back to nothing: an empty socket is the honest
 * rendering of "the graph did not answer", and the strip band (AX.6)
 * stays intact either way.
 */

/** Read the current term exactly as the page does, so the strip's query
 * variables match the explorer's and hit the same warm store entry. */
const useCurrentTerm = (): string | undefined => {
  const { match } = useRouterState();
  return readTermParam(
    match?.kind === "route"
      ? (match.params as Readonly<Record<string, unknown>>)
      : {},
  );
};

/**
 * Wrap a socket so it can never take the layout down: it renders its
 * content when the store is warm, and nothing at all otherwise.
 */
const guardSocket = (
  Content: React.ComponentType,
): (() => React.ReactElement) => {
  const Guarded = (): React.ReactElement => (
    <ErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </ErrorBoundary>
  );
  return Guarded;
};

/**
 * The chip toolbar. The ontologies are labelled by their own prefixes —
 * the vocabulary readers already meet in term addresses — so nothing here
 * invents a display name the graph does not have.
 */
const ControlsContent = (): React.ReactElement => {
  const term = useCurrentTerm();
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(term),
  );
  const { filter, setFilter } = useLensFilter();
  const prefixes = data.ontologies.map((ontology) => ontology.prefix);

  return (
    <ExplorerControls
      filter={resolveFilter(filter, prefixes)}
      namespaceLabels={prefixes.map((prefix) => ({ prefix, label: prefix }))}
      onFilterChange={setFilter}
    />
  );
};

/**
 * The status figure: how many classes the current filter shows, out of how
 * many exist, and how many of those are abstract. It counts with the SAME
 * predicate the well hides by, over the same query data and through the
 * same `resolveFilter`, so the figure and the graph cannot disagree.
 */
const StatusContent = (): React.ReactElement => {
  const term = useCurrentTerm();
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(term),
  );
  const { filter } = useLensFilter();
  const prefixes = data.ontologies.map((ontology) => ontology.prefix);
  const effective = resolveFilter(filter, prefixes);

  const census = data.ontologies.flatMap((ontology) =>
    ontology.classes.map((klass) => ({
      prefix: ontology.prefix,
      isAbstract: klass.isAbstract,
    })),
  );
  const visible = census.filter((entry) =>
    matchesChips(effective, entry.isAbstract, entry.prefix),
  );
  const abstractCount = visible.filter(
    (entry) => classifyAbstraction(entry.isAbstract) === "abstract",
  ).length;

  return (
    <ExplorerStatus
      abstract={abstractCount}
      total={census.length}
      visible={visible.length}
    />
  );
};

/**
 * The context tenant: the breadcrumb trail. `Definitions` on the explorer,
 * `Definitions / <term>` on a term view — the term crumb is the `:term`
 * route param (the prefixed URI), URL-derived, so this reads no query and
 * needs no Suspense guard (unlike the chip toolbar and the figure above).
 */
const Context = makeLensContext({
  lensRouteName: "definitions",
  paramKey: "term",
});

export const definitionsStripSlots = {
  Context,
  Controls: guardSocket(ControlsContent),
  Status: guardSocket(StatusContent),
} as const;
