import { useGraphBudget } from "@canonical/prism-core";
import { useMemo } from "react";
import type { DefinitionsExplorer_ontologies$data } from "../../../__generated__/DefinitionsExplorer_ontologies.graphql.js";
import chooseAddressDrill from "../../classGraph/chooseAddressDrill.js";
import chooseSelectionDrill from "../../classGraph/chooseSelectionDrill.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import type {
  ClassEdgeInput,
  ClassGraphLayout,
} from "../../classGraph/types.js";
import compactUri from "../../compactUri.js";
import buildClassGraphInput from "./buildClassGraphInput.js";

/**
 * Lay the explorer's class graph out within the site's graph budget, the
 * same on the server and in the browser: the overview at rest; the
 * namespace the address's `expand=` names drilled into; or, on a term page
 * of a class the overview draws inside a collapsed namespace's box, that
 * namespace drilled into, so the class is drawn. A term page ignores
 * `expand=`, and a prefix naming no namespace draws the overview at rest.
 *
 * @param ontologies - The explorer's fragment data.
 * @param edges - The class edges the store holds.
 * @param term - The selected term, compact, if any.
 * @param expand - The address's `expand=` parameter, if any.
 * @returns The layout and each class's compact term, by IRI.
 * @note Impure: reads the graph budget from its provider.
 */
export default function useExplorerLayout(
  ontologies: DefinitionsExplorer_ontologies$data,
  edges: readonly ClassEdgeInput[],
  term: string | undefined,
  expand?: string,
): {
  readonly layout: ClassGraphLayout;
  readonly terms: ReadonlyMap<string, string>;
} {
  // The site's budget, from its provider: never the URL nor a setting.
  const budget = useGraphBudget();
  const input = useMemo(
    () => buildClassGraphInput(ontologies, edges),
    [ontologies, edges],
  );
  const rest = useMemo(
    () => layOutClassGraph(input, { budget }),
    [input, budget],
  );
  const terms = useMemo(
    () =>
      new Map(
        ontologies.flatMap((ontology) =>
          ontology.classes.map((klass) => [
            klass.uri,
            compactUri(klass.uri, [ontology]),
          ]),
        ),
      ),
    [ontologies],
  );
  const selected =
    term === undefined
      ? undefined
      : [...terms].find(([, compact]) => compact === term)?.[0];
  const drill =
    chooseAddressDrill(input, expand, term) ??
    chooseSelectionDrill(input, rest, selected);
  const layout = useMemo(
    () =>
      drill === undefined ? rest : layOutClassGraph(input, { budget, drill }),
    [budget, drill, input, rest],
  );
  return { layout, terms };
}
