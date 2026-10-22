import { Badge, Icon } from "@canonical/react-ds-global";
import type { StoryEntity } from "./types.js";

/** The meta type: an ontology class, with its instances counted. */
export const CLASS_ENTITY: StoryEntity = {
  title: "Layout",
  location: "design-system",
  prefix: "ds:",
  kind: "Class",
  summary:
    "A layout arranges the blocks of a page on the grid: it decides where each region sits and how the regions reflow.",
  keyValues: [{ key: "Instances", value: "12" }],
  vitals: ["used in 88 instances"],
  meta: "abstract",
  chip: { value: "Layout", badge: <Badge value={88} /> },
  href: "#layout",
};

/** A UI block: a component of the design system, under its parent. */
export const UI_BLOCK_ENTITY: StoryEntity = {
  title: "IconButton",
  parent: "Button",
  location: "DS:Global",
  prefix: "ds:",
  kind: "Component",
  summary: "A button is an interactive element that triggers a command.",
  keyValues: [{ key: "Tier", value: "Component" }],
  vitals: ["v2.1", "Experimental"],
  meta: "experimental",
  chip: { value: "IconButton" },
  href: "#icon-button",
};

/** A modifier, filed under its family. */
export const MODIFIER_ENTITY: StoryEntity = {
  title: "Danger",
  location: "DS:Global",
  prefix: "ds:",
  kind: "Modifier",
  summary:
    "The danger modifier is part of the anticipation modifier family. It is defined in the DS:Global.",
  keyValues: [
    { key: "Class", value: "Modifier" },
    { key: "Family", value: "Anticipation" },
  ],
  vitals: ["v1.11"],
  meta: "modifier",
  chip: {
    lead: "Modifier",
    value: "Danger",
    icon: <Icon icon="warning" />,
  },
  href: "#danger",
};

/** A modifier family, with its members counted. */
export const MODIFIER_FAMILY_ENTITY: StoryEntity = {
  title: "Anticipation",
  location: "DS:Global",
  prefix: "ds:",
  kind: "Modifier family",
  summary:
    "The anticipation family groups the modifiers that tell a reader what an action will do before it is taken.",
  keyValues: [{ key: "Members", value: "5" }],
  vitals: ["5 modifiers"],
  meta: "family",
  chip: { value: "Anticipation", badge: <Badge value={5} /> },
  href: "#anticipation",
};

/** A code standard, filed under its category. */
export const STANDARD_ENTITY: StoryEntity = {
  title: "react.component.subcomponent_export_api",
  location: "web-code-standards",
  prefix: "cs:",
  kind: "Code Standard",
  summary:
    "Subcomponents are public if they are intended to be directly used by the consumer of the parent component to construct a UI.",
  keyValues: [{ key: "Category", value: "React" }],
  vitals: ["React"],
  meta: "react",
  chip: { lead: "cs", value: "subcomponent_export_api" },
  href: "#subcomponent-export-api",
};
