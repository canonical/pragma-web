/**
 * The design-system entities the site's projections are tested and shown
 * over, as a Relay mock environment answers a `Node`, read off the
 * projection matrix's rows: a UI block, a UI block the published package
 * renders, a modifier, a modifier family and a code standard, each with the
 * href the site's homes build for it; an ontology class and a tier, which
 * the site hands to the package's arms; and the routes those homes build
 * them through.
 */

import { route } from "@canonical/router-core";

/**
 * The component IconButton: a block of the global tier under Button, at
 * version 2.1 and in its experimental stage, which the published package
 * does not render alone.
 */
export const MOCK_UI_BLOCK = {
  __typename: "Component",
  version: "2.1",
  summary: "A button is an interactive element that triggers a command.",
  _meta: {
    title: "IconButton",
    curie: "ds:global.component.icon_button",
    type: { _meta: { title: "Component" } },
  },
  tier: { _meta: { title: "Global" } },
  inheritsFroms: { edges: [{ node: { _meta: { title: "Button" } } }] },
  documentationStages: {
    edges: [{ node: { _meta: { title: "experimental" } } }],
  },
} as const;

/** The href the site's homes build for `MOCK_UI_BLOCK`. */
export const MOCK_UI_BLOCK_HREF =
  "/components/ds%3Aglobal.component.icon_button";

/**
 * The component Button, which the published package renders: its card's
 * sidecar holds the published Button.
 */
export const MOCK_UI_BLOCK_WITH_EXAMPLE = {
  ...MOCK_UI_BLOCK,
  version: null,
  summary:
    "Buttons trigger actions within an interface, typically involving data transformation or manipulation. They provide clear visual indicators of the primary actions users can perform on a page or section.",
  _meta: {
    title: "Button",
    curie: "ds:global.component.button",
    type: { _meta: { title: "Component" } },
  },
  inheritsFroms: { edges: [] },
} as const;

/** The href the site's homes build for `MOCK_UI_BLOCK_WITH_EXAMPLE`. */
export const MOCK_UI_BLOCK_WITH_EXAMPLE_HREF =
  "/components/ds%3Aglobal.component.button";

/** The modifier Danger, of the Anticipation family, at version 1.11. */
export const MOCK_MODIFIER = {
  __typename: "Modifier",
  version: "1.11",
  summary:
    "The danger modifier is part of the anticipation modifier family. It is defined in the DS:Global.",
  _meta: {
    title: "Danger",
    curie: "ds:global.modifier.danger",
    type: { _meta: { title: "Modifier" } },
  },
  modifierFamily: { _meta: { title: "Anticipation" } },
} as const;

/** The modifier family Anticipation, with its five members. */
export const MOCK_MODIFIER_FAMILY = {
  __typename: "ModifierFamily",
  summary:
    "The anticipation family groups the modifiers that tell a reader what an action will do before it is taken.",
  _meta: {
    title: "Anticipation",
    curie: "ds:global.modifier_family.anticipation",
    type: { _meta: { title: "Modifier family" } },
  },
  modifiers: {
    edges: [
      { node: { uri: "ds:global.modifier.danger" } },
      { node: { uri: "ds:global.modifier.caution" } },
      { node: { uri: "ds:global.modifier.positive" } },
      { node: { uri: "ds:global.modifier.negative" } },
      { node: { uri: "ds:global.modifier.neutral" } },
    ],
  },
} as const;

/**
 * The code standard on public and private subcomponent exports, of the
 * React category, with its Markdown description.
 */
export const MOCK_CODE_STANDARD = {
  __typename: "CodeStandard",
  description:
    "Subcomponents are **public** if they are intended to be directly used by the consumer of the parent component to construct a UI.\n\nSubcomponents are **private** if they are internal implementation details of the parent component, and are not intended for direct use by the consumer.",
  _meta: {
    title: "Public and private subcomponent exports",
    curie: "cs:react.component.subcomponent_export_api",
    type: { _meta: { title: "Code Standard" } },
  },
  categories: { edges: [{ node: { _meta: { title: "React" } } }] },
} as const;

/**
 * The href the site's homes build for `MOCK_CODE_STANDARD`: its reading
 * page, addressed by the absolute IRI.
 */
export const MOCK_CODE_STANDARD_HREF =
  "/standards/http%3A%2F%2Fpragma.canonical.com%2Fcodestandards%23react.component.subcomponent_export_api";

/**
 * The abstract class Layout: an ontology class, which the site's
 * dispatchers hand to the package's own arm.
 */
export const MOCK_ONTOLOGY_CLASS = {
  __typename: "OntologyClass",
  isAbstract: true,
  instanceCount: 88,
  definition:
    "Layouts are an opinionated division of space to navigate a domain of information.",
  _meta: { title: "Layout", curie: "ds:Layout" },
  superclass: { _meta: { title: "UIBlock" } },
} as const;

/**
 * The tier Global: a node no arm of the site or the package takes, which
 * renders through the package's `Node` arm.
 */
export const MOCK_TIER = {
  __typename: "Tier",
  _meta: {
    title: "Global",
    curie: "ds:global",
    definition: null,
    type: { _meta: { title: "Tier" } },
  },
} as const;

/**
 * The routes the site's homes build their hrefs through, each with no
 * content: a story's router names them as the site does, so a homed entity
 * links to its page, without mounting the page under the story.
 */
export const HOME_ROUTES = {
  componentEntity: route({ url: "/components/:uri", content: () => null }),
  definitionsTerm: route({ url: "/definitions/:term", content: () => null }),
  standardEntity: route({ url: "/standards/:uri", content: () => null }),
} as const;
