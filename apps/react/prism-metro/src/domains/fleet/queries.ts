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

/**
 * The index: every instance of the rolling-stock class, each as the list
 * view's card and row, which draw its formations and count them.
 */
const declareFleetIndexQuery = (): unknown => graphql`
  query FleetIndexQuery($classUri: String!, $count: Int!) {
    ontologyClass(uri: $classUri) {
      instances(first: $count) {
        edges {
          node {
            __typename
            ...NodeList_node
          }
        }
      }
    }
  }
`;
void declareFleetIndexQuery;

/**
 * A stock's page: its formations, each named by its chip and drawn at one
 * scale, and the car types its units are made of, each as its row.
 */
const declareStockPageQuery = (): unknown => graphql`
  query StockPageQuery($id: ID!) {
    node(id: $id) {
      __typename
      ... on RollingStock {
        _meta {
          title
        }
        formations {
          uri
          length
          capacity
          ...ChipProjection_node
          units {
            unit {
              cars {
                carType {
                  uri
                  ...RowProjection_node
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
 * A formation's page: its stock's chip, its side view, its units in order,
 * each named by its chip, and its fit at the platforms of every line it
 * runs on, each line named by its chip.
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
        }
        stock {
          _meta {
            title
          }
          ...ChipProjection_node
        }
        units {
          position
          reversed
          unit {
            length
            ...ChipProjection_node
          }
        }
        lines {
          code
          ...ChipProjection_node
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
