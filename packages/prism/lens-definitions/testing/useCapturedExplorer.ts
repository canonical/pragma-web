import { useMemo } from "react";
import { useFragment, useLazyLoadQuery } from "react-relay";
import type { DefinitionsExplorer_ontologies$key } from "../src/__generated__/DefinitionsExplorer_ontologies.graphql.js";
import explorerFragmentNode from "../src/__generated__/DefinitionsExplorer_ontologies.graphql.js";
import type {
  DefinitionsExplorerQuery,
  DefinitionsExplorerQuery$data,
} from "../src/__generated__/DefinitionsExplorerQuery.graphql.js";
import definitionsExplorerQueryNode from "../src/__generated__/DefinitionsExplorerQuery.graphql.js";
import layOutClassGraph from "../src/lib/classGraph/layOutClassGraph.js";
import type { ClassGraphLayout } from "../src/lib/classGraph/types.js";
import compactUri from "../src/lib/compactUri.js";
import { buildDefinitionsExplorerVariables } from "../src/lib/definitionsQuery.js";
import buildClassGraphInput from "../src/lib/ui/DefinitionsExplorer/buildClassGraphInput.js";

/** The explorer's operation read from the store, and its graph laid out. */
export interface CapturedExplorer {
  readonly data: DefinitionsExplorerQuery$data;
  readonly layout: ClassGraphLayout;
  /** Each class's compact term, by IRI. */
  readonly terms: ReadonlyMap<string, string>;
}

/**
 * Read the explorer's operation at `term` from the store and lay its class
 * graph out as the explorer does, so a part of the explorer can be mounted
 * alone over a captured store.
 *
 * @param term - The selected term, or undefined for the explorer.
 * @returns The operation's data, the layout and the terms.
 * @note Impure: reads the Relay store, suspending while it does not hold
 *   the operation.
 */
export default function useCapturedExplorer(term?: string): CapturedExplorer {
  const data = useLazyLoadQuery<DefinitionsExplorerQuery>(
    definitionsExplorerQueryNode,
    buildDefinitionsExplorerVariables(term),
  );
  const graph = useFragment<DefinitionsExplorer_ontologies$key>(
    explorerFragmentNode,
    data.ontologies,
  );
  const layout = useMemo(
    () => layOutClassGraph(buildClassGraphInput(graph)),
    [graph],
  );
  const terms = useMemo(
    () =>
      new Map(
        graph.flatMap((ontology) =>
          ontology.classes.map((klass) => [
            klass.uri,
            compactUri(klass.uri, [ontology]),
          ]),
        ),
      ),
    [graph],
  );
  return { data, layout, terms };
}
