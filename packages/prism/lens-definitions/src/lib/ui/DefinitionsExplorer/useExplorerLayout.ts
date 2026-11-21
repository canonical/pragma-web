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
  /** The input and the budget, written out: what the maps are laid out of. */
  readonly key: string;
  readonly budget: GraphBudget;
  readonly input: ClassGraphInput;
  readonly maps: Map<string, ClassGraphLayout>;
}

/**
 * The last maps laid out. The canvas and the inspector each read the
 * page's one operation, as equal data but not the same objects, so the
 * maps are kept by what they are laid out of: the page lays its map out
 * once for both, and the memory holds one page's maps at most.
 */
const LAST_LAID_OUT: { current?: LaidOutMaps } = {};

/**
 * Read the maps laid out over an input within a budget: the last ones
 * when they were laid out of the same, else fresh ones, kept as the last.
 *
 * @note Impure: reads and writes `LAST_LAID_OUT`.
 */
function readLaidOutMaps(
  input: ClassGraphInput,
  budget: GraphBudget,
): LaidOutMaps {
  const key = JSON.stringify([input, budget]);
  const last = LAST_LAID_OUT.current;
  if (last?.key === key) return last;
  const fresh = {
    key,
    budget,
    input,
    maps: new Map<string, ClassGraphLayout>(),
  };
  LAST_LAID_OUT.current = fresh;
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
    () => readLaidOutMaps(buildClassGraphInput(ontologies, edges), budget),
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
