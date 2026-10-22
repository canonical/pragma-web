import { makeLensContext } from "@canonical/prism-core";
import type { ReactElement } from "react";
import { useMessages } from "../../../i18n/index.js";

const LensContext = makeLensContext({
  lensRouteName: "standards",
  paramKey: "uri",
});

/**
 * The strip's `context` tenant: the breadcrumb trail. `Standards` on the
 * index, `Standards / <uri>` on a reading page. The reading crumb is the
 * `:uri` route param (the standard's absolute IRI), read off the URL, so the
 * trail reads no query.
 *
 * `import { Trail } from "./common/Trail/index.js";`
 */
export default function Trail(): ReactElement {
  const t = useMessages();
  return <LensContext lensLabel={t("lens.label")} />;
}
