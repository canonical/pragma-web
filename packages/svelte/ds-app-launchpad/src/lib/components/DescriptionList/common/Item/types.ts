/* @canonical/generator-ds 0.17.1 */

import type { Snippet } from "svelte";
import type { SvelteHTMLElements } from "svelte/elements";

type BaseProps = Omit<SvelteHTMLElements["div"], "children">;

export interface ItemProps extends BaseProps {
  /**
   * Term/name of the item
   */
  name: Snippet<[]>;
  /**
   * Description/content of the item
   */
  description: Snippet<[]>;
}
