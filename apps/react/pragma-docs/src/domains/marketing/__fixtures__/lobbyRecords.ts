/**
 * A serialised Relay store snapshot for `LobbyQuery` at
 * { componentClass: "ds:Component", patternClass: "ds:Pattern",
 *   standardClass: "cs:CodeStandard", exemplars: 6 }: the store the prepare
 * step serialises (`getStore().getSource().toJSON()`) after the operation
 * runs against the graph server, untrimmed: three class lookups, one
 * six-edge instance connection, and the six component nodes each read
 * through the site's chip.
 *
 * The counts frozen here are a CAPTURE, not a contract: the graph moves.
 * Unit tests read them from this fixture; nothing asserts these numbers
 * against the live graph, and the e2e block asserts only structure and
 * floors.
 *
 * Regenerate: boot `graph` and run the operation through
 * `createEnvironment`, or copy `relay.records` out of the `__INITIAL_DATA__`
 * script served at `/` — wholesale, no editing.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const lobbyRecords = {
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    'ontologyClass(uri:"ds:Component")': {
      __ref: "https://ds.canonical.com/Component",
    },
    'ontologyClass(uri:"ds:Pattern")': {
      __ref: "https://ds.canonical.com/Pattern",
    },
    'ontologyClass(uri:"cs:CodeStandard")': {
      __ref: "http://pragma.canonical.com/codestandards#CodeStandard",
    },
  },
  "https://ds.canonical.com/Component": {
    __id: "https://ds.canonical.com/Component",
    __typename: "OntologyClass",
    instanceCount: 139,
    "instances(first:6)": {
      __ref: "client:https://ds.canonical.com/Component:instances(first:6)",
    },
    uri: "https://ds.canonical.com/Component",
  },
  "client:https://ds.canonical.com/Component:instances(first:6)": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6)",
    __typename: "NodeConnection",
    edges: {
      __refs: [
        "client:https://ds.canonical.com/Component:instances(first:6):edges:0",
        "client:https://ds.canonical.com/Component:instances(first:6):edges:1",
        "client:https://ds.canonical.com/Component:instances(first:6):edges:2",
        "client:https://ds.canonical.com/Component:instances(first:6):edges:3",
        "client:https://ds.canonical.com/Component:instances(first:6):edges:4",
        "client:https://ds.canonical.com/Component:instances(first:6):edges:5",
      ],
    },
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:0": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:0",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.accordion",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.accordion": {
    __id: "https://ds.canonical.com/apps_launchpad.component.accordion",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.accordion",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.accordion:_meta",
    },
  },
  "client:__type:Component": {
    __id: "client:__type:Component",
    __typename: "__TypeSchema",
    __isNode: true,
    __isUIBlock: true,
  },
  "client:https://ds.canonical.com/apps_launchpad.component.accordion:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.accordion:_meta",
    __typename: "EntityMeta",
    title: "Accordion",
    curie: "ds:apps_launchpad.component.accordion",
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:1": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:1",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.accordion",
    },
  },
  "https://ds.canonical.com/global.component.accordion": {
    __id: "https://ds.canonical.com/global.component.accordion",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.accordion",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.accordion:_meta",
    },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta",
    __typename: "EntityMeta",
    title: "Accordion",
    curie: "ds:global.component.accordion",
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:2": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:2",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.announcement",
    },
  },
  "https://ds.canonical.com/global.component.announcement": {
    __id: "https://ds.canonical.com/global.component.announcement",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.announcement",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.announcement:_meta",
    },
  },
  "client:https://ds.canonical.com/global.component.announcement:_meta": {
    __id: "client:https://ds.canonical.com/global.component.announcement:_meta",
    __typename: "EntityMeta",
    title: "Announcement",
    curie: "ds:global.component.announcement",
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:3": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:3",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.avatar",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.avatar": {
    __id: "https://ds.canonical.com/apps_launchpad.component.avatar",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.avatar",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.avatar:_meta",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.avatar:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.avatar:_meta",
    __typename: "EntityMeta",
    title: "Avatar",
    curie: "ds:apps_launchpad.component.avatar",
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:4": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:4",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.avatar",
    },
  },
  "https://ds.canonical.com/global.component.avatar": {
    __id: "https://ds.canonical.com/global.component.avatar",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.avatar",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.avatar:_meta",
    },
  },
  "client:https://ds.canonical.com/global.component.avatar:_meta": {
    __id: "client:https://ds.canonical.com/global.component.avatar:_meta",
    __typename: "EntityMeta",
    title: "Avatar",
    curie: "ds:global.component.avatar",
  },
  "client:https://ds.canonical.com/Component:instances(first:6):edges:5": {
    __id: "client:https://ds.canonical.com/Component:instances(first:6):edges:5",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_lxd.component.back_link",
    },
  },
  "https://ds.canonical.com/apps_lxd.component.back_link": {
    __id: "https://ds.canonical.com/apps_lxd.component.back_link",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_lxd.component.back_link",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_lxd.component.back_link:_meta",
    },
  },
  "client:https://ds.canonical.com/apps_lxd.component.back_link:_meta": {
    __id: "client:https://ds.canonical.com/apps_lxd.component.back_link:_meta",
    __typename: "EntityMeta",
    title: "BackLink",
    curie: "ds:apps_lxd.component.back_link",
  },
  "https://ds.canonical.com/Pattern": {
    __id: "https://ds.canonical.com/Pattern",
    __typename: "OntologyClass",
    instanceCount: 63,
    uri: "https://ds.canonical.com/Pattern",
  },
  "http://pragma.canonical.com/codestandards#CodeStandard": {
    __id: "http://pragma.canonical.com/codestandards#CodeStandard",
    __typename: "OntologyClass",
    instanceCount: 147,
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
  },
} as unknown as RecordMap;

export default lobbyRecords;
