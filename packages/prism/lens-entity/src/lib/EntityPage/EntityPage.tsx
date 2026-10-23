import { ErrorBoundary } from "@canonical/prism-core";
import { type ReactElement, Suspense } from "react";
import { graphql } from "react-relay";
import { useMessages } from "../i18n/index.js";
import { EntityDetail } from "./common/EntityDetail/index.js";
import type { EntityPageProps } from "./types.js";
import "./styles.css";

/* v8 ignore start -- relay-compiler reads these tags; nothing calls them at runtime */
/**
 * Codegen source of truth for the entity route's two operations. Nothing
 * calls it: the page reads the compiled artifacts, because an evaluated tag
 * throws at module scope wherever no Relay transform has run.
 *
 * `EntityNamespacesQuery` is the graph's prefix inventory, which expands the
 * route's compact address into the absolute IRI `node(id:)` accepts. One
 * extra request on the first entity a reader opens; the store answers it
 * after that.
 *
 * `EntityPageQuery` reads the node and the bound class side by side.
 * `node(id:)` resolves ANY node, so the page checks the node's class (and
 * its superclasses) against the bound class before it renders anything:
 * that is what keeps a line from rendering under the stations lens. The
 * class facts the check reads, and the title the document title reads, ride
 * the root beside the masked spreads.
 */
const declareEntityPageQueries = (): unknown => [
  graphql`
    query EntityNamespacesQuery {
      ontologies {
        prefix
        namespace
      }
    }
  `,
  graphql`
    query EntityPageQuery($id: ID!, $classUri: String!) {
      ontologyClass(uri: $classUri) {
        uri
      }
      node(id: $id) {
        uri
        _meta {
          title
          curie
          type {
            uri
            superclasses {
              uri
            }
          }
          ...FieldsTable_meta
          ...Relations_meta
        }
        ...EntitySummary_node
      }
    }
  `,
];
void declareEntityPageQueries;
/* v8 ignore stop */

const componentCssClassName = "ds entity-page";

/**
 * The lens's entity route content (`/${id}/:uri`, the route `${id}Entity`):
 * one instance of the bound class, with its title and compact address, its
 * definition and comment, its class, the fields its class declares and the
 * relations among them.
 *
 * The address may be compact (`metro:northgate`, the form the site's homes
 * build links from) or absolute. An address nothing in the graph answers to,
 * and a node that is not an instance of the bound class, render a not-found
 * status in the canvas: the address space is the graph's, not the router's.
 *
 * The page's one heading is the entity's title, which the data carries, so
 * it renders inside the boundaries; the page keeps its own error boundary
 * and Suspense, so suspension never reaches the router's outlet, which would
 * swap the whole layout for the fallback.
 *
 * `import { EntityPage } from "@canonical/prism-lens-entity";`
 */
export default function EntityPage({
  binding,
  className,
  label,
  uri,
  ...props
}: EntityPageProps): ReactElement {
  const t = useMessages();
  return (
    <section
      {...props}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
    >
      <ErrorBoundary
        fallback={<p role="alert">{t("page.error")}</p>}
        resetKey={uri}
      >
        <Suspense fallback={<p className="loading">{t("page.loading")}</p>}>
          <EntityDetail binding={binding} label={label} uri={uri} />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
