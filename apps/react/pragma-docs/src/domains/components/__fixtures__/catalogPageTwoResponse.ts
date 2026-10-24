/**
 * The graph's answer to `CatalogListPaginationQuery` for the two
 * components after the catalog fixture's page-1 end cursor: the wire
 * shape the catalog's "Load more" receives, captured verbatim from the
 * graph server with the operation's own text. Its pageInfo says the graph
 * holds more still.
 *
 * Regenerate: boot `graph` and POST the operation's `params.text` with
 * { count: 2, cursor: <catalogRecords' handle pageInfo endCursor> }.
 */

import type { GraphQLResponse } from "relay-runtime";

const catalogPageTwoResponse = {
  data: {
    components: {
      edges: [
        {
          node: {
            uri: "https://ds.canonical.com/global.component.rich_choices_field",
            tier: {
              name: "Global",
              uri: "https://ds.canonical.com/global",
              _meta: {
                title: "Global",
              },
            },
            __isNode: "Component",
            __typename: "Component",
            _meta: {
              title: "RichChoicesField",
              curie: "ds:global.component.rich_choices_field",
              definition: null,
              type: {
                _meta: {
                  title: "Component",
                },
                uri: "https://ds.canonical.com/Component",
              },
            },
            __isUIBlock: "Component",
            version: null,
            summary:
              "A form control for selecting one or several options from a set whose choices can carry rich labels (text, icon, or richer content). It frames the set with a label, optional guidance, and validation, and supports either single-choice or multiple-choice selection.",
            inheritsFroms: {
              edges: [],
            },
            documentationStages: {
              edges: [
                {
                  node: {
                    _meta: {
                      title: "needs:definition",
                    },
                    uri: "https://ds.canonical.com/tag.needsdefinition",
                  },
                },
              ],
            },
          },
          cursor:
            "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF9jaG9pY2VzX2ZpZWxk",
        },
        {
          node: {
            uri: "https://ds.canonical.com/global.component.rich_text_field",
            tier: {
              name: "Global",
              uri: "https://ds.canonical.com/global",
              _meta: {
                title: "Global",
              },
            },
            __isNode: "Component",
            __typename: "Component",
            _meta: {
              title: "RichTextField",
              curie: "ds:global.component.rich_text_field",
              definition: null,
              type: {
                _meta: {
                  title: "Component",
                },
                uri: "https://ds.canonical.com/Component",
              },
            },
            __isUIBlock: "Component",
            version: null,
            summary:
              "Reference: [https://github.com/canonical/design-system/discussions/35](https://github.com/canonical/design-system/discussions/35)",
            inheritsFroms: {
              edges: [],
            },
            documentationStages: {
              edges: [
                {
                  node: {
                    _meta: {
                      title: "needs:definition",
                    },
                    uri: "https://ds.canonical.com/tag.needsdefinition",
                  },
                },
              ],
            },
          },
          cursor:
            "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF90ZXh0X2ZpZWxk",
        },
      ],
      pageInfo: {
        endCursor:
          "aHR0cHM6Ly9kcy5jYW5vbmljYWwuY29tL2dsb2JhbC5jb21wb25lbnQucmljaF90ZXh0X2ZpZWxk",
        hasNextPage: true,
      },
    },
  },
} as unknown as GraphQLResponse;

export default catalogPageTwoResponse;
