import { graphql } from "react-relay";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The fields a statement group's label is read from, in either direction:
 * its predicate's IRI, its true count and every label of its predicate.
 * Each query that labels groups spreads it unmasked
 * (`...statementGroupLabels_group @relay(mask: false)`), so no selection
 * can leave out the field `labelOutgoingGroup` or `labelIncomingGroup`
 * reads.
 */
const declareStatementGroupLabels = (): unknown => graphql`
  fragment statementGroupLabels_group on StatementGroup {
    predicateUri
    total
    predicate {
      label
      pluralLabel
      inverseLabel
      inversePluralLabel
    }
  }
`;
void declareStatementGroupLabels;
/* v8 ignore stop */
