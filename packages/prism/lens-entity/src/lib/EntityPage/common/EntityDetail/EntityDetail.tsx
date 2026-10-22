import { Head } from "@canonical/react-head";
import type { ReactElement } from "react";
import { useLazyLoadQuery } from "react-relay";
import type { EntityNamespacesQuery } from "../../../../__generated__/EntityNamespacesQuery.graphql.js";
import entityNamespacesQueryNode from "../../../../__generated__/EntityNamespacesQuery.graphql.js";
import type { EntityPageQuery } from "../../../../__generated__/EntityPageQuery.graphql.js";
import entityPageQueryNode from "../../../../__generated__/EntityPageQuery.graphql.js";
import buildEntityPageVariables from "../../../buildEntityPageVariables.js";
import { Message, useMessages } from "../../../i18n/index.js";
import isInstanceOf from "../../../isInstanceOf.js";
import { EntitySummary } from "../EntitySummary/index.js";
import { FieldsTable } from "../FieldsTable/index.js";
import { Relations } from "../Relations/index.js";
import type { EntityDetailProps } from "./types.js";

/**
 * The entity page's data-reading interior: it reads the graph's namespaces,
 * then the page's operation with the address expanded through them, both
 * from the store the route's warm filled and with the same builders, and
 * renders the entity or the not-found status.
 *
 * It renders no element of its own: its parts sit directly in the page's
 * section, beside the document title it sets.
 *
 * `import { EntityDetail } from "./common/EntityDetail/index.js";`
 */
export default function EntityDetail({
  binding,
  label,
  uri,
}: EntityDetailProps): ReactElement {
  const t = useMessages();
  const { ontologies } = useLazyLoadQuery<EntityNamespacesQuery>(
    entityNamespacesQueryNode,
    {},
  );
  const { node, ontologyClass } = useLazyLoadQuery<EntityPageQuery>(
    entityPageQueryNode,
    buildEntityPageVariables(binding, uri, ontologies),
  );

  if (
    ontologyClass === null ||
    ontologyClass === undefined ||
    node === null ||
    node === undefined ||
    !isInstanceOf(node._meta.type, ontologyClass.uri)
  ) {
    return (
      <>
        <Head title={t("page.title.entity", { title: uri, lens: label })} />
        <p className="not-found" role="status">
          <Message
            elements={{ address: <code>{uri}</code> }}
            id="page.notFound"
          />
        </p>
      </>
    );
  }

  return (
    <>
      <Head
        title={t("page.title.entity", { title: node._meta.title, lens: label })}
      />
      <hgroup className="heading">
        <h1 className="title">{node._meta.title}</h1>
        <p className="location">
          <code>{node._meta.curie}</code>
        </p>
      </hgroup>
      <EntitySummary node={node} />
      <FieldsTable meta={node._meta} namespaces={ontologies} />
      <Relations meta={node._meta} namespaces={ontologies} />
    </>
  );
}
