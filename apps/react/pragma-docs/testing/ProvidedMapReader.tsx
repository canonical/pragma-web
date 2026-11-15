import {
  type ProjectionMaps,
  useProjectionMaps,
} from "@canonical/prism-projections";

/** Props accepted by `ProvidedMapReader`. */
export interface ProvidedMapReaderProps {
  /** The form whose map the reader takes from the provider. */
  readonly form: keyof ProjectionMaps;
}

/**
 * Read one form's map from the projection provider in scope, and render
 * nothing. A site's switch renders its own types' arms without the maps
 * and reaches them only in its default, the package's switch; set beside
 * the switch in a coverage case, the reader proves to `expectSwitchCoverage`
 * that the provider holds the maps `guardTypedArms` returned, so the
 * default, had the switch no case for a type, would meet a guarded arm.
 *
 * @note Impure: reads the projection provider's maps.
 */
export default function ProvidedMapReader({
  form,
}: ProvidedMapReaderProps): null {
  void useProjectionMaps()[form];
  return null;
}
