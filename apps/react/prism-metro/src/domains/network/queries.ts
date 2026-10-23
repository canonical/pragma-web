import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads these tags; nothing calls them at runtime */
/**
 * Codegen source of truth for the network lens's operations. Nothing calls
 * it: the warm functions and the pages read the compiled artifacts, because
 * an evaluated tag throws at module scope wherever no Relay transform has
 * run.
 *
 * `NetworkMapQuery` reads every line with its routes, each route's calls in
 * order and each stop's diagram position: all the schematic map draws, and
 * the addresses every network page resolves its own against, since the
 * routes reach every station the lens shows.
 *
 * `NetworkStationQuery` reads one stop: its facts, and every route of every
 * line serving it, in calling order, for the stops either side of it.
 *
 * `NetworkLineQuery` reads one line: its title, code and colour, and its
 * routes, each paired with its reverse, with every call's stop, the other
 * lines it meets and, at an interchange, the time a transfer takes.
 */
const declareNetworkQueries = (): unknown => [
  graphql`
    query NetworkMapQuery($classUri: String!, $first: Int!) {
      ontologyClass(uri: $classUri) {
        instances(first: $first) {
          edges {
            node {
              uri
              _meta {
                title
                curie
              }
              ... on Line {
                code
                colour
                routes {
                  label
                  isLoop
                  reverse {
                    label
                  }
                  calls {
                    position
                    stop {
                      uri
                      __typename
                      _meta {
                        title
                        curie
                      }
                      diagramPosition {
                        x
                        y
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  graphql`
    query NetworkStationQuery($id: ID!) {
      node(id: $id) {
        uri
        __typename
        _meta {
          title
          curie
        }
        ... on Stop {
          platformCount
          inZone {
            _meta {
              title
            }
          }
          servesLine {
            uri
            code
            colour
            _meta {
              title
              curie
            }
            routes {
              label
              isLoop
              calls {
                stop {
                  uri
                  _meta {
                    title
                    curie
                  }
                }
              }
            }
          }
        }
        ... on Interchange {
          transferMinutes
        }
      }
    }
  `,
  graphql`
    query NetworkLineQuery($id: ID!) {
      node(id: $id) {
        uri
        __typename
        _meta {
          title
          curie
        }
        ... on Line {
          code
          colour
          routes {
            label
            isLoop
            reverse {
              label
            }
            calls {
              position
              stop {
                uri
                __typename
                _meta {
                  title
                  curie
                }
                servesLine {
                  uri
                  code
                  colour
                  _meta {
                    title
                    curie
                  }
                }
                ... on Interchange {
                  transferMinutes
                }
              }
            }
          }
        }
      }
    }
  `,
];
void declareNetworkQueries;
/* v8 ignore stop */
