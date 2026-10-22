import { graphql } from "react-relay";

// The fleet lens's operations, one per route and one for the addresses the
// routes take. relay-compiler reads these tags and nothing calls them: the
// warm functions and the pages read the compiled artifacts, because an
// evaluated tag throws at module scope wherever no Relay transform has run.

/* v8 ignore start -- relay-compiler reads these tags; nothing calls them at runtime */
/** The graph's prefixes, which expand a route's compact address. */
const declareFleetNamespacesQuery = (): unknown => graphql`
  query FleetNamespacesQuery {
    ontologies {
      prefix
      namespace
    }
  }
`;
void declareFleetNamespacesQuery;

/** The index: every rolling stock, with its formations' side views. */
const declareFleetIndexQuery = (): unknown => graphql`
  query FleetIndexQuery($classUri: String!, $count: Int!) {
    ontologyClass(uri: $classUri) {
      instances(first: $count) {
        edges {
          node {
            __typename
            uri
            _meta {
              title
              curie
            }
            ... on RollingStock {
              formations {
                uri
                length
                _meta {
                  title
                  curie
                }
                ...readFormationTrain_formation
              }
            }
          }
        }
      }
    }
  }
`;
void declareFleetIndexQuery;

/** A stock's page: its formations, drawn at one scale, and their lines. */
const declareStockPageQuery = (): unknown => graphql`
  query StockPageQuery($id: ID!) {
    node(id: $id) {
      __typename
      uri
      ... on RollingStock {
        _meta {
          title
          curie
        }
        formations {
          uri
          length
          capacity
          _meta {
            title
            curie
          }
          ...readFormationTrain_formation
          ...readFormationLines_formation
        }
      }
    }
  }
`;
void declareStockPageQuery;

/** A formation's page: its stock, its side view and its platform fit. */
const declareFormationPageQuery = (): unknown => graphql`
  query FormationPageQuery($id: ID!) {
    node(id: $id) {
      __typename
      uri
      ... on Formation {
        length
        capacity
        _meta {
          title
          curie
        }
        stock {
          uri
          _meta {
            title
            curie
          }
        }
        ...readFormationTrain_formation @alias
        ...readFormationLines_formation @alias
      }
    }
  }
`;
void declareFormationPageQuery;
/* v8 ignore stop */
