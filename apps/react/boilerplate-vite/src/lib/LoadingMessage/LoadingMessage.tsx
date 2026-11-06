import { useTranslation } from "@canonical/i18n-react";
import type { ReactElement } from "react";

/**
 * The route fallback both entries render while a page suspends, in the active
 * locale. The server and the client render the same one, so the streamed
 * shell hydrates without a mismatch.
 *
 * `import { LoadingMessage } from "#lib/index.js";`
 */
export default function LoadingMessage(): ReactElement {
  const { t } = useTranslation();

  return <p>{t("app.loading")}</p>;
}
