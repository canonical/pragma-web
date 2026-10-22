/**
 * The metro graph: `@canonical/prism-graph-example`'s provider served over
 * HTTP in its own process, at `DEFAULT_GRAPHQL_URL` (or on `GRAPH_PORT`).
 *
 * The provider and its fetch handler are the package's; what this file adds
 * is transport: the listen address, the one path it answers and a JSON 404
 * for every other, so a client pointed here by mistake fails on the content
 * type instead of parsing a page. It binds the loopback address the URL
 * names, because the handler serves GraphiQL and permissive CORS outside
 * production.
 */
import {
  createExampleHandler,
  createExampleProvider,
  GRAPHQL_PATH,
} from "@canonical/prism-graph-example";
import { DEFAULT_GRAPHQL_URL } from "#relay";

const defaultUrl = new URL(DEFAULT_GRAPHQL_URL);
const port = Number(process.env.GRAPH_PORT) || Number(defaultUrl.port);
const endpoint = `http://${defaultUrl.hostname}:${port}${GRAPHQL_PATH}`;
const handler = createExampleHandler(createExampleProvider(), { endpoint });

Bun.serve({
  hostname: defaultUrl.hostname,
  port,
  fetch: (request: Request): Promise<Response> | Response => {
    const { pathname } = new URL(request.url);
    if (pathname !== GRAPHQL_PATH) {
      return Response.json(
        {
          errors: [
            {
              message: `${pathname} is not served here; the metro graph serves only ${GRAPHQL_PATH}`,
            },
          ],
        },
        { status: 404 },
      );
    }
    return handler(request);
  },
});

console.info(`[graph] serving ${endpoint}`);
