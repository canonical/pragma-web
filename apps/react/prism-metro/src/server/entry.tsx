// The application's own sheet first: the order the bundler evaluates style
// imports in is the order the rules are emitted in. The design system's
// layers reach the browser through the client bundle's stylesheet, which the
// renderer links from the built HTML.
import "../styles/app.css";
import { createEnvironment, createStaticRouter } from "@canonical/prism-core";
import type { ServerEntrypointProps } from "@canonical/react-ssr/renderer";
import { Shell, SiteDocument } from "#lib/ui";
import { appRoutes, notFoundRoute } from "../routes.js";
import selectRoutableUrl from "../selectRoutableUrl.js";
import type { InitialData } from "./types.js";

/**
 * The server render of the app: the document around `Shell`, with a static
 * router at the request's URL (the not-found page for a path that does not
 * percent-decode) and a fresh Relay environment seeded from the prepare
 * step's records, the same bytes the client hydrates from.
 *
 * The environment's network always rejects. The prepare step has already
 * run, so a render that misses the store disagrees with it about an
 * operation or its variables; the rejection lands in the suspended
 * boundary's error state instead of reaching the graph mid-render.
 *
 * The document is `SiteDocument`, which the client hydrates whole, so the
 * server and the client render one tree. The cookie-resolved theme travels
 * in the initial data and is painted on `<html>` beside the site's context,
 * so the first paint matches the reader's preference, and the client renders
 * the same class from the same data.
 *
 * @param props - The renderer's entry props: the initial data and the head
 *   elements of the HTML shell.
 * @returns The whole document.
 */
export default function EntryServer(props: ServerEntrypointProps<InitialData>) {
  const initialData = props.initialData ?? {};
  const url = initialData.url ?? "/";
  const router = createStaticRouter(appRoutes, selectRoutableUrl(url), {
    notFound: notFoundRoute,
  });
  const relayEnvironment = createEnvironment({
    records: initialData.relay?.records,
    fetchFn: (params) =>
      Promise.reject(
        new Error(
          `no server-side GraphQL network: operation ${params.name} was not ` +
            "served from the prepared store",
        ),
      ),
  });
  return (
    <SiteDocument
      head={[props.otherHeadElements, props.scriptElements, props.linkElements]}
      lang={props.lang}
      theme={initialData.theme}
    >
      <Shell environment={relayEnvironment} router={router} />
    </SiteDocument>
  );
}
