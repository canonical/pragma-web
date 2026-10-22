// The application's own sheet first: the order the bundler evaluates style
// imports in is the order the rules are emitted in. The design system's
// layers reach the browser through the client bundle's stylesheet, which the
// renderer links from the built HTML.
import "../styles/app.css";
import { createEnvironment, createStaticRouter } from "@canonical/prism-core";
import type { ServerEntrypointProps } from "@canonical/react-ssr/renderer";
import { Shell } from "#shell";
import { appRoutes, notFoundRoute } from "../routes.js";
import selectRoutableUrl from "./selectRoutableUrl.js";
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
 * The cookie-resolved theme is painted on `<html>` beside the root
 * declaration, so the first paint matches the reader's preference; React
 * hydrates only `#root`, so the element is never reconciled.
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
    <html
      className={["app comfortable", initialData.theme]
        .filter(Boolean)
        .join(" ")}
      lang={props.lang}
    >
      <head>
        {props.otherHeadElements}
        {props.scriptElements}
        {props.linkElements}
      </head>
      <body>
        <div id="root">
          <Shell environment={relayEnvironment} router={router} />
        </div>
      </body>
    </html>
  );
}
