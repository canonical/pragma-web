import type { ExpandableNavItem, LeafNavItem } from "./types.js";

/**
 * Builds the Help item every application's side navigation carries, with the
 * shape `createHelpItem` from `@canonical/react-ds-app` returns: a Help row
 * disclosing the legal information link and any additional items.
 */
export default function createHelpItem(
  legalUrl: string,
  options: {
    readonly label?: string;
    readonly legalLabel?: string;
    readonly additionalItems?: readonly LeafNavItem[];
  } = {},
): ExpandableNavItem {
  return {
    key: "help",
    label: options.label ?? "Help",
    icon: "help",
    items: [
      {
        key: "help-legal",
        url: legalUrl,
        label: options.legalLabel ?? "Legal information",
        icon: "external-link",
      },
      ...(options.additionalItems ?? []),
    ],
  };
}
