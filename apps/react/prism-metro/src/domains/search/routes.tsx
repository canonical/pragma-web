import {
  DocumentLayout,
  ErrorBoundary,
  ModeStrip,
  type ViewSearch,
  viewSearch,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { type ReactElement, Suspense } from "react";
import { MetroRail } from "#domains/lenses";
import { useMessages } from "#i18n";
import { SearchPage } from "./lib/index.js";
import readSearchText from "./readSearchText.js";
import warmSearch from "./warmSearch.js";

/**
 * The search route's content: the document archetype with the metro rail
 * and an empty strip, and the page for the address's text inside its own
 * error boundary and Suspense, so the rail stands while the results load.
 */
const SearchContent = ({
  search,
}: {
  readonly search: ViewSearch;
}): ReactElement => {
  const t = useMessages();
  return (
    <DocumentLayout rail={<MetroRail />} strip={<ModeStrip />}>
      <ErrorBoundary
        fallback={
          <p className="error" role="alert">
            {t("search.error")}
          </p>
        }
      >
        <Suspense fallback={<p className="loading">{t("search.loading")}</p>}>
          <SearchPage text={readSearchText(search)} />
        </Suspense>
      </ErrorBoundary>
    </DocumentLayout>
  );
};

/**
 * The search route: `search`, at `/search`, whose text is the `q`
 * parameter and whose data reaches the store through `warm: warmSearch`.
 * It declares no lens facet: search is not a lens. The site's table lists
 * it only when the site's provider serves the `search` extension.
 */
export const searchRoutes = {
  search: route({
    url: "/search",
    search: viewSearch,
    content: SearchContent,
    warm: warmSearch,
  }),
} as const;
