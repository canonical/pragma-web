import type { EntityFact } from "../src/lib/ui/EntityCard/types.js";

/**
 * A node payload as a provider answers it: what every dispatcher reads,
 * with the typename again under `__isNode`, the key an operation asks the
 * type by for a spread on the `Node` interface.
 */
export interface NodePayload {
  readonly __typename: string;
  readonly __isNode: string;
  readonly uri: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly definition: string | null;
    readonly type: {
      readonly uri: string;
      readonly _meta: { readonly title: string };
    };
  };
}

/**
 * An ontology class's payload: what every dispatcher reads of a node, and
 * what the class's own arms read of it.
 */
export interface ClassPayload extends NodePayload {
  readonly isAbstract: boolean;
  readonly definition: string | null;
  readonly instanceCount: number;
  readonly superclass: {
    readonly uri: string;
    readonly _meta: { readonly title: string };
  } | null;
}

/**
 * One entity of the projection matrix as the stories render it: the text of
 * every slot each representation fills, so the five representations of one
 * type read the same entity.
 */
export interface StoryEntity {
  /** The entity's name. */
  readonly title: string;
  /** The foreign prefix with its colon, leading the title. */
  readonly prefix: string;
  /** The compact address, as a command and a card shown alone cite it. */
  readonly address: string;
  /** The entity's type, as the command and the graph node name it. */
  readonly kind: string;
  /** The two-line row's and the card's summary. */
  readonly summary: string;
  /** What the row and the card state about the entity. */
  readonly facts: readonly EntityFact[];
  /** The entity's state, such as its stage, ending a row, a card or a command. */
  readonly status: string;
  /** The one figure a chip shows in its status, such as a member count. */
  readonly count?: number;
  /** The entity's home. */
  readonly href: string;
}
