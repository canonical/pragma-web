import { makeLensContext } from "@canonical/prism-core";
import { type ReactElement, useMemo } from "react";
import { ENTITY_URI_PARAM } from "../../../constants.js";
import type { TrailProps } from "./types.js";

/**
 * The strip's `context` tenant: the breadcrumb trail. The lens's label on
 * the index, then `label / <address>` on an entity page, the address being
 * the route's `:uri` param as the URL carries it, so the trail reads no
 * query and needs no `SocketGuard`.
 *
 * The trail component is built once per binding: its back-link points at
 * the binding's index route, which the binding's id names.
 *
 * `import { Trail } from "./common/Trail/index.js";`
 */
export default function Trail({ binding, label }: TrailProps): ReactElement {
  const LensContext = useMemo(
    () =>
      makeLensContext({
        lensRouteName: binding.id,
        paramKey: ENTITY_URI_PARAM,
      }),
    [binding.id],
  );
  return <LensContext lensLabel={label} />;
}
