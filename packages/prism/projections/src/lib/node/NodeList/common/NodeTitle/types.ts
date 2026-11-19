/** Props accepted by `NodeTitle`: the node's address and its title. */
export interface NodeTitleProps {
  /** The node's GraphQL type, which picks its home. */
  readonly typename: string;
  /** The node's compact address, which its home reads. */
  readonly curie: string;
  /** The node's title. */
  readonly title: string;
}
