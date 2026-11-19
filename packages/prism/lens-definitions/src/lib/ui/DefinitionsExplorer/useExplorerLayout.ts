import { type GraphBudget, useGraphBudget } from "@canonical/prism-core";
import { useMemo } from "react";
import type { DefinitionsExplorer_ontologies$data } from "../../../__generated__/DefinitionsExplorer_ontologies.graphql.js";
import chooseAddressDrill from "../../classGraph/chooseAddressDrill.js";
import layOutClassGraph from "../../classGraph/layOutClassGraph.js";
import type {
  ClassEdgeInput,
  ClassGraphInput,
  ClassGraphLayout,
} from "../../classGraph/types.js";
import compactUri from "../../compactUri.js";
import buildClassGraphInput from "./buildClassGraphInput.js";

/** A page's graph input and the maps laid out over it, by drill. */
interface LaidOutMaps {
  readonly budget: GraphBudget;
  readonly input: ClassGraphInput;
  readonly maps: Map<string, ClassGraphLayout>;
}

/**
 * The maps laid out, by the operation's ontologies and class edges: the
 * canvas and the inspector read one operation from one store, so a page
 * lays its map out once for both. Weakly held: it goes with the store's
 * data.
 */
const LAID_OUT = new WeakMap<
  DefinitionsExplorer_ontologies$data,
  WeakMap<readonly ClassEdgeInput[], LaidOutMaps>
>();

/**
 * Read the input and maps laid out over an operation's data within a
 * budget, starting them when none are kept for it.
 *
 * @note Impure: reads and writes the module's `LAID_OUT`.
 */
function readLaidOutMaps(
  ontologies: DefinitionsExplorer_ontologies$data,
  edges: readonly ClassEdgeInput[],
  budget: GraphBudget,
): LaidOutMaps {
  const byEdges = LAID_OUT.get(ontologies) ?? new WeakMap();
  LAID_OUT.set(ontologies, byEdges);
  const kept = byEdges.get(edges);
  if (kept !== undefined && kept.budget === budget) return kept;
  const fresh = {
    budget,
    input: buildClassGraphInput(ontologies, edges),
    maps: new Map<string, ClassGraphLayout>(),
  };
  byEdges.set(edges, fresh);
  return fresh;
}

/**
 * Lay the map out at rest or drilled into a namespace, once per input:
 * a second reader of the same data gets the first's layout.
 *
 * @note Impure: reads and writes the maps' memory.
 */
function layOutMap(
  { budget, input, maps }: LaidOutMaps,
  drill: string | undefined,
): ClassGraphLayout {
  const key = drill ?? "";
  const kept = maps.get(key);
  if (kept !== undefined) return kept;
  const map = layOutClassGraph(
    input,
    drill === undefined ? { budget } : { budget, drill },
  );
  maps.set(key, map);
  return map;
}

/**
 * Lay the explorer's class graph out within the site's graph budget, the
 * same on the server and in the browser. The map is the overview at rest,
 * or the namespace the address's `expand=` names drilled into; a term
 * page ignores `expand=`, and a prefix naming no namespace draws the
 * overview at rest. The canvas draws the map, or, on the term page of a
 * class, that class's one-hop neighbourhood across namespaces; the rail
 * keeps the map's order.
 *
 * @param ontologies - The explorer's fragment data.
 * @param edges - The class edges the store holds.
 * @param term - The selected term, compact, if any.
 * @param expand - The address's `expand=` parameter, if any.
 * @returns The canvas's layout, the rail's, and each class's and
 *   property's compact term, by IRI.
 * @note Impure: reads the graph budget from its provider, and keeps the
 *   maps it lays out for the next reader of the same data.
 */
export default function useExplorerLayout(
  ontologies: DefinitionsExplorer_ontologies$data,
  edges: readonly ClassEdgeInput[],
  term: string | undefined,
  expand?: string,
): {
  readonly layout: ClassGraphLayout;
  readonly rail: ClassGraphLayout;
  readonly terms: ReadonlyMap<string, string>;
} {
  // The site's budget, from its provider: never the URL nor a setting.
  const budget = useGraphBudget();
  const laidOut = useMemo(
    () => readLaidOutMaps(ontologies, edges, budget),
    [ontologies, edges, budget],
  );
  const { input } = laidOut;
  const rest = useMemo(() => layOutMap(laidOut, undefined), [laidOut]);
  const classTerms = useMemo(
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
  // A count's numeral links to its property's term page.
  const terms = useMemo(
    () =>
      new Map([
        ...classTerms,
        ...ontologies.flatMap((ontology) =>
          ontology.properties.map(
            (property) =>
              [property.uri, compactUri(property.uri, [ontology])] as const,
          ),
        ),
      ]),
    [classTerms, ontologies],
  );
  const selected =
    term === undefined
      ? undefined
      : [...classTerms].find(([, compact]) => compact === term)?.[0];
  const drill = chooseAddressDrill(input, expand, term);
  const rail = useMemo(
    () => (drill === undefined ? rest : layOutMap(laidOut, drill)),
    [drill, laidOut, rest],
  );
  const layout = useMemo(
    () =>
      selected === undefined
        ? rail
        : layOutClassGraph(input, { budget, focus: selected }),
    [budget, input, rail, selected],
  );
  return { layout, rail, terms };
}
