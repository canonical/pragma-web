import {
  DocumentLayout,
  ErrorBoundary,
  ModeStrip,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { type ReactElement, Suspense } from "react";
import { useMessages } from "#i18n";
import { SiteColophon, SiteRail } from "#lib/ui";
import { SearchForm, SearchPage } from "./lib/index.js";
import { readSearchState, searchValues } from "./searchValues.js";
import type { SearchValues } from "./types.js";
import warmSearch from "./warmSearch.js";

/**
 * The search route's content: the document archetype with the site rail
 * and a strip whose Search is a form that sends its text back to this
 * page (a plain GET, so it searches without scripting), and the page for
 * the address's state inside its own error boundary and Suspense, so the
 * rail and strip stand while the results load.
 */
const SearchContent = ({
  search,
}: {
  readonly search: SearchValues;
}): ReactElement => {
  const t = useMessages();
  const state = readSearchState(search);
  return (
    <DocumentLayout
      colophon={<SiteColophon />}
      rail={<SiteRail />}
      strip={<ModeStrip search={<SearchForm text={state.text} />} />}
    >
      <ErrorBoundary
        fallback={
          <p className="error" role="alert">
            {t("search.error")}
          </p>
        }
      >
        <Suspense fallback={<p className="loading">{t("search.loading")}</p>}>
          <SearchPage
            after={state.after}
            page={state.page}
            text={state.text}
            type={state.type}
          />
        </Suspense>
      </ErrorBoundary>
    </DocumentLayout>
  );
};

/**
 * The search route: `search`, at `/search`, whose text is the `q`
 * parameter, applied type `type`, cursor `after` and page `page`, and whose data reaches the store through `warm: warmSearch`.
 * It declares no lens facet: search is not a lens. The site's table lists
 * it only when the site's provider serves the `search` extension.
 */
export const searchRoutes = {
  search: route({
    url: "/search",
    search: searchValues,
    content: SearchContent,
    warm: warmSearch,
  }),
} as const;
