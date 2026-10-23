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
            ... on RollingStock {
              uri
              _meta {
                title
                curie
              }
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

/**
 * A stock's page: its formations, drawn at one scale, with their measures
 * and lines, and the car types its units are made of.
 */
const declareStockPageQuery = (): unknown => graphql`
  query StockPageQuery($id: ID!) {
    node(id: $id) {
      __typename
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
          lines {
            uri
          }
          units {
            unit {
              cars {
                carType {
                  uri
                  code
                  length
                  _meta {
                    title
                    curie
                  }
                }
              }
            }
          }
          ...readFormationTrain_formation
        }
      }
    }
  }
`;
void declareStockPageQuery;

/**
 * A formation's page: its stock, its measures, its units in order, its side
 * view and its fit at the platforms of every line it runs on.
 */
const declareFormationPageQuery = (): unknown => graphql`
  query FormationPageQuery($id: ID!) {
    node(id: $id) {
      __typename
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
        units {
          position
          reversed
          unit {
            uri
            length
            _meta {
              title
              curie
            }
          }
        }
        ...readFormationTrain_formation @alias
        ...readFormationLines_formation @alias
      }
    }
  }
`;
void declareFormationPageQuery;

/** A unit's page: its measures and its cars, drawn as a train of one unit. */
const declareUnitPageQuery = (): unknown => graphql`
  query UnitPageQuery($id: ID!) {
    node(id: $id) {
      __typename
      ... on Unit {
        length
        capacity
        _meta {
          title
          curie
        }
        ...readUnitCars_unit @alias
      }
    }
  }
`;
void declareUnitPageQuery;

/** A car type's page: its code, its cab and its measures. */
const declareCarTypePageQuery = (): unknown => graphql`
  query CarTypePageQuery($id: ID!) {
    node(id: $id) {
      __typename
      ... on CarType {
        code
        hasCab
        length
        capacity
        _meta {
          title
          curie
        }
      }
    }
  }
`;
void declareCarTypePageQuery;
/* v8 ignore stop */
