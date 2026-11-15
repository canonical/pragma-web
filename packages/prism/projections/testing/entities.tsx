import type { StoryEntity } from "./types.js";

/** The meta type: an ontology class, with its instances counted. */
export const CLASS_ENTITY: StoryEntity = {
  title: "Layout",
  prefix: "ds:",
  address: "ds:Layout",
  kind: "Class",
  summary:
    "A layout arranges the blocks of a page on the grid: it decides where each region sits and how the regions reflow.",
  facts: [{ property: "ds:instanceCount", label: "Instances", value: "12" }],
  status: "abstract",
  count: 88,
  href: "#layout",
};

/** A UI block: a component of the design system, under its parent. */
export const UI_BLOCK_ENTITY: StoryEntity = {
  title: "IconButton",
  prefix: "ds:",
  address: "ds:IconButton",
  kind: "Component",
  summary: "A button is an interactive element that triggers a command.",
  facts: [
    { property: "ds:tier", label: "Tier", value: "Global" },
    { property: "ds:inheritsFrom", label: "Inherits from", value: "Button" },
    { property: "ds:version", label: "Version", value: "2.1" },
  ],
  status: "experimental",
  href: "#icon-button",
};

/** A modifier, filed under its family. */
export const MODIFIER_ENTITY: StoryEntity = {
  title: "Danger",
  prefix: "ds:",
  address: "ds:Danger",
  kind: "Modifier",
  summary:
    "The danger modifier is part of the anticipation modifier family. It is defined in the DS:Global.",
  facts: [
    { property: "ds:modifierFamily", label: "Family", value: "Anticipation" },
    { property: "ds:version", label: "Version", value: "1.11" },
  ],
  status: "stable",
  href: "#danger",
};

/** A modifier family, with its members counted. */
export const MODIFIER_FAMILY_ENTITY: StoryEntity = {
  title: "Anticipation",
  prefix: "ds:",
  address: "ds:Anticipation",
  kind: "Modifier family",
  summary:
    "The anticipation family groups the modifiers that tell a reader what an action will do before it is taken.",
  facts: [{ property: "ds:modifiers", label: "Members", value: "5" }],
  status: "stable",
  count: 5,
  href: "#anticipation",
};

/** A code standard, filed under its category. */
export const STANDARD_ENTITY: StoryEntity = {
  title: "react.component.subcomponent_export_api",
  prefix: "cs:",
  address: "cs:react.component.subcomponent_export_api",
  kind: "Code Standard",
  summary:
    "Subcomponents are public if they are intended to be directly used by the consumer of the parent component to construct a UI.",
  facts: [{ property: "cs:category", label: "Category", value: "React" }],
  status: "stable",
  href: "#subcomponent-export-api",
};
