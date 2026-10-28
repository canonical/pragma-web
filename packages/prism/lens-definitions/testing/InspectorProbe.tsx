import type { ComponentProps, ReactElement } from "react";
import TermInspector from "../src/lib/ui/TermInspector/TermInspector.js";
import useCapturedExplorer from "./useCapturedExplorer.js";

/** What the probe passes on to the inspector beyond the store's data. */
type InspectorProbeProps = { readonly term: string | undefined } & Omit<
  ComponentProps<typeof TermInspector>,
  "term" | "classRef" | "propertyRef" | "ontologies" | "namespaces"
>;

/**
 * The inspector over the store at `term`, handed the lookups and the
 * ontologies as the workspace's inspector socket hands them.
 *
 * @note Impure: reads the Relay store.
 */
export default function InspectorProbe({
  term,
  ...props
}: InspectorProbeProps): ReactElement {
  const { data } = useCapturedExplorer(term);
  return (
    <TermInspector
      {...props}
      classRef={data.ontologyClass}
      namespaces={data.ontologies.map(({ prefix, namespace }) => ({
        prefix,
        namespace,
      }))}
      ontologies={data.ontologies}
      propertyRef={data.ontologyProperty}
      term={term}
    />
  );
}
