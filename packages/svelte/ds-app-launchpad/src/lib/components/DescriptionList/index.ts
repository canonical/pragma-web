/* @canonical/generator-ds 0.17.1 */

import { Item } from "./common/index.js";
import { default as DescriptionListRoot } from "./DescriptionList.svelte";

const DescriptionList = DescriptionListRoot as typeof DescriptionListRoot & {
  /**
   * The `DescriptionList.Item` component represents an individual term and its corresponding description within a `DescriptionList`.
   *
   * @example
   * ```svelte
   * <DescriptionList>
   *   <DescriptionList.Item>
   *     <dt>ID</dt>
   *     <dd>134</dd>
   *   </DescriptionList.Item>
   * </DescriptionList>
   * ```
   */
  Item: typeof Item;
};
DescriptionList.Item = Item;

export type { ItemProps as DescriptionListItemProps } from "./common/index.js";
export type { DescriptionListProps } from "./types.js";
export { DescriptionList };
