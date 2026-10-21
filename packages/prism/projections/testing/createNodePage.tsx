import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createOperationDescriptor, getRequest } from "relay-runtime";
import type {
  createNodePageQuery,
  createNodePageQuery$data,
} from "../src/__generated__/createNodePageQuery.graphql.js";
import createNodePageQueryNode from "../src/__generated__/createNodePageQuery.graphql.js";
import createSiteTree, {
  createStoreOnlyEnvironment,
  type SiteTreeOptions,
} from "./createSiteTree.js";
import type { NodePayload } from "./types.js";

/** The test operation: one node, read through every representation. */
const createNodePageQuerySource = (): unknown => graphql`
  query createNodePageQuery($id: ID!) {
    node(id: $id) {
      ...EntityChip_node
    }
  }
`;
void createNodePageQuerySource;

/** The node key the query reads, as every representation takes it. */
export type NodeKey = NonNullable<createNodePageQuery$data["node"]>;

/**
 * Build the page that renders what `renderNode` makes of `node`'s fragment
 * key, under the providers a site mounts. The node is committed to the
 * store first, so nothing fetches; the tree renders on the client and on
 * the server alike.
 *
 * @note Impure: it commits `node` to a fresh Relay store.
 */
export default function createNodePage(
  node: NodePayload,
  renderNode: (key: NodeKey) => ReactElement,
  options?: SiteTreeOptions,
): ReactElement {
  const environment = createStoreOnlyEnvironment();
  const variables = { id: node.uri };
  environment.commitPayload(
    createOperationDescriptor(getRequest(createNodePageQueryNode), variables),
    { node: { ...node } },
  );
  const Probe = (): ReactElement => {
    const data = useLazyLoadQuery<createNodePageQuery>(
      createNodePageQueryNode,
      variables,
      { fetchPolicy: "store-only" },
    );
    if (data.node == null) {
      throw new Error("createNodePage: the store lost the node");
    }
    return renderNode(data.node);
  };
  return createSiteTree(environment, <Probe />, options);
}
