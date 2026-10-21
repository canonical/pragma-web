/**
 * A serialised Relay store snapshot for `StandardEntityQuery` at
 * { uri: "<the link_component IRI>", classUri: "cs:CodeStandard" }: the
 * store a site's prepare step serialises for hydration at that standard's
 * reading page.
 *
 * HAND-WRITTEN, NOT CAPTURED, with the same discipline as
 * `standardsIndexRecords`: the payload was authored, then normalised by
 * Relay through `createEnvironment` and the real compiled artifact, so every
 * storage key is Relay's. The description (`_meta.definition`) is a live
 * `cs:description` text, the longest one, and carries both paragraph breaks
 * and inline code marks, which is what the plain-text rendering is tested
 * on.
 *
 * `boundClass.subclasses` is EMPTY, the strict case for the reading page's
 * class guard: the permitted set is exactly one IRI, so a node of any other
 * class is rejected.
 *
 * `client:__type:CodeStandard` carries `__isNode: true`, Relay's
 * abstract-type discriminator for `StandardArticle_standard`, a fragment on
 * `Node`: without it the article's fragment does not match and the reading
 * column renders empty.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const standardEntityRecords = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'ontologyClass(uri:"cs:CodeStandard")': {
      __ref: "http://pragma.canonical.com/codestandards#CodeStandard",
    },
    'node(id:"http://pragma.canonical.com/codestandards#react.component.link_component")':
      {
        __ref:
          "http://pragma.canonical.com/codestandards#react.component.link_component",
      },
  },
  "http://pragma.canonical.com/codestandards#CodeStandard": {
    __id: "http://pragma.canonical.com/codestandards#CodeStandard",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    subclasses: {
      __refs: [],
    },
    _meta: {
      __ref:
        "client:http://pragma.canonical.com/codestandards#CodeStandard:_meta",
    },
  },
  "http://pragma.canonical.com/codestandards#react.component.link_component": {
    __id: "http://pragma.canonical.com/codestandards#react.component.link_component",
    __typename: "CodeStandard",
    uri: "http://pragma.canonical.com/codestandards#react.component.link_component",
    _meta: {
      __ref:
        "client:http://pragma.canonical.com/codestandards#react.component.link_component:_meta",
    },
  },
  "client:http://pragma.canonical.com/codestandards#react.component.link_component:_meta":
    {
      __id: "client:http://pragma.canonical.com/codestandards#react.component.link_component:_meta",
      __typename: "EntityMeta",
      curie: "cs:react.component.link_component",
      title: "react.component.link_component",
      type: {
        __ref: "http://pragma.canonical.com/codestandards#CodeStandard",
      },
      definition:
        'A *complex* component — one that renders a set of navigable items (a list, tree, tab strip, breadcrumb trail, menu) and injects an inner link renderer for them — MUST integrate with a consumer\'s router through a single `LinkComponent` prop against the shared `LinkComponentProps` contract, NOT through a per-component re-authored interface and NOT through the polymorphic `as` prop. (A *simple* component that merely re-targets its own wrapper element uses `as` instead — see the boundary below.)\n\nThe contract is deliberately narrow: `LinkComponent?: ComponentType<LinkComponentProps> | "a"`, defaulting to the intrinsic `"a"`. `LinkComponentProps` forwards only `href`, `className`, `children`, and `aria-current` — not the full anchor attribute set — so the same router `Link` adapter works across every component that uses it. Define `LinkComponentProps` once in a shared location and import it; do not copy the interface per component.\n\nBoundary with the polymorphic `as` prop — the deciding question is *what is being configured*: the component\'s own wrapper element, or an inner link renderer among other structure.\n\n- **Simple component → `as`.** When the component IS the element (its own root wrapper is what gets swapped for the consumer\'s link/element — e.g. a `Link`, `Button`, `Box`, or any single-element component the consumer re-targets), use the polymorphic `as`/`ElementType` prop. The consumer configures the wrapper directly.\n- **Complex component → `LinkComponent`.** When the component renders multiple navigable items and injects ONE inner link renderer for each (a list, tree, tab strip, breadcrumb trail, menu), use `LinkComponent`. Here `as` would be wrong: there is no single wrapper to re-target, and threading `as`-style generics through the subcomponents to reach each inner link is the anti-pattern this standard exists to prevent.\n\nFallback semantics: a non-navigable item (one with no `url`/`href`) MUST render a plain element such as `<span>` — never the injected link, and never a `<button>`. When an item is disabled, its `href` is omitted. Active state drives `aria-current` (e.g. `"page"`) on the rendered link.',
    },
  "client:http://pragma.canonical.com/codestandards#CodeStandard:_meta": {
    __id: "client:http://pragma.canonical.com/codestandards#CodeStandard:_meta",
    __typename: "EntityMeta",
    title: "CodeStandard",
  },
  "client:__type:CodeStandard": {
    __id: "client:__type:CodeStandard",
    __typename: "__TypeSchema",
    __isNode: true,
  },
} as unknown as RecordMap;

export default standardEntityRecords;
