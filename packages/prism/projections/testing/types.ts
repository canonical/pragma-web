import type { ReactNode } from "react";

/** A node payload as a provider answers it: what every representation reads. */
export interface NodePayload {
  readonly __typename: string;
  readonly uri: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: { readonly uri: string };
  };
}

/**
 * One entity of the projection matrix as the stories render it: the text of
 * every slot each representation fills, so the five representations of one
 * type read the same entity.
 */
export interface StoryEntity {
  /** The entity's name. */
  readonly title: string;
  /** The entity the title belongs to, for a card's `∈` line. */
  readonly parent?: string;
  /** Where the entity is defined, as the card and the command name it. */
  readonly location: string;
  /** The compact address's prefix with its colon, leading a row's title. */
  readonly prefix: string;
  /** The entity's type, as the card, the command and the graph node name it. */
  readonly kind: string;
  /** The card's summary. */
  readonly summary: string;
  /** The card's key values. */
  readonly keyValues: readonly {
    readonly key: string;
    readonly value: ReactNode;
  }[];
  /** The card's footer vitals; the first is the command's vital. */
  readonly vitals: readonly string[];
  /** The one word at the end of a row. */
  readonly meta: string;
  /** The chip's own slots. */
  readonly chip: {
    readonly lead?: string;
    readonly value: string;
    readonly badge?: ReactNode;
    readonly icon?: ReactNode;
  };
  /** The entity's home. */
  readonly href: string;
}
