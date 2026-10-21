import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createOperationDescriptor, getRequest } from "relay-runtime";
import type { createReferencesPageQuery } from "../src/__generated__/createReferencesPageQuery.graphql.js";
import createReferencesPageQueryNode from "../src/__generated__/createReferencesPageQuery.graphql.js";
import { ProseReferencesProvider } from "../src/lib/markdown/index.js";
import createSiteTree, {
  createStoreOnlyEnvironment,
} from "./createSiteTree.js";
import { PROSE_REFERENCES, REFERENCING_CLASS_URI } from "./fixtures.js";

/** The test operation: the references a class page's prose links to. */
const createReferencesPageQuerySource = (): unknown => graphql`
  query createReferencesPageQuery($uri: String!) {
    ontologyClass(uri: $uri) {
      instances {
        ...ProseReferencesProvider_references
      }
    }
  }
`;
void createReferencesPageQuerySource;

/**
 * Build the page that renders `prose` under `PROSE_REFERENCES`, provided
 * through `ProseReferencesProvider` beneath the providers a site mounts.
 * The references are committed to the store first, so nothing fetches.
 *
 * @note Impure: it commits the references to a fresh Relay store.
 */
export default function createReferencesPage(
  prose: ReactElement,
): ReactElement {
  const environment = createStoreOnlyEnvironment();
  const variables = { uri: REFERENCING_CLASS_URI };
  environment.commitPayload(
    createOperationDescriptor(
      getRequest(createReferencesPageQueryNode),
      variables,
    ),
    {
      ontologyClass: {
        uri: REFERENCING_CLASS_URI,
        instances: structuredClone(PROSE_REFERENCES),
      },
    },
  );
  const Probe = (): ReactElement => {
    const data = useLazyLoadQuery<createReferencesPageQuery>(
      createReferencesPageQueryNode,
      variables,
      { fetchPolicy: "store-only" },
    );
    if (data.ontologyClass == null) {
      throw new Error("createReferencesPage: the store lost the class");
    }
    return (
      <ProseReferencesProvider references={data.ontologyClass.instances}>
        {prose}
      </ProseReferencesProvider>
    );
  };
  return createSiteTree(environment, <Probe />);
}
