/**
 * A serialised Relay store snapshot for `ComponentProbeQuery` at the
 * probe's variables ({ uri: "ds:global.component.button" }): the store the
 * prepare step serialises (`getStore().getSource().toJSON()`) after the
 * operation runs against the graph server. Regenerate by booting `graph`
 * and running the operation through `createEnvironment`, or by copying
 * `relay.records` from a `/playground` response's `__INITIAL_DATA__`.
 *
 * A TS module rather than `.json`: the module carries its `RecordMap` type
 * inline and avoids the import-attribute ceremony NodeNext requires for
 * `.json` imports.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const componentProbeRecords = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'component(uri:"ds:global.component.button")': {
      __ref: "https://ds.canonical.com/global.component.button",
    },
  },
  "https://ds.canonical.com/global.component.button": {
    __id: "https://ds.canonical.com/global.component.button",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.button",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.button:_meta",
    },
    "documentationStages(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)",
    },
    version: null,
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
    summary:
      "Buttons trigger actions within an interface, typically involving data transformation or manipulation. They provide clear visual indicators of the primary actions users can perform on a page or section.\n\n",
    "inheritsFroms(first:1)": {
      __ref:
        "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:1)",
    },
  },
  "client:__type:Component": {
    __id: "client:__type:Component",
    __typename: "__TypeSchema",
    __isNode: true,
    __isUIBlock: true,
  },
  "client:https://ds.canonical.com/global.component.button:_meta": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta",
    __typename: "EntityMeta",
    title: "Button",
    curie: "ds:global.component.button",
    type: {
      __ref: "https://ds.canonical.com/Component",
    },
    definition: null,
  },
  "https://ds.canonical.com/Component": {
    __id: "https://ds.canonical.com/Component",
    __typename: "OntologyClass",
    _meta: {
      __ref: "client:https://ds.canonical.com/Component:_meta",
    },
    uri: "https://ds.canonical.com/Component",
  },
  "client:https://ds.canonical.com/Component:_meta": {
    __id: "client:https://ds.canonical.com/Component:_meta",
    __typename: "EntityMeta",
    title: "Component",
  },
  "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:documentationStages(first:1)",
      __typename: "TagConnection",
      edges: {
        __refs: [
          "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0",
        ],
      },
    },
  "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0":
    {
      __id: "client:https://ds.canonical.com/global.component.button:documentationStages(first:1):edges:0",
      __typename: "TagEdge",
      node: {
        __ref: "https://ds.canonical.com/tag.needsdocumentation",
      },
    },
  "https://ds.canonical.com/tag.needsdocumentation": {
    __id: "https://ds.canonical.com/tag.needsdocumentation",
    __typename: "Tag",
    _meta: {
      __ref: "client:https://ds.canonical.com/tag.needsdocumentation:_meta",
    },
    uri: "https://ds.canonical.com/tag.needsdocumentation",
  },
  "client:https://ds.canonical.com/tag.needsdocumentation:_meta": {
    __id: "client:https://ds.canonical.com/tag.needsdocumentation:_meta",
    __typename: "EntityMeta",
    title: "needs:documentation",
  },
  "https://ds.canonical.com/global": {
    __id: "https://ds.canonical.com/global",
    __typename: "Tier",
    _meta: {
      __ref: "client:https://ds.canonical.com/global:_meta",
    },
    uri: "https://ds.canonical.com/global",
  },
  "client:https://ds.canonical.com/global:_meta": {
    __id: "client:https://ds.canonical.com/global:_meta",
    __typename: "EntityMeta",
    title: "Global",
  },
  "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:1)":
    {
      __id: "client:https://ds.canonical.com/global.component.button:inheritsFroms(first:1)",
      __typename: "UIBlockConnection",
      edges: {
        __refs: [],
      },
    },
} as unknown as RecordMap;

export default componentProbeRecords;
