import type { RelayParameters } from "@canonical/storybook-addon-relay";

/** The one operation an entity lens's index page issues. */
const ENTITY_INDEX_QUERY = "EntityIndexQuery";

/**
 * Build a story's `parameters.relay.generateFunction` that answers an entity
 * lens's index query with exactly one entry, of the concrete type given.
 *
 * The mock payload generator cannot pick the concrete type of an edge typed
 * by the `Node` interface: without test metadata compiled into the query it
 * gives every abstract field a placeholder type name, so the site's
 * projection maps would dispatch the entry to the `Node` arm. This answer
 * spells the whole payload instead: the bound class, a count of one, the
 * entry with its type name, its address, its title, its compact address, no
 * definition, and its class titled by the type name, and no further page.
 *
 * @param entry - The one instance the index lists.
 * @returns The payload builder. It throws on any other operation, so a story
 *   that issues one fails visibly instead of rendering a placeholder.
 *
 * @example
 * ```ts
 * parameters: {
 *   relay: {
 *     generateFunction: answerEntityIndexQuery({
 *       typename: "Line",
 *       uri: "https://metro.example/onto#north-line",
 *       title: "North Line",
 *       curie: "metro:north-line",
 *       typeUri: "https://metro.example/onto#Line",
 *     }),
 *   },
 * }
 * ```
 */
export default function answerEntityIndexQuery(entry: {
  readonly typename: string;
  readonly uri: string;
  readonly title: string;
  readonly curie: string;
  readonly typeUri: string;
}): NonNullable<RelayParameters["generateFunction"]> {
  return (operation) => {
    const name = operation.request.node.params.name;
    if (name !== ENTITY_INDEX_QUERY) {
      throw new Error(`The story answers ${ENTITY_INDEX_QUERY}, not ${name}.`);
    }
    return {
      data: {
        ontologyClass: {
          uri: operation.request.variables.classUri,
          instanceCount: 1,
          instances: {
            edges: [
              {
                cursor: entry.uri,
                node: {
                  __typename: entry.typename,
                  __isNode: entry.typename,
                  uri: entry.uri,
                  _meta: {
                    title: entry.title,
                    curie: entry.curie,
                    definition: null,
                    type: {
                      uri: entry.typeUri,
                      _meta: { title: entry.typename },
                    },
                  },
                },
              },
            ],
            pageInfo: { endCursor: entry.uri, hasNextPage: false },
          },
        },
      },
    };
  };
}
