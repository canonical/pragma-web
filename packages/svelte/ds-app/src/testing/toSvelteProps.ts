import { createRawSnippet } from "svelte";
import type { SideNavigationProps } from "../lib/component/SideNavigation/index.js";

// biome-ignore lint/suspicious/noExplicitAny: case props are data
type Data = any;

const span = (text: unknown) =>
  typeof text === "string"
    ? createRawSnippet(() => ({ render: () => `<span>${text}</span>` }))
    : undefined;
const handler = (flag: unknown) => (flag ? () => {} : undefined);

const leaf = ({ onClick, className, slot, ...item }: Data) => ({
  ...item,
  class: className,
  slot: span(slot),
  onclick: handler(onClick),
});
const entries = (items: Data[] | undefined) =>
  items?.map((entry: Data) =>
    entry.items ? { ...entry, items: entry.items.map(leaf) } : leaf(entry),
  );
const context = (item: Data) => ({ ...item, badge: span(item.badge) });

/**
 * Turns a golden case (plain data, shared with the React capture script)
 * into SideNavigation props: text fields that React renders as nodes become
 * snippets, and React's prop names become Svelte's.
 */
export default function toSvelteProps(props: Data): SideNavigationProps {
  const {
    brand,
    root,
    footerRoot,
    contextSwitcher,
    messages,
    className,
    ...rest
  } = props;
  return {
    ...rest,
    class: className,
    brand: span(brand),
    root: root && {
      ...root,
      items: root.items?.map((group: Data) => ({
        ...group,
        items: entries(group.items),
      })),
    },
    footerRoot: footerRoot && {
      ...footerRoot,
      items: entries(footerRoot.items),
    },
    contextSwitcher: contextSwitcher && {
      title: contextSwitcher.title,
      currentContext: context(contextSwitcher.currentContext),
      contexts: contextSwitcher.contexts.map(context),
      oncreatecontext: handler(contextSwitcher.onCreateContext),
    },
    messages:
      messages &&
      Object.fromEntries(
        Object.entries(messages).map(([key, text]) => [key, () => text]),
      ),
  };
}
