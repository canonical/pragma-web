/**
 * The field each of the page's sections anchors on: the lens orders the
 * sections as it orders these fields.
 */
export const SECTION_ANCHORS = {
  anatomy: "anatomyDsl",
  properties: "properties",
  relations: "inheritsFroms",
} as const;
