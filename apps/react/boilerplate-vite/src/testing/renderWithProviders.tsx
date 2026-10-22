import { I18nProvider } from "@canonical/i18n-react";
import { HeadProvider } from "@canonical/react-head";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import formatDocumentTitle from "../formatDocumentTitle.js";
import { catalogs, i18nConfig } from "../i18n/index.js";
import { stubRoutes } from "./fixtures.js";

/**
 * Renders `ui` under the providers both entries mount — i18n, head and the
 * router — with the router at `path`, so components that read the current
 * location or translate their labels render as they do in the app.
 *
 * Returns the render result and the router, for asserting navigation.
 */
export default function renderWithProviders(ui: ReactElement, path = "/") {
  const router = createRouter(stubRoutes, {
    adapter: createMemoryAdapter(path),
  });

  const result = render(
    <I18nProvider catalogs={catalogs} config={i18nConfig}>
      <HeadProvider titleTemplate={formatDocumentTitle}>
        <RouterProvider router={router}>{ui}</RouterProvider>
      </HeadProvider>
    </I18nProvider>,
  );

  return { ...result, router };
}
