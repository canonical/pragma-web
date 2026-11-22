import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads these tags; nothing calls them at runtime */
/**
 * The fields `partitionStatements` reads, one fragment per side: of a
 * group, its predicate's IRI, of each node it holds the visibility of the
 * node's class, and of each literal its text, which the details panel
 * measures to close a long one; of the entity, its definition (which predicate the
 * summary reads) and its class's fields with their group. Each query that
 * partitions spreads both unmasked (`@relay(mask: false)`), so the entity
 * page and the details panel split an entity's statements from one
 * selection.
 */
const declareStatementGroupPartition = (): unknown => [
  graphql`
    fragment statementGroupPartition_group on StatementGroup {
      predicateUri
      values {
        __typename
        ... on StatementNode {
          node {
            _meta {
              type {
                visibility
              }
            }
          }
        }
        ... on StatementLiteral {
          lexical
        }
      }
    }
  `,
  graphql`
    fragment statementGroupPartition_meta on EntityMeta {
      definition
      fields {
        name
        order
        visibility
        group {
          uri
          label
          order
        }
        property {
          uri
        }
      }
    }
  `,
];
void declareStatementGroupPartition;
/* v8 ignore stop */
