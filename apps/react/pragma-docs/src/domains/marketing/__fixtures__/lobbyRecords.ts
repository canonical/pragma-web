/**
 * A serialised Relay store snapshot for `LobbyQuery` at
 * { componentClass: "ds:Component", patternClass: "ds:Pattern",
 *   standardClass: "cs:CodeStandard", exemplarPool: 24 }: the store the
 * prepare step serialises (`getStore().getSource().toJSON()`) after the
 * operation runs against the graph server, untrimmed: three class lookups,
 * one twenty-four-edge instance connection, and the twenty-four component
 * nodes, each read with its title and tier and through the site's chip.
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
    "instances(first:24)": {
      __ref: "client:https://ds.canonical.com/Component:instances(first:24)",
    },
    uri: "https://ds.canonical.com/Component",
  },
  "client:https://ds.canonical.com/Component:instances(first:24)": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24)",
    __typename: "NodeConnection",
    edges: {
      __refs: [
        "client:https://ds.canonical.com/Component:instances(first:24):edges:0",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:1",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:2",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:3",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:4",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:5",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:6",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:7",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:8",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:9",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:10",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:11",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:12",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:13",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:14",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:15",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:16",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:17",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:18",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:19",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:20",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:21",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:22",
        "client:https://ds.canonical.com/Component:instances(first:24):edges:23",
      ],
    },
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:0": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:0",
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
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.accordion:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.accordion:_meta",
    __typename: "EntityMeta",
    title: "Accordion",
    curie: "ds:apps_launchpad.component.accordion",
  },
  "client:__type:Component": {
    __id: "client:__type:Component",
    __typename: "__TypeSchema",
    __isNode: true,
    __isUIBlock: true,
  },
  "https://ds.canonical.com/apps_launchpad": {
    __id: "https://ds.canonical.com/apps_launchpad",
    __typename: "Tier",
    name: "Apps/Launchpad",
    uri: "https://ds.canonical.com/apps_launchpad",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:1": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:1",
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
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.accordion:_meta": {
    __id: "client:https://ds.canonical.com/global.component.accordion:_meta",
    __typename: "EntityMeta",
    title: "Accordion",
    curie: "ds:global.component.accordion",
  },
  "https://ds.canonical.com/global": {
    __id: "https://ds.canonical.com/global",
    __typename: "Tier",
    name: "Global",
    uri: "https://ds.canonical.com/global",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:2": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:2",
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
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.announcement:_meta": {
    __id: "client:https://ds.canonical.com/global.component.announcement:_meta",
    __typename: "EntityMeta",
    title: "Announcement",
    curie: "ds:global.component.announcement",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:3": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:3",
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
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.avatar:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.avatar:_meta",
    __typename: "EntityMeta",
    title: "Avatar",
    curie: "ds:apps_launchpad.component.avatar",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:4": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:4",
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
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.avatar:_meta": {
    __id: "client:https://ds.canonical.com/global.component.avatar:_meta",
    __typename: "EntityMeta",
    title: "Avatar",
    curie: "ds:global.component.avatar",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:5": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:5",
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
    tier: {
      __ref: "https://ds.canonical.com/apps_lxd",
    },
  },
  "client:https://ds.canonical.com/apps_lxd.component.back_link:_meta": {
    __id: "client:https://ds.canonical.com/apps_lxd.component.back_link:_meta",
    __typename: "EntityMeta",
    title: "BackLink",
    curie: "ds:apps_lxd.component.back_link",
  },
  "https://ds.canonical.com/apps_lxd": {
    __id: "https://ds.canonical.com/apps_lxd",
    __typename: "Tier",
    name: "Apps/LXD",
    uri: "https://ds.canonical.com/apps_lxd",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:6": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:6",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.badge",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.badge": {
    __id: "https://ds.canonical.com/apps_launchpad.component.badge",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.badge",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.badge:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.badge:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.badge:_meta",
    __typename: "EntityMeta",
    title: "Badge",
    curie: "ds:apps_launchpad.component.badge",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:7": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:7",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_portal.component.badge",
    },
  },
  "https://ds.canonical.com/apps_portal.component.badge": {
    __id: "https://ds.canonical.com/apps_portal.component.badge",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_portal.component.badge",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_portal.component.badge:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_portal",
    },
  },
  "client:https://ds.canonical.com/apps_portal.component.badge:_meta": {
    __id: "client:https://ds.canonical.com/apps_portal.component.badge:_meta",
    __typename: "EntityMeta",
    title: "Badge",
    curie: "ds:apps_portal.component.badge",
  },
  "https://ds.canonical.com/apps_portal": {
    __id: "https://ds.canonical.com/apps_portal",
    __typename: "Tier",
    name: "Apps/Portal",
    uri: "https://ds.canonical.com/apps_portal",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:8": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:8",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.badge",
    },
  },
  "https://ds.canonical.com/global.component.badge": {
    __id: "https://ds.canonical.com/global.component.badge",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.badge",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.badge:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.badge:_meta": {
    __id: "client:https://ds.canonical.com/global.component.badge:_meta",
    __typename: "EntityMeta",
    title: "Badge",
    curie: "ds:global.component.badge",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:9": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:9",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/sites.component.blog_card",
    },
  },
  "https://ds.canonical.com/sites.component.blog_card": {
    __id: "https://ds.canonical.com/sites.component.blog_card",
    __typename: "Component",
    uri: "https://ds.canonical.com/sites.component.blog_card",
    _meta: {
      __ref: "client:https://ds.canonical.com/sites.component.blog_card:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/sites",
    },
  },
  "client:https://ds.canonical.com/sites.component.blog_card:_meta": {
    __id: "client:https://ds.canonical.com/sites.component.blog_card:_meta",
    __typename: "EntityMeta",
    title: "BlogCard",
    curie: "ds:sites.component.blog_card",
  },
  "https://ds.canonical.com/sites": {
    __id: "https://ds.canonical.com/sites",
    __typename: "Tier",
    name: "Sites",
    uri: "https://ds.canonical.com/sites",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:10": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:10",
    __typename: "NodeEdge",
    node: {
      __ref:
        "https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards",
    },
  },
  "https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards":
    {
      __id: "https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards",
      __typename: "Component",
      uri: "https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards",
      _meta: {
        __ref:
          "client:https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards:_meta",
      },
      tier: {
        __ref: "https://ds.canonical.com/sites_webcomponentsprototype",
      },
    },
  "client:https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards:_meta":
    {
      __id: "client:https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards:_meta",
      __typename: "EntityMeta",
      title: "BlogCards",
      curie: "ds:sites_webcomponentsprototype.component.blog_cards",
    },
  "https://ds.canonical.com/sites_webcomponentsprototype": {
    __id: "https://ds.canonical.com/sites_webcomponentsprototype",
    __typename: "Tier",
    name: "Sites/WebComponentsPrototype",
    uri: "https://ds.canonical.com/sites_webcomponentsprototype",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:11": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:11",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.breadcrumbs",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.breadcrumbs": {
    __id: "https://ds.canonical.com/apps_launchpad.component.breadcrumbs",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.breadcrumbs",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.breadcrumbs:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.breadcrumbs:_meta":
    {
      __id: "client:https://ds.canonical.com/apps_launchpad.component.breadcrumbs:_meta",
      __typename: "EntityMeta",
      title: "Breadcrumbs",
      curie: "ds:apps_launchpad.component.breadcrumbs",
    },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:12": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:12",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.breadcrumbs",
    },
  },
  "https://ds.canonical.com/global.component.breadcrumbs": {
    __id: "https://ds.canonical.com/global.component.breadcrumbs",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.breadcrumbs",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.breadcrumbs:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.breadcrumbs:_meta": {
    __id: "client:https://ds.canonical.com/global.component.breadcrumbs:_meta",
    __typename: "EntityMeta",
    title: "Breadcrumbs",
    curie: "ds:global.component.breadcrumbs",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:13": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:13",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.button",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.button": {
    __id: "https://ds.canonical.com/apps_launchpad.component.button",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.button",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.button:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.button:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.button:_meta",
    __typename: "EntityMeta",
    title: "Button",
    curie: "ds:apps_launchpad.component.button",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:14": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:14",
    __typename: "NodeEdge",
    node: {
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
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.button:_meta": {
    __id: "client:https://ds.canonical.com/global.component.button:_meta",
    __typename: "EntityMeta",
    title: "Button",
    curie: "ds:global.component.button",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:15": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:15",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.button_link",
    },
  },
  "https://ds.canonical.com/global.component.button_link": {
    __id: "https://ds.canonical.com/global.component.button_link",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.button_link",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.button_link:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.button_link:_meta": {
    __id: "client:https://ds.canonical.com/global.component.button_link:_meta",
    __typename: "EntityMeta",
    title: "ButtonLink",
    curie: "ds:global.component.button_link",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:16": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:16",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.card",
    },
  },
  "https://ds.canonical.com/global.component.card": {
    __id: "https://ds.canonical.com/global.component.card",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.card",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.card:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.card:_meta": {
    __id: "client:https://ds.canonical.com/global.component.card:_meta",
    __typename: "EntityMeta",
    title: "Card",
    curie: "ds:global.component.card",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:17": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:17",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_landscape.component.checkbox_group",
    },
  },
  "https://ds.canonical.com/apps_landscape.component.checkbox_group": {
    __id: "https://ds.canonical.com/apps_landscape.component.checkbox_group",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_landscape.component.checkbox_group",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_landscape.component.checkbox_group:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_landscape",
    },
  },
  "client:https://ds.canonical.com/apps_landscape.component.checkbox_group:_meta":
    {
      __id: "client:https://ds.canonical.com/apps_landscape.component.checkbox_group:_meta",
      __typename: "EntityMeta",
      title: "Checkbox Group",
      curie: "ds:apps_landscape.component.checkbox_group",
    },
  "https://ds.canonical.com/apps_landscape": {
    __id: "https://ds.canonical.com/apps_landscape",
    __typename: "Tier",
    name: "Apps/Landscape",
    uri: "https://ds.canonical.com/apps_landscape",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:18": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:18",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.checkbox_field",
    },
  },
  "https://ds.canonical.com/global.component.checkbox_field": {
    __id: "https://ds.canonical.com/global.component.checkbox_field",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.checkbox_field",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.checkbox_field:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.checkbox_field:_meta": {
    __id: "client:https://ds.canonical.com/global.component.checkbox_field:_meta",
    __typename: "EntityMeta",
    title: "CheckboxField",
    curie: "ds:global.component.checkbox_field",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:19": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:19",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.checkbox_input",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.checkbox_input": {
    __id: "https://ds.canonical.com/apps_launchpad.component.checkbox_input",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.checkbox_input",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.checkbox_input:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.checkbox_input:_meta":
    {
      __id: "client:https://ds.canonical.com/apps_launchpad.component.checkbox_input:_meta",
      __typename: "EntityMeta",
      title: "CheckboxInput",
      curie: "ds:apps_launchpad.component.checkbox_input",
    },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:20": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:20",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_launchpad.component.chip",
    },
  },
  "https://ds.canonical.com/apps_launchpad.component.chip": {
    __id: "https://ds.canonical.com/apps_launchpad.component.chip",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_launchpad.component.chip",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_launchpad.component.chip:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_launchpad",
    },
  },
  "client:https://ds.canonical.com/apps_launchpad.component.chip:_meta": {
    __id: "client:https://ds.canonical.com/apps_launchpad.component.chip:_meta",
    __typename: "EntityMeta",
    title: "Chip",
    curie: "ds:apps_launchpad.component.chip",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:21": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:21",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.chip",
    },
  },
  "https://ds.canonical.com/global.component.chip": {
    __id: "https://ds.canonical.com/global.component.chip",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.chip",
    _meta: {
      __ref: "client:https://ds.canonical.com/global.component.chip:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.chip:_meta": {
    __id: "client:https://ds.canonical.com/global.component.chip:_meta",
    __typename: "EntityMeta",
    title: "Chip",
    curie: "ds:global.component.chip",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:22": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:22",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/global.component.choices_field",
    },
  },
  "https://ds.canonical.com/global.component.choices_field": {
    __id: "https://ds.canonical.com/global.component.choices_field",
    __typename: "Component",
    uri: "https://ds.canonical.com/global.component.choices_field",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/global.component.choices_field:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/global",
    },
  },
  "client:https://ds.canonical.com/global.component.choices_field:_meta": {
    __id: "client:https://ds.canonical.com/global.component.choices_field:_meta",
    __typename: "EntityMeta",
    title: "ChoicesField",
    curie: "ds:global.component.choices_field",
  },
  "client:https://ds.canonical.com/Component:instances(first:24):edges:23": {
    __id: "client:https://ds.canonical.com/Component:instances(first:24):edges:23",
    __typename: "NodeEdge",
    node: {
      __ref: "https://ds.canonical.com/apps_landscape.component.code_editor",
    },
  },
  "https://ds.canonical.com/apps_landscape.component.code_editor": {
    __id: "https://ds.canonical.com/apps_landscape.component.code_editor",
    __typename: "Component",
    uri: "https://ds.canonical.com/apps_landscape.component.code_editor",
    _meta: {
      __ref:
        "client:https://ds.canonical.com/apps_landscape.component.code_editor:_meta",
    },
    tier: {
      __ref: "https://ds.canonical.com/apps_landscape",
    },
  },
  "client:https://ds.canonical.com/apps_landscape.component.code_editor:_meta":
    {
      __id: "client:https://ds.canonical.com/apps_landscape.component.code_editor:_meta",
      __typename: "EntityMeta",
      title: "Code Editor",
      curie: "ds:apps_landscape.component.code_editor",
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
