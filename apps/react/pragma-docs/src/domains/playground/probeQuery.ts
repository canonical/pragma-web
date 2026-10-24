/**
 * The playground probe's query contract, lifted to the route level: the
 * compiled `ComponentProbeQuery` operation and its variables, exported from
 * one module so the route's `warmPlayground` and the probe read the same
 * operation with byte-identical variables, and the probe's store read
 * matches the operation the server executed.
 *
 * This module imports the GENERATED artifact rather than declaring a tag:
 * it sits on the server bricks' native import chain (via `appRoutes`), where
 * no Vite transform rewrites tags — an untransformed tag throws at module
 * evaluation. The tag itself lives next to the probe as relay-compiler's
 * source of truth.
 */

import type { ComponentProbeQuery$variables } from "#relay/__generated__/ComponentProbeQuery.graphql.js";
import componentProbeQueryNode from "#relay/__generated__/ComponentProbeQuery.graphql.js";

/** The entity the probe renders: Button, the site's exemplar. */
export const PROBE_URI = "ds:global.component.button";

/** The compiled operation (full text under `params.text`, `id: null`). */
export { componentProbeQueryNode };

/**
 * The probe's variables: one builder, so the server-executed operation and
 * the probe's store read use identical values.
 *
 * @param uri - The component's compact address; the site's exemplar by
 *   default.
 */
export const componentProbeVariables = (
  uri: string = PROBE_URI,
): ComponentProbeQuery$variables => ({ uri });
