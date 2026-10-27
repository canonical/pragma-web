/**
 * The catalog key of the heading's sentence for each relation a title has
 * to its parent: an instance of it (`∈`), or a subclass of it (`⊂`).
 */
export const PARENT_MESSAGES = {
  instance: "entity.parent",
  subclass: "entity.subclass",
} as const;
