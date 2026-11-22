import {
  DocumentLayout,
  ErrorBoundary,
  FILTER_SHEET,
  FilterFold,
  FilterSheet,
  ModeStrip,
  VIEW_PARAMS,
} from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { useSearchParam } from "@canonical/router-react";
import { type ReactElement, type ReactNode, Suspense } from "react";
import { MetroRail } from "#domains/lenses";
import { useMessages } from "#i18n";
import {
  SearchCount,
  SearchFacets,
  SearchForm,
  SearchPage,
} from "./lib/index.js";
import { readSearchState, searchValues } from "./searchValues.js";
import type { SearchValues } from "./types.js";
import warmSearch from "./warmSearch.js";

/**
 * A part of the strip that reads the search from the store: it renders
 * nothing while the store lacks it or when it fails, so the strip stands.
 */
const StripPart = ({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement => (
  <ErrorBoundary fallback={null}>
    <Suspense fallback={null}>{children}</Suspense>
  </ErrorBoundary>
);

/**
 * The search route's content: the document archetype with the metro rail
 * and a strip whose Search is a form that sends its text back to this
 * page (a plain GET, so it searches without scripting) beside the count
 * of results, the Type facet in the facet bar under it, and below two
 * groups the fold to the filter sheet, which holds the count, the field
 * and the facet; then the page for
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
  const sheetOpen = useSearchParam(VIEW_PARAMS.sheet) === FILTER_SHEET;
  const hasText = state.text.trim() !== "";
  const applied = (hasText ? 1 : 0) + (state.type === undefined ? 0 : 1);
  const count = hasText ? (
    <StripPart>
      <SearchCount {...state} />
    </StripPart>
  ) : null;
  return (
    <DocumentLayout
      rail={<MetroRail />}
      strip={
        <>
          <ModeStrip
            count={count}
            fold={<FilterFold count={applied} />}
            search={<SearchForm text={state.text} />}
          />
          {hasText ? (
            <StripPart>
              <SearchFacets {...state} placement="bar" />
            </StripPart>
          ) : null}
        </>
      }
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
      <FilterSheet open={sheetOpen}>
        {sheetOpen ? (
          <>
            {count}
            <SearchForm text={state.text} />
            {hasText ? (
              <StripPart>
                <SearchFacets {...state} placement="sheet" />
              </StripPart>
            ) : null}
          </>
        ) : null}
      </FilterSheet>
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
