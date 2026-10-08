/**
 * Combines an ID and a sub-ID using a hyphen. Useful for cases where multiple elements in a component require a unique id attribute.
 *
 * For a custom separator or when creating multiple sub-IDs, use {@link createSubId}.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const id = $props.id();
 *   const elementId = subId(id, "sub-id");
 * </script>
 * <div id={id}>Content</div>
 * <div id={elementId}>Other content</div>
 * ```
 */
export function subId(id: string, subId: string) {
  return `${id}-${subId}`;
}

/**
 * Creates a function that combines a base ID with sub-IDs.
 *
 * @param id - The base ID shared by the generated IDs.
 * @param separator - The separator between the base ID and each sub-ID. Defaults to `-`.
 * @returns A function that combines the base ID with a sub-ID.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const id = $props.id();
 *   const subId = createSubId(id, "|");
 *
 *   const nameId = subId("name");
 *   const labelId = subId("label");
 * </script>
 *
 * <label id={labelId}>Label</label>
 * <label id={nameId}>Name</label>
 * ```
 */
export function createSubId(id: string, separator = "-") {
  return (subId: string) => `${id}${separator}${subId}`;
}
