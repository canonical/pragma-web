import type { EntityDescription } from "./types.js";

/**
 * An entity's one-line description: its definition, else its comment.
 *
 * @param description - The entity's definition and comment, either absent.
 * @returns The summary, or `undefined` when the entity states neither.
 */
export default function readEntitySummary({
  definition,
  comment,
}: EntityDescription): string | undefined {
  return definition ?? comment ?? undefined;
}
