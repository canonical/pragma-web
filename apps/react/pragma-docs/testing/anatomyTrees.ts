/**
 * Anatomy trees the anatomy figure is tested and shown over, in the shape
 * `buildAnatomyTree` reads them: a button's root over a switch between two
 * labels, an icon component that links to its page, and a repeated role.
 */

import type { AnatomyTreeNode } from "../src/domains/components/lib/AnatomyTree/index.js";

/** A leaf of the tree, with the defaults a leaf takes. */
const leaf = (
  node: Omit<AnatomyTreeNode, "children" | "styleCount"> &
    Partial<Pick<AnatomyTreeNode, "styleCount">>,
): AnatomyTreeNode => ({ styleCount: 0, ...node, children: [] });

/** A button: a root over an icon, a switch between two labels, two roles. */
export const BUTTON_TREE: AnatomyTreeNode = {
  id: "$root",
  label: "button",
  form: "named",
  styleCount: 6,
  children: [
    leaf({
      id: "$root/global.component.icon",
      label: "icon",
      form: "named",
      relation: { cardinality: "0..1", slotName: "icon" },
      href: "/components/ds%3Aglobal.component.icon",
    }),
    {
      id: "$root/switch",
      label: "label",
      form: "switch",
      discriminator: "props",
      relation: { cardinality: "1", slotName: "label" },
      styleCount: 0,
      children: [
        leaf({
          id: "$root/case[text]",
          label: "text label",
          form: "anonymous",
          caseValue: "text",
          styleCount: 2,
        }),
        leaf({
          id: "$root/case[hidden]",
          label: "hidden label",
          form: "anonymous",
          caseValue: "hidden",
        }),
      ],
    },
    leaf({
      id: "$root/spacer[1]",
      label: "spacer",
      form: "anonymous",
      relation: { cardinality: "1" },
    }),
    leaf({
      id: "$root/spacer[2]",
      label: "spacer",
      form: "anonymous",
      relation: { cardinality: "1" },
    }),
  ],
};
