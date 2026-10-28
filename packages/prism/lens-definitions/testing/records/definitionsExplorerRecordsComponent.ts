/**
 * A serialised Relay store snapshot for `DefinitionsExplorerQuery` at
 * { uri: "ds:Component", hasTerm: true }: the store a site's prepare step
 * serialises for hydration (`getStore().getSource().toJSON()`) at
 * /definitions/ds%3AComponent.
 *
 * The instance-bearing twin of `definitionsExplorerRecords`: its
 * instances carry the absolute IRI the graph returns as their `uri` and
 * their compact form in `_meta.curie`.
 *
 * Regenerate: execute `DefinitionsExplorerQuery` at these variables through
 * a Relay environment whose network answers from
 * `createPragmaProvider({ semRoot: null })` in process, over the
 * design-system, code-standards and anatomy-dsl ref packages, and serialise
 * its store with `getStore().getSource().toJSON()`.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";

const definitionsExplorerRecordsComponent = {
  "client:__type:Component": {
    __id: "client:__type:Component",
    __typename: "__TypeSchema",
    __isNode: true,
  },
  "client:root": {
    __id: "client:root",
    __typename: "__Root",
    ontologies: {
      __refs: [
        "client:root:ontologies:0",
        "client:root:ontologies:1",
        "client:root:ontologies:2",
      ],
    },
    'ontologyClass(uri:"ds:Component")': {
      __ref: 'client:root:ontologyClass(uri:"ds:Component")',
    },
    'ontologyProperty(uri:"ds:Component")': null,
  },
  "client:root:ontologies:0": {
    __id: "client:root:ontologies:0",
    __typename: "Ontology",
    prefix: "ds",
    namespace: "https://ds.canonical.com/",
    classes: {
      __refs: [
        "client:root:ontologies:0:classes:0",
        "client:root:ontologies:0:classes:1",
        "client:root:ontologies:0:classes:2",
        "client:root:ontologies:0:classes:3",
        "client:root:ontologies:0:classes:4",
        "client:root:ontologies:0:classes:5",
        "client:root:ontologies:0:classes:6",
        "client:root:ontologies:0:classes:7",
        "client:root:ontologies:0:classes:8",
        "client:root:ontologies:0:classes:9",
        "client:root:ontologies:0:classes:10",
        "client:root:ontologies:0:classes:11",
        "client:root:ontologies:0:classes:12",
        "client:root:ontologies:0:classes:13",
        "client:root:ontologies:0:classes:14",
        "client:root:ontologies:0:classes:15",
        "client:root:ontologies:0:classes:16",
        "client:root:ontologies:0:classes:17",
        "client:root:ontologies:0:classes:18",
        "client:root:ontologies:0:classes:19",
      ],
    },
    label: "ds",
    properties: {
      __refs: [
        "client:root:ontologies:0:properties:0",
        "client:root:ontologies:0:properties:1",
        "client:root:ontologies:0:properties:2",
        "client:root:ontologies:0:properties:3",
        "client:root:ontologies:0:properties:4",
        "client:root:ontologies:0:properties:5",
        "client:root:ontologies:0:properties:6",
        "client:root:ontologies:0:properties:7",
        "client:root:ontologies:0:properties:8",
        "client:root:ontologies:0:properties:9",
        "client:root:ontologies:0:properties:10",
        "client:root:ontologies:0:properties:11",
        "client:root:ontologies:0:properties:12",
        "client:root:ontologies:0:properties:13",
        "client:root:ontologies:0:properties:14",
        "client:root:ontologies:0:properties:15",
        "client:root:ontologies:0:properties:16",
        "client:root:ontologies:0:properties:17",
        "client:root:ontologies:0:properties:18",
        "client:root:ontologies:0:properties:19",
        "client:root:ontologies:0:properties:20",
        "client:root:ontologies:0:properties:21",
        "client:root:ontologies:0:properties:22",
        "client:root:ontologies:0:properties:23",
        "client:root:ontologies:0:properties:24",
        "client:root:ontologies:0:properties:25",
        "client:root:ontologies:0:properties:26",
        "client:root:ontologies:0:properties:27",
        "client:root:ontologies:0:properties:28",
        "client:root:ontologies:0:properties:29",
        "client:root:ontologies:0:properties:30",
        "client:root:ontologies:0:properties:31",
        "client:root:ontologies:0:properties:32",
        "client:root:ontologies:0:properties:33",
        "client:root:ontologies:0:properties:34",
        "client:root:ontologies:0:properties:35",
        "client:root:ontologies:0:properties:36",
        "client:root:ontologies:0:properties:37",
        "client:root:ontologies:0:properties:38",
        "client:root:ontologies:0:properties:39",
        "client:root:ontologies:0:properties:40",
        "client:root:ontologies:0:properties:41",
        "client:root:ontologies:0:properties:42",
        "client:root:ontologies:0:properties:43",
        "client:root:ontologies:0:properties:44",
        "client:root:ontologies:0:properties:45",
        "client:root:ontologies:0:properties:46",
        "client:root:ontologies:0:properties:47",
        "client:root:ontologies:0:properties:48",
        "client:root:ontologies:0:properties:49",
        "client:root:ontologies:0:properties:50",
        "client:root:ontologies:0:properties:51",
        "client:root:ontologies:0:properties:52",
        "client:root:ontologies:0:properties:53",
        "client:root:ontologies:0:properties:54",
        "client:root:ontologies:0:properties:55",
        "client:root:ontologies:0:properties:56",
        "client:root:ontologies:0:properties:57",
        "client:root:ontologies:0:properties:58",
        "client:root:ontologies:0:properties:59",
        "client:root:ontologies:0:properties:60",
      ],
    },
  },
  "client:root:ontologies:0:classes:0": {
    __id: "client:root:ontologies:0:classes:0",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TokenBinding",
    isAbstract: false,
    instanceCount: 0,
    label: "Token Binding",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:0:properties:0",
        "client:root:ontologies:0:classes:0:properties:1",
        "client:root:ontologies:0:classes:0:properties:2",
        "client:root:ontologies:0:classes:0:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:0:properties:0": {
    __id: "client:root:ontologies:0:classes:0:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:0:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:0:properties:0:property": {
    __id: "client:root:ontologies:0:classes:0:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/viaBlock",
  },
  "client:root:ontologies:0:classes:0:properties:1": {
    __id: "client:root:ontologies:0:classes:0:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:0:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:0:properties:1:property": {
    __id: "client:root:ontologies:0:classes:0:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/consumesSymbol",
  },
  "client:root:ontologies:0:classes:0:properties:2": {
    __id: "client:root:ontologies:0:classes:0:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:0:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:0:properties:2:property": {
    __id: "client:root:ontologies:0:classes:0:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/rank",
  },
  "client:root:ontologies:0:classes:0:properties:3": {
    __id: "client:root:ontologies:0:classes:0:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:0:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:0:properties:3:property": {
    __id: "client:root:ontologies:0:classes:0:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/node",
  },
  "client:root:ontologies:0:classes:1": {
    __id: "client:root:ontologies:0:classes:1",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ConceptType",
    isAbstract: false,
    instanceCount: 4,
    label: "Concept Type",
    superclass: {
      __ref: "client:root:ontologies:0:classes:1:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:1:properties:0",
        "client:root:ontologies:0:classes:1:properties:1",
        "client:root:ontologies:0:classes:1:properties:2",
        "client:root:ontologies:0:classes:1:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:10": {
    __id: "client:root:ontologies:0:classes:10",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ModifierFamily",
    isAbstract: false,
    instanceCount: 11,
    label: "Modifier Family",
    superclass: {
      __ref: "client:root:ontologies:0:classes:10:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:10:properties:0",
        "client:root:ontologies:0:classes:10:properties:1",
        "client:root:ontologies:0:classes:10:properties:2",
        "client:root:ontologies:0:classes:10:properties:3",
        "client:root:ontologies:0:classes:10:properties:4",
      ],
    },
  },
  "client:root:ontologies:0:classes:10:properties:0": {
    __id: "client:root:ontologies:0:classes:10:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:10:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:10:properties:0:property": {
    __id: "client:root:ontologies:0:classes:10:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifier",
  },
  "client:root:ontologies:0:classes:10:properties:1": {
    __id: "client:root:ontologies:0:classes:10:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:10:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:10:properties:1:property": {
    __id: "client:root:ontologies:0:classes:10:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:10:properties:2": {
    __id: "client:root:ontologies:0:classes:10:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:10:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:10:properties:2:property": {
    __id: "client:root:ontologies:0:classes:10:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:10:properties:3": {
    __id: "client:root:ontologies:0:classes:10:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:10:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:10:properties:3:property": {
    __id: "client:root:ontologies:0:classes:10:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:10:properties:4": {
    __id: "client:root:ontologies:0:classes:10:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:10:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:10:properties:4:property": {
    __id: "client:root:ontologies:0:classes:10:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:10:superclass": {
    __id: "client:root:ontologies:0:classes:10:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIElement",
  },
  "client:root:ontologies:0:classes:11": {
    __id: "client:root:ontologies:0:classes:11",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Modifier",
    isAbstract: false,
    instanceCount: 33,
    label: "Modifier",
    superclass: {
      __ref: "client:root:ontologies:0:classes:11:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:11:properties:0",
        "client:root:ontologies:0:classes:11:properties:1",
        "client:root:ontologies:0:classes:11:properties:2",
        "client:root:ontologies:0:classes:11:properties:3",
        "client:root:ontologies:0:classes:11:properties:4",
      ],
    },
  },
  "client:root:ontologies:0:classes:11:properties:0": {
    __id: "client:root:ontologies:0:classes:11:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:11:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:11:properties:0:property": {
    __id: "client:root:ontologies:0:classes:11:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/modifierFamily",
  },
  "client:root:ontologies:0:classes:11:properties:1": {
    __id: "client:root:ontologies:0:classes:11:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:11:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:11:properties:1:property": {
    __id: "client:root:ontologies:0:classes:11:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:11:properties:2": {
    __id: "client:root:ontologies:0:classes:11:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:11:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:11:properties:2:property": {
    __id: "client:root:ontologies:0:classes:11:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:11:properties:3": {
    __id: "client:root:ontologies:0:classes:11:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:11:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:11:properties:3:property": {
    __id: "client:root:ontologies:0:classes:11:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:11:properties:4": {
    __id: "client:root:ontologies:0:classes:11:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:11:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:11:properties:4:property": {
    __id: "client:root:ontologies:0:classes:11:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:11:superclass": {
    __id: "client:root:ontologies:0:classes:11:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIElement",
  },
  "client:root:ontologies:0:classes:12": {
    __id: "client:root:ontologies:0:classes:12",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Group",
    isAbstract: false,
    instanceCount: 9,
    label: "Group",
    superclass: {
      __ref: "client:root:ontologies:0:classes:12:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:12:properties:0",
        "client:root:ontologies:0:classes:12:properties:1",
        "client:root:ontologies:0:classes:12:properties:2",
        "client:root:ontologies:0:classes:12:properties:3",
        "client:root:ontologies:0:classes:12:properties:4",
        "client:root:ontologies:0:classes:12:properties:5",
        "client:root:ontologies:0:classes:12:properties:6",
        "client:root:ontologies:0:classes:12:properties:7",
        "client:root:ontologies:0:classes:12:properties:8",
        "client:root:ontologies:0:classes:12:properties:9",
        "client:root:ontologies:0:classes:12:properties:10",
        "client:root:ontologies:0:classes:12:properties:11",
        "client:root:ontologies:0:classes:12:properties:12",
        "client:root:ontologies:0:classes:12:properties:13",
        "client:root:ontologies:0:classes:12:properties:14",
        "client:root:ontologies:0:classes:12:properties:15",
        "client:root:ontologies:0:classes:12:properties:16",
        "client:root:ontologies:0:classes:12:properties:17",
        "client:root:ontologies:0:classes:12:properties:18",
      ],
    },
  },
  "client:root:ontologies:0:classes:12:properties:0": {
    __id: "client:root:ontologies:0:classes:12:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:0:property": {
    __id: "client:root:ontologies:0:classes:12:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:12:properties:1": {
    __id: "client:root:ontologies:0:classes:12:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:10": {
    __id: "client:root:ontologies:0:classes:12:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:10:property": {
    __id: "client:root:ontologies:0:classes:12:properties:10:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:12:properties:11": {
    __id: "client:root:ontologies:0:classes:12:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:11:property": {
    __id: "client:root:ontologies:0:classes:12:properties:11:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:12:properties:12": {
    __id: "client:root:ontologies:0:classes:12:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:12:property": {
    __id: "client:root:ontologies:0:classes:12:properties:12:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:12:properties:13": {
    __id: "client:root:ontologies:0:classes:12:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:13:property": {
    __id: "client:root:ontologies:0:classes:12:properties:13:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:12:properties:14": {
    __id: "client:root:ontologies:0:classes:12:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:14:property": {
    __id: "client:root:ontologies:0:classes:12:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:12:properties:15": {
    __id: "client:root:ontologies:0:classes:12:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:15:property": {
    __id: "client:root:ontologies:0:classes:12:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:12:properties:16": {
    __id: "client:root:ontologies:0:classes:12:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:16:property": {
    __id: "client:root:ontologies:0:classes:12:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:12:properties:17": {
    __id: "client:root:ontologies:0:classes:12:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:17:property": {
    __id: "client:root:ontologies:0:classes:12:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:12:properties:18": {
    __id: "client:root:ontologies:0:classes:12:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:18:property": {
    __id: "client:root:ontologies:0:classes:12:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:12:properties:1:property": {
    __id: "client:root:ontologies:0:classes:12:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:12:properties:2": {
    __id: "client:root:ontologies:0:classes:12:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:2:property": {
    __id: "client:root:ontologies:0:classes:12:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:12:properties:3": {
    __id: "client:root:ontologies:0:classes:12:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:3:property": {
    __id: "client:root:ontologies:0:classes:12:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:12:properties:4": {
    __id: "client:root:ontologies:0:classes:12:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:4:property": {
    __id: "client:root:ontologies:0:classes:12:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:12:properties:5": {
    __id: "client:root:ontologies:0:classes:12:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:5:property": {
    __id: "client:root:ontologies:0:classes:12:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:12:properties:6": {
    __id: "client:root:ontologies:0:classes:12:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:6:property": {
    __id: "client:root:ontologies:0:classes:12:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:12:properties:7": {
    __id: "client:root:ontologies:0:classes:12:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:7:property": {
    __id: "client:root:ontologies:0:classes:12:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:12:properties:8": {
    __id: "client:root:ontologies:0:classes:12:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:8:property": {
    __id: "client:root:ontologies:0:classes:12:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:12:properties:9": {
    __id: "client:root:ontologies:0:classes:12:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:12:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:12:properties:9:property": {
    __id: "client:root:ontologies:0:classes:12:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:12:superclass": {
    __id: "client:root:ontologies:0:classes:12:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:classes:13": {
    __id: "client:root:ontologies:0:classes:13",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Subcomponent",
    isAbstract: false,
    instanceCount: 95,
    label: "Subcomponent",
    superclass: {
      __ref: "client:root:ontologies:0:classes:13:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:13:properties:0",
        "client:root:ontologies:0:classes:13:properties:1",
        "client:root:ontologies:0:classes:13:properties:2",
        "client:root:ontologies:0:classes:13:properties:3",
        "client:root:ontologies:0:classes:13:properties:4",
        "client:root:ontologies:0:classes:13:properties:5",
        "client:root:ontologies:0:classes:13:properties:6",
        "client:root:ontologies:0:classes:13:properties:7",
        "client:root:ontologies:0:classes:13:properties:8",
        "client:root:ontologies:0:classes:13:properties:9",
        "client:root:ontologies:0:classes:13:properties:10",
        "client:root:ontologies:0:classes:13:properties:11",
        "client:root:ontologies:0:classes:13:properties:12",
        "client:root:ontologies:0:classes:13:properties:13",
        "client:root:ontologies:0:classes:13:properties:14",
        "client:root:ontologies:0:classes:13:properties:15",
        "client:root:ontologies:0:classes:13:properties:16",
        "client:root:ontologies:0:classes:13:properties:17",
        "client:root:ontologies:0:classes:13:properties:18",
        "client:root:ontologies:0:classes:13:properties:19",
        "client:root:ontologies:0:classes:13:properties:20",
      ],
    },
  },
  "client:root:ontologies:0:classes:13:properties:0": {
    __id: "client:root:ontologies:0:classes:13:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:0:property": {
    __id: "client:root:ontologies:0:classes:13:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/parentComponent",
  },
  "client:root:ontologies:0:classes:13:properties:1": {
    __id: "client:root:ontologies:0:classes:13:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:10": {
    __id: "client:root:ontologies:0:classes:13:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:10:property": {
    __id: "client:root:ontologies:0:classes:13:properties:10:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:13:properties:11": {
    __id: "client:root:ontologies:0:classes:13:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:11:property": {
    __id: "client:root:ontologies:0:classes:13:properties:11:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:13:properties:12": {
    __id: "client:root:ontologies:0:classes:13:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:12:property": {
    __id: "client:root:ontologies:0:classes:13:properties:12:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:13:properties:13": {
    __id: "client:root:ontologies:0:classes:13:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:13:property": {
    __id: "client:root:ontologies:0:classes:13:properties:13:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:13:properties:14": {
    __id: "client:root:ontologies:0:classes:13:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:14:property": {
    __id: "client:root:ontologies:0:classes:13:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:13:properties:15": {
    __id: "client:root:ontologies:0:classes:13:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:15:property": {
    __id: "client:root:ontologies:0:classes:13:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:13:properties:16": {
    __id: "client:root:ontologies:0:classes:13:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:16:property": {
    __id: "client:root:ontologies:0:classes:13:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:13:properties:17": {
    __id: "client:root:ontologies:0:classes:13:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:17:property": {
    __id: "client:root:ontologies:0:classes:13:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:13:properties:18": {
    __id: "client:root:ontologies:0:classes:13:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:18:property": {
    __id: "client:root:ontologies:0:classes:13:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:13:properties:19": {
    __id: "client:root:ontologies:0:classes:13:properties:19",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:19:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:19:property": {
    __id: "client:root:ontologies:0:classes:13:properties:19:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:13:properties:1:property": {
    __id: "client:root:ontologies:0:classes:13:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/standalone",
  },
  "client:root:ontologies:0:classes:13:properties:2": {
    __id: "client:root:ontologies:0:classes:13:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:20": {
    __id: "client:root:ontologies:0:classes:13:properties:20",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:20:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:20:property": {
    __id: "client:root:ontologies:0:classes:13:properties:20:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:13:properties:2:property": {
    __id: "client:root:ontologies:0:classes:13:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:13:properties:3": {
    __id: "client:root:ontologies:0:classes:13:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:3:property": {
    __id: "client:root:ontologies:0:classes:13:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:13:properties:4": {
    __id: "client:root:ontologies:0:classes:13:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:4:property": {
    __id: "client:root:ontologies:0:classes:13:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:13:properties:5": {
    __id: "client:root:ontologies:0:classes:13:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:5:property": {
    __id: "client:root:ontologies:0:classes:13:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:13:properties:6": {
    __id: "client:root:ontologies:0:classes:13:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:6:property": {
    __id: "client:root:ontologies:0:classes:13:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:13:properties:7": {
    __id: "client:root:ontologies:0:classes:13:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:7:property": {
    __id: "client:root:ontologies:0:classes:13:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:13:properties:8": {
    __id: "client:root:ontologies:0:classes:13:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:8:property": {
    __id: "client:root:ontologies:0:classes:13:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:13:properties:9": {
    __id: "client:root:ontologies:0:classes:13:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:13:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:13:properties:9:property": {
    __id: "client:root:ontologies:0:classes:13:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:13:superclass": {
    __id: "client:root:ontologies:0:classes:13:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:classes:14": {
    __id: "client:root:ontologies:0:classes:14",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Layout",
    isAbstract: false,
    instanceCount: 16,
    label: "Layout",
    superclass: {
      __ref: "client:root:ontologies:0:classes:14:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:14:properties:0",
        "client:root:ontologies:0:classes:14:properties:1",
        "client:root:ontologies:0:classes:14:properties:2",
        "client:root:ontologies:0:classes:14:properties:3",
        "client:root:ontologies:0:classes:14:properties:4",
        "client:root:ontologies:0:classes:14:properties:5",
        "client:root:ontologies:0:classes:14:properties:6",
        "client:root:ontologies:0:classes:14:properties:7",
        "client:root:ontologies:0:classes:14:properties:8",
        "client:root:ontologies:0:classes:14:properties:9",
        "client:root:ontologies:0:classes:14:properties:10",
        "client:root:ontologies:0:classes:14:properties:11",
        "client:root:ontologies:0:classes:14:properties:12",
        "client:root:ontologies:0:classes:14:properties:13",
        "client:root:ontologies:0:classes:14:properties:14",
        "client:root:ontologies:0:classes:14:properties:15",
        "client:root:ontologies:0:classes:14:properties:16",
        "client:root:ontologies:0:classes:14:properties:17",
        "client:root:ontologies:0:classes:14:properties:18",
        "client:root:ontologies:0:classes:14:properties:19",
        "client:root:ontologies:0:classes:14:properties:20",
        "client:root:ontologies:0:classes:14:properties:21",
        "client:root:ontologies:0:classes:14:properties:22",
      ],
    },
  },
  "client:root:ontologies:0:classes:14:properties:0": {
    __id: "client:root:ontologies:0:classes:14:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:0:property": {
    __id: "client:root:ontologies:0:classes:14:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/targetDevices",
  },
  "client:root:ontologies:0:classes:14:properties:1": {
    __id: "client:root:ontologies:0:classes:14:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:10": {
    __id: "client:root:ontologies:0:classes:14:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:10:property": {
    __id: "client:root:ontologies:0:classes:14:properties:10:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:14:properties:11": {
    __id: "client:root:ontologies:0:classes:14:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:11:property": {
    __id: "client:root:ontologies:0:classes:14:properties:11:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:14:properties:12": {
    __id: "client:root:ontologies:0:classes:14:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:12:property": {
    __id: "client:root:ontologies:0:classes:14:properties:12:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:14:properties:13": {
    __id: "client:root:ontologies:0:classes:14:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:13:property": {
    __id: "client:root:ontologies:0:classes:14:properties:13:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:14:properties:14": {
    __id: "client:root:ontologies:0:classes:14:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:14:property": {
    __id: "client:root:ontologies:0:classes:14:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:14:properties:15": {
    __id: "client:root:ontologies:0:classes:14:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:15:property": {
    __id: "client:root:ontologies:0:classes:14:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:14:properties:16": {
    __id: "client:root:ontologies:0:classes:14:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:16:property": {
    __id: "client:root:ontologies:0:classes:14:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:14:properties:17": {
    __id: "client:root:ontologies:0:classes:14:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:17:property": {
    __id: "client:root:ontologies:0:classes:14:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:14:properties:18": {
    __id: "client:root:ontologies:0:classes:14:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:18:property": {
    __id: "client:root:ontologies:0:classes:14:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:14:properties:19": {
    __id: "client:root:ontologies:0:classes:14:properties:19",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:19:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:19:property": {
    __id: "client:root:ontologies:0:classes:14:properties:19:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:14:properties:1:property": {
    __id: "client:root:ontologies:0:classes:14:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/gridAreas",
  },
  "client:root:ontologies:0:classes:14:properties:2": {
    __id: "client:root:ontologies:0:classes:14:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:20": {
    __id: "client:root:ontologies:0:classes:14:properties:20",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:20:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:20:property": {
    __id: "client:root:ontologies:0:classes:14:properties:20:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:14:properties:21": {
    __id: "client:root:ontologies:0:classes:14:properties:21",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:21:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:21:property": {
    __id: "client:root:ontologies:0:classes:14:properties:21:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:14:properties:22": {
    __id: "client:root:ontologies:0:classes:14:properties:22",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:22:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:22:property": {
    __id: "client:root:ontologies:0:classes:14:properties:22:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:14:properties:2:property": {
    __id: "client:root:ontologies:0:classes:14:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/domain",
  },
  "client:root:ontologies:0:classes:14:properties:3": {
    __id: "client:root:ontologies:0:classes:14:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:3:property": {
    __id: "client:root:ontologies:0:classes:14:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/grid",
  },
  "client:root:ontologies:0:classes:14:properties:4": {
    __id: "client:root:ontologies:0:classes:14:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:4:property": {
    __id: "client:root:ontologies:0:classes:14:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:14:properties:5": {
    __id: "client:root:ontologies:0:classes:14:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:5:property": {
    __id: "client:root:ontologies:0:classes:14:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:14:properties:6": {
    __id: "client:root:ontologies:0:classes:14:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:6:property": {
    __id: "client:root:ontologies:0:classes:14:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:14:properties:7": {
    __id: "client:root:ontologies:0:classes:14:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:7:property": {
    __id: "client:root:ontologies:0:classes:14:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:14:properties:8": {
    __id: "client:root:ontologies:0:classes:14:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:8:property": {
    __id: "client:root:ontologies:0:classes:14:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:14:properties:9": {
    __id: "client:root:ontologies:0:classes:14:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:14:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:14:properties:9:property": {
    __id: "client:root:ontologies:0:classes:14:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:14:superclass": {
    __id: "client:root:ontologies:0:classes:14:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:classes:15": {
    __id: "client:root:ontologies:0:classes:15",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Pattern",
    isAbstract: false,
    instanceCount: 63,
    label: "Pattern",
    superclass: {
      __ref: "client:root:ontologies:0:classes:15:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:15:properties:0",
        "client:root:ontologies:0:classes:15:properties:1",
        "client:root:ontologies:0:classes:15:properties:2",
        "client:root:ontologies:0:classes:15:properties:3",
        "client:root:ontologies:0:classes:15:properties:4",
        "client:root:ontologies:0:classes:15:properties:5",
        "client:root:ontologies:0:classes:15:properties:6",
        "client:root:ontologies:0:classes:15:properties:7",
        "client:root:ontologies:0:classes:15:properties:8",
        "client:root:ontologies:0:classes:15:properties:9",
        "client:root:ontologies:0:classes:15:properties:10",
        "client:root:ontologies:0:classes:15:properties:11",
        "client:root:ontologies:0:classes:15:properties:12",
        "client:root:ontologies:0:classes:15:properties:13",
        "client:root:ontologies:0:classes:15:properties:14",
        "client:root:ontologies:0:classes:15:properties:15",
        "client:root:ontologies:0:classes:15:properties:16",
        "client:root:ontologies:0:classes:15:properties:17",
        "client:root:ontologies:0:classes:15:properties:18",
      ],
    },
  },
  "client:root:ontologies:0:classes:15:properties:0": {
    __id: "client:root:ontologies:0:classes:15:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:0:property": {
    __id: "client:root:ontologies:0:classes:15:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:15:properties:1": {
    __id: "client:root:ontologies:0:classes:15:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:10": {
    __id: "client:root:ontologies:0:classes:15:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:10:property": {
    __id: "client:root:ontologies:0:classes:15:properties:10:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:15:properties:11": {
    __id: "client:root:ontologies:0:classes:15:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:11:property": {
    __id: "client:root:ontologies:0:classes:15:properties:11:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:15:properties:12": {
    __id: "client:root:ontologies:0:classes:15:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:12:property": {
    __id: "client:root:ontologies:0:classes:15:properties:12:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:15:properties:13": {
    __id: "client:root:ontologies:0:classes:15:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:13:property": {
    __id: "client:root:ontologies:0:classes:15:properties:13:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:15:properties:14": {
    __id: "client:root:ontologies:0:classes:15:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:14:property": {
    __id: "client:root:ontologies:0:classes:15:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:15:properties:15": {
    __id: "client:root:ontologies:0:classes:15:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:15:property": {
    __id: "client:root:ontologies:0:classes:15:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:15:properties:16": {
    __id: "client:root:ontologies:0:classes:15:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:16:property": {
    __id: "client:root:ontologies:0:classes:15:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:15:properties:17": {
    __id: "client:root:ontologies:0:classes:15:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:17:property": {
    __id: "client:root:ontologies:0:classes:15:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:15:properties:18": {
    __id: "client:root:ontologies:0:classes:15:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:18:property": {
    __id: "client:root:ontologies:0:classes:15:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:15:properties:1:property": {
    __id: "client:root:ontologies:0:classes:15:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:15:properties:2": {
    __id: "client:root:ontologies:0:classes:15:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:2:property": {
    __id: "client:root:ontologies:0:classes:15:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:15:properties:3": {
    __id: "client:root:ontologies:0:classes:15:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:3:property": {
    __id: "client:root:ontologies:0:classes:15:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:15:properties:4": {
    __id: "client:root:ontologies:0:classes:15:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:4:property": {
    __id: "client:root:ontologies:0:classes:15:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:15:properties:5": {
    __id: "client:root:ontologies:0:classes:15:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:5:property": {
    __id: "client:root:ontologies:0:classes:15:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:15:properties:6": {
    __id: "client:root:ontologies:0:classes:15:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:6:property": {
    __id: "client:root:ontologies:0:classes:15:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:15:properties:7": {
    __id: "client:root:ontologies:0:classes:15:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:7:property": {
    __id: "client:root:ontologies:0:classes:15:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:15:properties:8": {
    __id: "client:root:ontologies:0:classes:15:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:8:property": {
    __id: "client:root:ontologies:0:classes:15:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:15:properties:9": {
    __id: "client:root:ontologies:0:classes:15:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:15:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:15:properties:9:property": {
    __id: "client:root:ontologies:0:classes:15:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:15:superclass": {
    __id: "client:root:ontologies:0:classes:15:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:classes:16": {
    __id: "client:root:ontologies:0:classes:16",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Component",
    isAbstract: false,
    instanceCount: 139,
    label: "Component",
    superclass: {
      __ref: "client:root:ontologies:0:classes:16:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:16:properties:0",
        "client:root:ontologies:0:classes:16:properties:1",
        "client:root:ontologies:0:classes:16:properties:2",
        "client:root:ontologies:0:classes:16:properties:3",
        "client:root:ontologies:0:classes:16:properties:4",
        "client:root:ontologies:0:classes:16:properties:5",
        "client:root:ontologies:0:classes:16:properties:6",
        "client:root:ontologies:0:classes:16:properties:7",
        "client:root:ontologies:0:classes:16:properties:8",
        "client:root:ontologies:0:classes:16:properties:9",
        "client:root:ontologies:0:classes:16:properties:10",
        "client:root:ontologies:0:classes:16:properties:11",
        "client:root:ontologies:0:classes:16:properties:12",
        "client:root:ontologies:0:classes:16:properties:13",
        "client:root:ontologies:0:classes:16:properties:14",
        "client:root:ontologies:0:classes:16:properties:15",
        "client:root:ontologies:0:classes:16:properties:16",
        "client:root:ontologies:0:classes:16:properties:17",
        "client:root:ontologies:0:classes:16:properties:18",
        "client:root:ontologies:0:classes:16:properties:19",
      ],
    },
  },
  "client:root:ontologies:0:classes:16:properties:0": {
    __id: "client:root:ontologies:0:classes:16:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:0:property": {
    __id: "client:root:ontologies:0:classes:16:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasSubcomponent",
  },
  "client:root:ontologies:0:classes:16:properties:1": {
    __id: "client:root:ontologies:0:classes:16:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:10": {
    __id: "client:root:ontologies:0:classes:16:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:10:property": {
    __id: "client:root:ontologies:0:classes:16:properties:10:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:16:properties:11": {
    __id: "client:root:ontologies:0:classes:16:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:11:property": {
    __id: "client:root:ontologies:0:classes:16:properties:11:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:16:properties:12": {
    __id: "client:root:ontologies:0:classes:16:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:12:property": {
    __id: "client:root:ontologies:0:classes:16:properties:12:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:16:properties:13": {
    __id: "client:root:ontologies:0:classes:16:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:13:property": {
    __id: "client:root:ontologies:0:classes:16:properties:13:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:16:properties:14": {
    __id: "client:root:ontologies:0:classes:16:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:14:property": {
    __id: "client:root:ontologies:0:classes:16:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:16:properties:15": {
    __id: "client:root:ontologies:0:classes:16:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:15:property": {
    __id: "client:root:ontologies:0:classes:16:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:16:properties:16": {
    __id: "client:root:ontologies:0:classes:16:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:16:property": {
    __id: "client:root:ontologies:0:classes:16:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:16:properties:17": {
    __id: "client:root:ontologies:0:classes:16:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:17:property": {
    __id: "client:root:ontologies:0:classes:16:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:16:properties:18": {
    __id: "client:root:ontologies:0:classes:16:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:18:property": {
    __id: "client:root:ontologies:0:classes:16:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:16:properties:19": {
    __id: "client:root:ontologies:0:classes:16:properties:19",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:19:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:19:property": {
    __id: "client:root:ontologies:0:classes:16:properties:19:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:16:properties:1:property": {
    __id: "client:root:ontologies:0:classes:16:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:16:properties:2": {
    __id: "client:root:ontologies:0:classes:16:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:2:property": {
    __id: "client:root:ontologies:0:classes:16:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:16:properties:3": {
    __id: "client:root:ontologies:0:classes:16:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:3:property": {
    __id: "client:root:ontologies:0:classes:16:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:16:properties:4": {
    __id: "client:root:ontologies:0:classes:16:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:4:property": {
    __id: "client:root:ontologies:0:classes:16:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:16:properties:5": {
    __id: "client:root:ontologies:0:classes:16:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:5:property": {
    __id: "client:root:ontologies:0:classes:16:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:16:properties:6": {
    __id: "client:root:ontologies:0:classes:16:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:6:property": {
    __id: "client:root:ontologies:0:classes:16:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:16:properties:7": {
    __id: "client:root:ontologies:0:classes:16:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:7:property": {
    __id: "client:root:ontologies:0:classes:16:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:16:properties:8": {
    __id: "client:root:ontologies:0:classes:16:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:8:property": {
    __id: "client:root:ontologies:0:classes:16:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:16:properties:9": {
    __id: "client:root:ontologies:0:classes:16:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:16:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:16:properties:9:property": {
    __id: "client:root:ontologies:0:classes:16:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:16:superclass": {
    __id: "client:root:ontologies:0:classes:16:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:classes:17": {
    __id: "client:root:ontologies:0:classes:17",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    isAbstract: true,
    instanceCount: 0,
    label: "UI Block",
    superclass: {
      __ref: "client:root:ontologies:0:classes:17:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:17:properties:0",
        "client:root:ontologies:0:classes:17:properties:1",
        "client:root:ontologies:0:classes:17:properties:2",
        "client:root:ontologies:0:classes:17:properties:3",
        "client:root:ontologies:0:classes:17:properties:4",
        "client:root:ontologies:0:classes:17:properties:5",
        "client:root:ontologies:0:classes:17:properties:6",
        "client:root:ontologies:0:classes:17:properties:7",
        "client:root:ontologies:0:classes:17:properties:8",
        "client:root:ontologies:0:classes:17:properties:9",
        "client:root:ontologies:0:classes:17:properties:10",
        "client:root:ontologies:0:classes:17:properties:11",
        "client:root:ontologies:0:classes:17:properties:12",
        "client:root:ontologies:0:classes:17:properties:13",
        "client:root:ontologies:0:classes:17:properties:14",
        "client:root:ontologies:0:classes:17:properties:15",
        "client:root:ontologies:0:classes:17:properties:16",
        "client:root:ontologies:0:classes:17:properties:17",
        "client:root:ontologies:0:classes:17:properties:18",
      ],
    },
  },
  "client:root:ontologies:0:classes:17:properties:0": {
    __id: "client:root:ontologies:0:classes:17:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:0:property": {
    __id: "client:root:ontologies:0:classes:17:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasTokenBinding",
  },
  "client:root:ontologies:0:classes:17:properties:1": {
    __id: "client:root:ontologies:0:classes:17:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:10": {
    __id: "client:root:ontologies:0:classes:17:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:10:property": {
    __id: "client:root:ontologies:0:classes:17:properties:10:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/guidelines",
  },
  "client:root:ontologies:0:classes:17:properties:11": {
    __id: "client:root:ontologies:0:classes:17:properties:11",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:11:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:11:property": {
    __id: "client:root:ontologies:0:classes:17:properties:11:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/usage",
  },
  "client:root:ontologies:0:classes:17:properties:12": {
    __id: "client:root:ontologies:0:classes:17:properties:12",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:12:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:12:property": {
    __id: "client:root:ontologies:0:classes:17:properties:12:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyDsl",
  },
  "client:root:ontologies:0:classes:17:properties:13": {
    __id: "client:root:ontologies:0:classes:17:properties:13",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:13:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:13:property": {
    __id: "client:root:ontologies:0:classes:17:properties:13:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/anatomyClassic",
  },
  "client:root:ontologies:0:classes:17:properties:14": {
    __id: "client:root:ontologies:0:classes:17:properties:14",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:14:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:14:property": {
    __id: "client:root:ontologies:0:classes:17:properties:14:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/figmaLink",
  },
  "client:root:ontologies:0:classes:17:properties:15": {
    __id: "client:root:ontologies:0:classes:17:properties:15",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:15:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:15:property": {
    __id: "client:root:ontologies:0:classes:17:properties:15:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:17:properties:16": {
    __id: "client:root:ontologies:0:classes:17:properties:16",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:16:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:16:property": {
    __id: "client:root:ontologies:0:classes:17:properties:16:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:17:properties:17": {
    __id: "client:root:ontologies:0:classes:17:properties:17",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:17:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:17:property": {
    __id: "client:root:ontologies:0:classes:17:properties:17:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:17:properties:18": {
    __id: "client:root:ontologies:0:classes:17:properties:18",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:18:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:18:property": {
    __id: "client:root:ontologies:0:classes:17:properties:18:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:17:properties:1:property": {
    __id: "client:root:ontologies:0:classes:17:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasVariant",
  },
  "client:root:ontologies:0:classes:17:properties:2": {
    __id: "client:root:ontologies:0:classes:17:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:2:property": {
    __id: "client:root:ontologies:0:classes:17:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/variantOf",
  },
  "client:root:ontologies:0:classes:17:properties:3": {
    __id: "client:root:ontologies:0:classes:17:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:3:property": {
    __id: "client:root:ontologies:0:classes:17:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/specializedBy",
  },
  "client:root:ontologies:0:classes:17:properties:4": {
    __id: "client:root:ontologies:0:classes:17:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:4:property": {
    __id: "client:root:ontologies:0:classes:17:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/inheritsFrom",
  },
  "client:root:ontologies:0:classes:17:properties:5": {
    __id: "client:root:ontologies:0:classes:17:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:5:property": {
    __id: "client:root:ontologies:0:classes:17:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/changeLog",
  },
  "client:root:ontologies:0:classes:17:properties:6": {
    __id: "client:root:ontologies:0:classes:17:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:6:property": {
    __id: "client:root:ontologies:0:classes:17:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/documentationStage",
  },
  "client:root:ontologies:0:classes:17:properties:7": {
    __id: "client:root:ontologies:0:classes:17:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:7:property": {
    __id: "client:root:ontologies:0:classes:17:properties:7:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasProperty",
  },
  "client:root:ontologies:0:classes:17:properties:8": {
    __id: "client:root:ontologies:0:classes:17:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:8:property": {
    __id: "client:root:ontologies:0:classes:17:properties:8:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/hasModifierFamily",
  },
  "client:root:ontologies:0:classes:17:properties:9": {
    __id: "client:root:ontologies:0:classes:17:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:17:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:17:properties:9:property": {
    __id: "client:root:ontologies:0:classes:17:properties:9:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/tier",
  },
  "client:root:ontologies:0:classes:17:superclass": {
    __id: "client:root:ontologies:0:classes:17:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIElement",
  },
  "client:root:ontologies:0:classes:18": {
    __id: "client:root:ontologies:0:classes:18",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIElement",
    isAbstract: true,
    instanceCount: 0,
    label: "UI Element",
    superclass: {
      __ref: "client:root:ontologies:0:classes:18:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:18:properties:0",
        "client:root:ontologies:0:classes:18:properties:1",
        "client:root:ontologies:0:classes:18:properties:2",
        "client:root:ontologies:0:classes:18:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:18:properties:0": {
    __id: "client:root:ontologies:0:classes:18:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:18:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:18:properties:0:property": {
    __id: "client:root:ontologies:0:classes:18:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:18:properties:1": {
    __id: "client:root:ontologies:0:classes:18:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:18:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:18:properties:1:property": {
    __id: "client:root:ontologies:0:classes:18:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:18:properties:2": {
    __id: "client:root:ontologies:0:classes:18:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:18:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:18:properties:2:property": {
    __id: "client:root:ontologies:0:classes:18:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:18:properties:3": {
    __id: "client:root:ontologies:0:classes:18:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:18:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:18:properties:3:property": {
    __id: "client:root:ontologies:0:classes:18:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:18:superclass": {
    __id: "client:root:ontologies:0:classes:18:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:19": {
    __id: "client:root:ontologies:0:classes:19",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    isAbstract: true,
    instanceCount: 0,
    label: "Entity",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:19:properties:0",
        "client:root:ontologies:0:classes:19:properties:1",
        "client:root:ontologies:0:classes:19:properties:2",
        "client:root:ontologies:0:classes:19:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:19:properties:0": {
    __id: "client:root:ontologies:0:classes:19:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:19:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:19:properties:0:property": {
    __id: "client:root:ontologies:0:classes:19:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:19:properties:1": {
    __id: "client:root:ontologies:0:classes:19:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:19:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:19:properties:1:property": {
    __id: "client:root:ontologies:0:classes:19:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:19:properties:2": {
    __id: "client:root:ontologies:0:classes:19:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:19:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:19:properties:2:property": {
    __id: "client:root:ontologies:0:classes:19:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:19:properties:3": {
    __id: "client:root:ontologies:0:classes:19:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:19:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:19:properties:3:property": {
    __id: "client:root:ontologies:0:classes:19:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:1:properties:0": {
    __id: "client:root:ontologies:0:classes:1:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:1:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:1:properties:0:property": {
    __id: "client:root:ontologies:0:classes:1:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:1:properties:1": {
    __id: "client:root:ontologies:0:classes:1:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:1:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:1:properties:1:property": {
    __id: "client:root:ontologies:0:classes:1:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:1:properties:2": {
    __id: "client:root:ontologies:0:classes:1:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:1:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:1:properties:2:property": {
    __id: "client:root:ontologies:0:classes:1:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:1:properties:3": {
    __id: "client:root:ontologies:0:classes:1:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:1:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:1:properties:3:property": {
    __id: "client:root:ontologies:0:classes:1:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:1:superclass": {
    __id: "client:root:ontologies:0:classes:1:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:2": {
    __id: "client:root:ontologies:0:classes:2",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Concept",
    isAbstract: false,
    instanceCount: 13,
    label: "Concept",
    superclass: {
      __ref: "client:root:ontologies:0:classes:2:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:2:properties:0",
        "client:root:ontologies:0:classes:2:properties:1",
        "client:root:ontologies:0:classes:2:properties:2",
        "client:root:ontologies:0:classes:2:properties:3",
        "client:root:ontologies:0:classes:2:properties:4",
        "client:root:ontologies:0:classes:2:properties:5",
        "client:root:ontologies:0:classes:2:properties:6",
      ],
    },
  },
  "client:root:ontologies:0:classes:2:properties:0": {
    __id: "client:root:ontologies:0:classes:2:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:0:property": {
    __id: "client:root:ontologies:0:classes:2:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/conceptType",
  },
  "client:root:ontologies:0:classes:2:properties:1": {
    __id: "client:root:ontologies:0:classes:2:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:1:property": {
    __id: "client:root:ontologies:0:classes:2:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/knownEdgeCases",
  },
  "client:root:ontologies:0:classes:2:properties:2": {
    __id: "client:root:ontologies:0:classes:2:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:2:property": {
    __id: "client:root:ontologies:0:classes:2:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/content",
  },
  "client:root:ontologies:0:classes:2:properties:3": {
    __id: "client:root:ontologies:0:classes:2:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:3:property": {
    __id: "client:root:ontologies:0:classes:2:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:2:properties:4": {
    __id: "client:root:ontologies:0:classes:2:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:4:property": {
    __id: "client:root:ontologies:0:classes:2:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:2:properties:5": {
    __id: "client:root:ontologies:0:classes:2:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:5:property": {
    __id: "client:root:ontologies:0:classes:2:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:2:properties:6": {
    __id: "client:root:ontologies:0:classes:2:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:2:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:2:properties:6:property": {
    __id: "client:root:ontologies:0:classes:2:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:2:superclass": {
    __id: "client:root:ontologies:0:classes:2:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:3": {
    __id: "client:root:ontologies:0:classes:3",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    isAbstract: false,
    instanceCount: 0,
    label: "Change Log Entry",
    superclass: {
      __ref: "client:root:ontologies:0:classes:3:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:3:properties:0",
        "client:root:ontologies:0:classes:3:properties:1",
        "client:root:ontologies:0:classes:3:properties:2",
        "client:root:ontologies:0:classes:3:properties:3",
        "client:root:ontologies:0:classes:3:properties:4",
        "client:root:ontologies:0:classes:3:properties:5",
        "client:root:ontologies:0:classes:3:properties:6",
        "client:root:ontologies:0:classes:3:properties:7",
        "client:root:ontologies:0:classes:3:properties:8",
      ],
    },
  },
  "client:root:ontologies:0:classes:3:properties:0": {
    __id: "client:root:ontologies:0:classes:3:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:0:property": {
    __id: "client:root:ontologies:0:classes:3:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/changeType",
  },
  "client:root:ontologies:0:classes:3:properties:1": {
    __id: "client:root:ontologies:0:classes:3:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:1:property": {
    __id: "client:root:ontologies:0:classes:3:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/githubLink",
  },
  "client:root:ontologies:0:classes:3:properties:2": {
    __id: "client:root:ontologies:0:classes:3:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:2:property": {
    __id: "client:root:ontologies:0:classes:3:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/owner",
  },
  "client:root:ontologies:0:classes:3:properties:3": {
    __id: "client:root:ontologies:0:classes:3:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:3:property": {
    __id: "client:root:ontologies:0:classes:3:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/change",
  },
  "client:root:ontologies:0:classes:3:properties:4": {
    __id: "client:root:ontologies:0:classes:3:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:4:property": {
    __id: "client:root:ontologies:0:classes:3:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/timestamp",
  },
  "client:root:ontologies:0:classes:3:properties:5": {
    __id: "client:root:ontologies:0:classes:3:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:5:property": {
    __id: "client:root:ontologies:0:classes:3:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:3:properties:6": {
    __id: "client:root:ontologies:0:classes:3:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:6:property": {
    __id: "client:root:ontologies:0:classes:3:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:3:properties:7": {
    __id: "client:root:ontologies:0:classes:3:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:7:property": {
    __id: "client:root:ontologies:0:classes:3:properties:7:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:3:properties:8": {
    __id: "client:root:ontologies:0:classes:3:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:3:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:3:properties:8:property": {
    __id: "client:root:ontologies:0:classes:3:properties:8:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:3:superclass": {
    __id: "client:root:ontologies:0:classes:3:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:4": {
    __id: "client:root:ontologies:0:classes:4",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TagCategory",
    isAbstract: false,
    instanceCount: 8,
    label: "Tag Category",
    superclass: {
      __ref: "client:root:ontologies:0:classes:4:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:4:properties:0",
        "client:root:ontologies:0:classes:4:properties:1",
        "client:root:ontologies:0:classes:4:properties:2",
        "client:root:ontologies:0:classes:4:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:4:properties:0": {
    __id: "client:root:ontologies:0:classes:4:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:4:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:4:properties:0:property": {
    __id: "client:root:ontologies:0:classes:4:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:4:properties:1": {
    __id: "client:root:ontologies:0:classes:4:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:4:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:4:properties:1:property": {
    __id: "client:root:ontologies:0:classes:4:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:4:properties:2": {
    __id: "client:root:ontologies:0:classes:4:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:4:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:4:properties:2:property": {
    __id: "client:root:ontologies:0:classes:4:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:4:properties:3": {
    __id: "client:root:ontologies:0:classes:4:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:4:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:4:properties:3:property": {
    __id: "client:root:ontologies:0:classes:4:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:4:superclass": {
    __id: "client:root:ontologies:0:classes:4:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:5": {
    __id: "client:root:ontologies:0:classes:5",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Tag",
    isAbstract: false,
    instanceCount: 44,
    label: "Tag",
    superclass: {
      __ref: "client:root:ontologies:0:classes:5:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:5:properties:0",
        "client:root:ontologies:0:classes:5:properties:1",
        "client:root:ontologies:0:classes:5:properties:2",
        "client:root:ontologies:0:classes:5:properties:3",
        "client:root:ontologies:0:classes:5:properties:4",
        "client:root:ontologies:0:classes:5:properties:5",
        "client:root:ontologies:0:classes:5:properties:6",
      ],
    },
  },
  "client:root:ontologies:0:classes:5:properties:0": {
    __id: "client:root:ontologies:0:classes:5:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:0:property": {
    __id: "client:root:ontologies:0:classes:5:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/category",
  },
  "client:root:ontologies:0:classes:5:properties:1": {
    __id: "client:root:ontologies:0:classes:5:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:1:property": {
    __id: "client:root:ontologies:0:classes:5:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/whenToRemove",
  },
  "client:root:ontologies:0:classes:5:properties:2": {
    __id: "client:root:ontologies:0:classes:5:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:2:property": {
    __id: "client:root:ontologies:0:classes:5:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/whenToApply",
  },
  "client:root:ontologies:0:classes:5:properties:3": {
    __id: "client:root:ontologies:0:classes:5:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:3:property": {
    __id: "client:root:ontologies:0:classes:5:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:5:properties:4": {
    __id: "client:root:ontologies:0:classes:5:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:4:property": {
    __id: "client:root:ontologies:0:classes:5:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:5:properties:5": {
    __id: "client:root:ontologies:0:classes:5:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:5:property": {
    __id: "client:root:ontologies:0:classes:5:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:5:properties:6": {
    __id: "client:root:ontologies:0:classes:5:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:5:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:5:properties:6:property": {
    __id: "client:root:ontologies:0:classes:5:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:5:superclass": {
    __id: "client:root:ontologies:0:classes:5:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:6": {
    __id: "client:root:ontologies:0:classes:6",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    isAbstract: false,
    instanceCount: 0,
    label: "Implementation Library",
    superclass: {
      __ref: "client:root:ontologies:0:classes:6:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:6:properties:0",
        "client:root:ontologies:0:classes:6:properties:1",
        "client:root:ontologies:0:classes:6:properties:2",
        "client:root:ontologies:0:classes:6:properties:3",
        "client:root:ontologies:0:classes:6:properties:4",
        "client:root:ontologies:0:classes:6:properties:5",
        "client:root:ontologies:0:classes:6:properties:6",
        "client:root:ontologies:0:classes:6:properties:7",
        "client:root:ontologies:0:classes:6:properties:8",
      ],
    },
  },
  "client:root:ontologies:0:classes:6:properties:0": {
    __id: "client:root:ontologies:0:classes:6:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:0:property": {
    __id: "client:root:ontologies:0:classes:6:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/libraryTier",
  },
  "client:root:ontologies:0:classes:6:properties:1": {
    __id: "client:root:ontologies:0:classes:6:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:1:property": {
    __id: "client:root:ontologies:0:classes:6:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/documentation",
  },
  "client:root:ontologies:0:classes:6:properties:2": {
    __id: "client:root:ontologies:0:classes:6:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:2:property": {
    __id: "client:root:ontologies:0:classes:6:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/link",
  },
  "client:root:ontologies:0:classes:6:properties:3": {
    __id: "client:root:ontologies:0:classes:6:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:3:property": {
    __id: "client:root:ontologies:0:classes:6:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/platform",
  },
  "client:root:ontologies:0:classes:6:properties:4": {
    __id: "client:root:ontologies:0:classes:6:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:4:property": {
    __id: "client:root:ontologies:0:classes:6:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/libraryName",
  },
  "client:root:ontologies:0:classes:6:properties:5": {
    __id: "client:root:ontologies:0:classes:6:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:5:property": {
    __id: "client:root:ontologies:0:classes:6:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:6:properties:6": {
    __id: "client:root:ontologies:0:classes:6:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:6:property": {
    __id: "client:root:ontologies:0:classes:6:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:6:properties:7": {
    __id: "client:root:ontologies:0:classes:6:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:7:property": {
    __id: "client:root:ontologies:0:classes:6:properties:7:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:6:properties:8": {
    __id: "client:root:ontologies:0:classes:6:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:6:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:6:properties:8:property": {
    __id: "client:root:ontologies:0:classes:6:properties:8:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:6:superclass": {
    __id: "client:root:ontologies:0:classes:6:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:7": {
    __id: "client:root:ontologies:0:classes:7",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    isAbstract: false,
    instanceCount: 0,
    label: "Implementation Object",
    superclass: {
      __ref: "client:root:ontologies:0:classes:7:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:7:properties:0",
        "client:root:ontologies:0:classes:7:properties:1",
        "client:root:ontologies:0:classes:7:properties:2",
        "client:root:ontologies:0:classes:7:properties:3",
        "client:root:ontologies:0:classes:7:properties:4",
        "client:root:ontologies:0:classes:7:properties:5",
        "client:root:ontologies:0:classes:7:properties:6",
        "client:root:ontologies:0:classes:7:properties:7",
        "client:root:ontologies:0:classes:7:properties:8",
        "client:root:ontologies:0:classes:7:properties:9",
        "client:root:ontologies:0:classes:7:properties:10",
      ],
    },
  },
  "client:root:ontologies:0:classes:7:properties:0": {
    __id: "client:root:ontologies:0:classes:7:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:0:property": {
    __id: "client:root:ontologies:0:classes:7:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/library",
  },
  "client:root:ontologies:0:classes:7:properties:1": {
    __id: "client:root:ontologies:0:classes:7:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:10": {
    __id: "client:root:ontologies:0:classes:7:properties:10",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:10:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:10:property": {
    __id: "client:root:ontologies:0:classes:7:properties:10:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:7:properties:1:property": {
    __id: "client:root:ontologies:0:classes:7:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://ds.canonical.com/implementsBlock",
  },
  "client:root:ontologies:0:classes:7:properties:2": {
    __id: "client:root:ontologies:0:classes:7:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:2:property": {
    __id: "client:root:ontologies:0:classes:7:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/isDraft",
  },
  "client:root:ontologies:0:classes:7:properties:3": {
    __id: "client:root:ontologies:0:classes:7:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:3:property": {
    __id: "client:root:ontologies:0:classes:7:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/importStatement",
  },
  "client:root:ontologies:0:classes:7:properties:4": {
    __id: "client:root:ontologies:0:classes:7:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:4:property": {
    __id: "client:root:ontologies:0:classes:7:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/versionedLink",
  },
  "client:root:ontologies:0:classes:7:properties:5": {
    __id: "client:root:ontologies:0:classes:7:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:5:property": {
    __id: "client:root:ontologies:0:classes:7:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/headLink",
  },
  "client:root:ontologies:0:classes:7:properties:6": {
    __id: "client:root:ontologies:0:classes:7:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:6:property": {
    __id: "client:root:ontologies:0:classes:7:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/implementationVersion",
  },
  "client:root:ontologies:0:classes:7:properties:7": {
    __id: "client:root:ontologies:0:classes:7:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:7:property": {
    __id: "client:root:ontologies:0:classes:7:properties:7:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:7:properties:8": {
    __id: "client:root:ontologies:0:classes:7:properties:8",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:8:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:8:property": {
    __id: "client:root:ontologies:0:classes:7:properties:8:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:7:properties:9": {
    __id: "client:root:ontologies:0:classes:7:properties:9",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:7:properties:9:property",
    },
  },
  "client:root:ontologies:0:classes:7:properties:9:property": {
    __id: "client:root:ontologies:0:classes:7:properties:9:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:7:superclass": {
    __id: "client:root:ontologies:0:classes:7:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:8": {
    __id: "client:root:ontologies:0:classes:8",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Tier",
    isAbstract: false,
    instanceCount: 16,
    label: "Tier",
    superclass: {
      __ref: "client:root:ontologies:0:classes:8:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:8:properties:0",
        "client:root:ontologies:0:classes:8:properties:1",
        "client:root:ontologies:0:classes:8:properties:2",
        "client:root:ontologies:0:classes:8:properties:3",
      ],
    },
  },
  "client:root:ontologies:0:classes:8:properties:0": {
    __id: "client:root:ontologies:0:classes:8:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:8:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:8:properties:0:property": {
    __id: "client:root:ontologies:0:classes:8:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:8:properties:1": {
    __id: "client:root:ontologies:0:classes:8:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:8:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:8:properties:1:property": {
    __id: "client:root:ontologies:0:classes:8:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:8:properties:2": {
    __id: "client:root:ontologies:0:classes:8:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:8:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:8:properties:2:property": {
    __id: "client:root:ontologies:0:classes:8:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:8:properties:3": {
    __id: "client:root:ontologies:0:classes:8:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:8:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:8:properties:3:property": {
    __id: "client:root:ontologies:0:classes:8:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:8:superclass": {
    __id: "client:root:ontologies:0:classes:8:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:classes:9": {
    __id: "client:root:ontologies:0:classes:9",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Property",
    isAbstract: false,
    instanceCount: 0,
    label: "Property",
    superclass: {
      __ref: "client:root:ontologies:0:classes:9:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:0:classes:9:properties:0",
        "client:root:ontologies:0:classes:9:properties:1",
        "client:root:ontologies:0:classes:9:properties:2",
        "client:root:ontologies:0:classes:9:properties:3",
        "client:root:ontologies:0:classes:9:properties:4",
        "client:root:ontologies:0:classes:9:properties:5",
        "client:root:ontologies:0:classes:9:properties:6",
        "client:root:ontologies:0:classes:9:properties:7",
      ],
    },
  },
  "client:root:ontologies:0:classes:9:properties:0": {
    __id: "client:root:ontologies:0:classes:9:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:0:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:0:property": {
    __id: "client:root:ontologies:0:classes:9:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/constraints",
  },
  "client:root:ontologies:0:classes:9:properties:1": {
    __id: "client:root:ontologies:0:classes:9:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:1:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:1:property": {
    __id: "client:root:ontologies:0:classes:9:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/defaultValue",
  },
  "client:root:ontologies:0:classes:9:properties:2": {
    __id: "client:root:ontologies:0:classes:9:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:2:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:2:property": {
    __id: "client:root:ontologies:0:classes:9:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/optional",
  },
  "client:root:ontologies:0:classes:9:properties:3": {
    __id: "client:root:ontologies:0:classes:9:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:3:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:3:property": {
    __id: "client:root:ontologies:0:classes:9:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/propertyType",
  },
  "client:root:ontologies:0:classes:9:properties:4": {
    __id: "client:root:ontologies:0:classes:9:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:4:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:4:property": {
    __id: "client:root:ontologies:0:classes:9:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/decisionLog",
  },
  "client:root:ontologies:0:classes:9:properties:5": {
    __id: "client:root:ontologies:0:classes:9:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:5:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:5:property": {
    __id: "client:root:ontologies:0:classes:9:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/version",
  },
  "client:root:ontologies:0:classes:9:properties:6": {
    __id: "client:root:ontologies:0:classes:9:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:6:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:6:property": {
    __id: "client:root:ontologies:0:classes:9:properties:6:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/summary",
  },
  "client:root:ontologies:0:classes:9:properties:7": {
    __id: "client:root:ontologies:0:classes:9:properties:7",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:0:classes:9:properties:7:property",
    },
  },
  "client:root:ontologies:0:classes:9:properties:7:property": {
    __id: "client:root:ontologies:0:classes:9:properties:7:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://ds.canonical.com/name",
  },
  "client:root:ontologies:0:classes:9:superclass": {
    __id: "client:root:ontologies:0:classes:9:superclass",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
  },
  "client:root:ontologies:0:properties:0": {
    __id: "client:root:ontologies:0:properties:0",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/viaBlock",
    label: "viaBlock",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:0:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:0:domain": {
    __id: "client:root:ontologies:0:properties:0:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TokenBinding",
    label: "Token Binding",
  },
  "client:root:ontologies:0:properties:1": {
    __id: "client:root:ontologies:0:properties:1",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/consumesSymbol",
    label: "consumesSymbol",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:1:domain",
    },
    range: "https://dt.canonical.com/TokenSymbol",
  },
  "client:root:ontologies:0:properties:10": {
    __id: "client:root:ontologies:0:properties:10",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasModifier",
    label: "hasModifier",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:10:domain",
    },
    range: "https://ds.canonical.com/Modifier",
  },
  "client:root:ontologies:0:properties:10:domain": {
    __id: "client:root:ontologies:0:properties:10:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ModifierFamily",
    label: "Modifier Family",
  },
  "client:root:ontologies:0:properties:11": {
    __id: "client:root:ontologies:0:properties:11",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/modifierFamily",
    label: "modifierFamily",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:11:domain",
    },
    range: "https://ds.canonical.com/ModifierFamily",
  },
  "client:root:ontologies:0:properties:11:domain": {
    __id: "client:root:ontologies:0:properties:11:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Modifier",
    label: "Modifier",
  },
  "client:root:ontologies:0:properties:12": {
    __id: "client:root:ontologies:0:properties:12",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasVariant",
    label: "hasVariant",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:12:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:12:domain": {
    __id: "client:root:ontologies:0:properties:12:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:13": {
    __id: "client:root:ontologies:0:properties:13",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/variantOf",
    label: "variantOf",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:13:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:13:domain": {
    __id: "client:root:ontologies:0:properties:13:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:14": {
    __id: "client:root:ontologies:0:properties:14",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/specializedBy",
    label: "specializedBy",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:14:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:14:domain": {
    __id: "client:root:ontologies:0:properties:14:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:15": {
    __id: "client:root:ontologies:0:properties:15",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/inheritsFrom",
    label: "inheritsFrom",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:15:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:15:domain": {
    __id: "client:root:ontologies:0:properties:15:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:16": {
    __id: "client:root:ontologies:0:properties:16",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/changeLog",
    label: "changeLog",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:16:domain",
    },
    range: "https://ds.canonical.com/ChangeLogEntry",
  },
  "client:root:ontologies:0:properties:16:domain": {
    __id: "client:root:ontologies:0:properties:16:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:17": {
    __id: "client:root:ontologies:0:properties:17",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/documentationStage",
    label: "documentationStage",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:17:domain",
    },
    range: "https://ds.canonical.com/Tag",
  },
  "client:root:ontologies:0:properties:17:domain": {
    __id: "client:root:ontologies:0:properties:17:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:18": {
    __id: "client:root:ontologies:0:properties:18",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasProperty",
    label: "hasProperty",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:18:domain",
    },
    range: "https://ds.canonical.com/Property",
  },
  "client:root:ontologies:0:properties:18:domain": {
    __id: "client:root:ontologies:0:properties:18:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:19": {
    __id: "client:root:ontologies:0:properties:19",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasModifierFamily",
    label: "hasModifierFamily",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:19:domain",
    },
    range: "https://ds.canonical.com/ModifierFamily",
  },
  "client:root:ontologies:0:properties:19:domain": {
    __id: "client:root:ontologies:0:properties:19:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:1:domain": {
    __id: "client:root:ontologies:0:properties:1:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TokenBinding",
    label: "Token Binding",
  },
  "client:root:ontologies:0:properties:2": {
    __id: "client:root:ontologies:0:properties:2",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasTokenBinding",
    label: "hasTokenBinding",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:2:domain",
    },
    range: "https://ds.canonical.com/TokenBinding",
  },
  "client:root:ontologies:0:properties:20": {
    __id: "client:root:ontologies:0:properties:20",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/tier",
    label: "tier",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:20:domain",
    },
    range: "https://ds.canonical.com/Tier",
  },
  "client:root:ontologies:0:properties:20:domain": {
    __id: "client:root:ontologies:0:properties:20:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:21": {
    __id: "client:root:ontologies:0:properties:21",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/rank",
    label: "rank",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:21:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#integer",
  },
  "client:root:ontologies:0:properties:21:domain": {
    __id: "client:root:ontologies:0:properties:21:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TokenBinding",
    label: "Token Binding",
  },
  "client:root:ontologies:0:properties:22": {
    __id: "client:root:ontologies:0:properties:22",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/node",
    label: "node",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:22:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:22:domain": {
    __id: "client:root:ontologies:0:properties:22:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/TokenBinding",
    label: "Token Binding",
  },
  "client:root:ontologies:0:properties:23": {
    __id: "client:root:ontologies:0:properties:23",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/documentation",
    label: "documentation",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:23:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
  },
  "client:root:ontologies:0:properties:23:domain": {
    __id: "client:root:ontologies:0:properties:23:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    label: "Implementation Library",
  },
  "client:root:ontologies:0:properties:24": {
    __id: "client:root:ontologies:0:properties:24",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/link",
    label: "link",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:24:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
  },
  "client:root:ontologies:0:properties:24:domain": {
    __id: "client:root:ontologies:0:properties:24:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    label: "Implementation Library",
  },
  "client:root:ontologies:0:properties:25": {
    __id: "client:root:ontologies:0:properties:25",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/platform",
    label: "platform",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:25:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:25:domain": {
    __id: "client:root:ontologies:0:properties:25:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    label: "Implementation Library",
  },
  "client:root:ontologies:0:properties:26": {
    __id: "client:root:ontologies:0:properties:26",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/libraryName",
    label: "libraryName",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:26:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:26:domain": {
    __id: "client:root:ontologies:0:properties:26:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    label: "Implementation Library",
  },
  "client:root:ontologies:0:properties:27": {
    __id: "client:root:ontologies:0:properties:27",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/isDraft",
    label: "isDraft",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:27:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#boolean",
  },
  "client:root:ontologies:0:properties:27:domain": {
    __id: "client:root:ontologies:0:properties:27:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:28": {
    __id: "client:root:ontologies:0:properties:28",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/importStatement",
    label: "importStatement",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:28:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:28:domain": {
    __id: "client:root:ontologies:0:properties:28:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:29": {
    __id: "client:root:ontologies:0:properties:29",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/versionedLink",
    label: "versionedLink",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:29:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:29:domain": {
    __id: "client:root:ontologies:0:properties:29:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:2:domain": {
    __id: "client:root:ontologies:0:properties:2:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:3": {
    __id: "client:root:ontologies:0:properties:3",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/libraryTier",
    label: "libraryTier",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:3:domain",
    },
    range: "https://ds.canonical.com/Tier",
  },
  "client:root:ontologies:0:properties:30": {
    __id: "client:root:ontologies:0:properties:30",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/headLink",
    label: "headLink",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:30:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
  },
  "client:root:ontologies:0:properties:30:domain": {
    __id: "client:root:ontologies:0:properties:30:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:31": {
    __id: "client:root:ontologies:0:properties:31",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/implementationVersion",
    label: "implementationVersion",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:31:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:31:domain": {
    __id: "client:root:ontologies:0:properties:31:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:32": {
    __id: "client:root:ontologies:0:properties:32",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/constraints",
    label: "constraints",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:32:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:32:domain": {
    __id: "client:root:ontologies:0:properties:32:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Property",
    label: "Property",
  },
  "client:root:ontologies:0:properties:33": {
    __id: "client:root:ontologies:0:properties:33",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/defaultValue",
    label: "defaultValue",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:33:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:33:domain": {
    __id: "client:root:ontologies:0:properties:33:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Property",
    label: "Property",
  },
  "client:root:ontologies:0:properties:34": {
    __id: "client:root:ontologies:0:properties:34",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/optional",
    label: "optional",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:34:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#boolean",
  },
  "client:root:ontologies:0:properties:34:domain": {
    __id: "client:root:ontologies:0:properties:34:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Property",
    label: "Property",
  },
  "client:root:ontologies:0:properties:35": {
    __id: "client:root:ontologies:0:properties:35",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/propertyType",
    label: "propertyType",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:35:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:35:domain": {
    __id: "client:root:ontologies:0:properties:35:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Property",
    label: "Property",
  },
  "client:root:ontologies:0:properties:36": {
    __id: "client:root:ontologies:0:properties:36",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/targetDevices",
    label: "targetDevices",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:36:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:36:domain": {
    __id: "client:root:ontologies:0:properties:36:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Layout",
    label: "Layout",
  },
  "client:root:ontologies:0:properties:37": {
    __id: "client:root:ontologies:0:properties:37",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/changeType",
    label: "changeType",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:37:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:37:domain": {
    __id: "client:root:ontologies:0:properties:37:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    label: "Change Log Entry",
  },
  "client:root:ontologies:0:properties:38": {
    __id: "client:root:ontologies:0:properties:38",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/githubLink",
    label: "githubLink",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:38:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
  },
  "client:root:ontologies:0:properties:38:domain": {
    __id: "client:root:ontologies:0:properties:38:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    label: "Change Log Entry",
  },
  "client:root:ontologies:0:properties:39": {
    __id: "client:root:ontologies:0:properties:39",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/owner",
    label: "owner",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:39:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:39:domain": {
    __id: "client:root:ontologies:0:properties:39:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    label: "Change Log Entry",
  },
  "client:root:ontologies:0:properties:3:domain": {
    __id: "client:root:ontologies:0:properties:3:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationLibrary",
    label: "Implementation Library",
  },
  "client:root:ontologies:0:properties:4": {
    __id: "client:root:ontologies:0:properties:4",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/library",
    label: "library",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:4:domain",
    },
    range: "https://ds.canonical.com/ImplementationLibrary",
  },
  "client:root:ontologies:0:properties:40": {
    __id: "client:root:ontologies:0:properties:40",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/change",
    label: "change",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:40:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:40:domain": {
    __id: "client:root:ontologies:0:properties:40:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    label: "Change Log Entry",
  },
  "client:root:ontologies:0:properties:41": {
    __id: "client:root:ontologies:0:properties:41",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/timestamp",
    label: "timestamp",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:41:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#dateTime",
  },
  "client:root:ontologies:0:properties:41:domain": {
    __id: "client:root:ontologies:0:properties:41:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ChangeLogEntry",
    label: "Change Log Entry",
  },
  "client:root:ontologies:0:properties:42": {
    __id: "client:root:ontologies:0:properties:42",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/whenToRemove",
    label: "whenToRemove",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:42:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:42:domain": {
    __id: "client:root:ontologies:0:properties:42:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Tag",
    label: "Tag",
  },
  "client:root:ontologies:0:properties:43": {
    __id: "client:root:ontologies:0:properties:43",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/whenToApply",
    label: "whenToApply",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:43:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:43:domain": {
    __id: "client:root:ontologies:0:properties:43:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Tag",
    label: "Tag",
  },
  "client:root:ontologies:0:properties:44": {
    __id: "client:root:ontologies:0:properties:44",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/gridAreas",
    label: "gridAreas",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:44:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:44:domain": {
    __id: "client:root:ontologies:0:properties:44:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Layout",
    label: "Layout",
  },
  "client:root:ontologies:0:properties:45": {
    __id: "client:root:ontologies:0:properties:45",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/domain",
    label: "domain",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:45:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:45:domain": {
    __id: "client:root:ontologies:0:properties:45:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Layout",
    label: "Layout",
  },
  "client:root:ontologies:0:properties:46": {
    __id: "client:root:ontologies:0:properties:46",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/grid",
    label: "grid",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:46:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:46:domain": {
    __id: "client:root:ontologies:0:properties:46:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Layout",
    label: "Layout",
  },
  "client:root:ontologies:0:properties:47": {
    __id: "client:root:ontologies:0:properties:47",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/standalone",
    label: "standalone",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:47:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#boolean",
  },
  "client:root:ontologies:0:properties:47:domain": {
    __id: "client:root:ontologies:0:properties:47:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Subcomponent",
    label: "Subcomponent",
  },
  "client:root:ontologies:0:properties:48": {
    __id: "client:root:ontologies:0:properties:48",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/knownEdgeCases",
    label: "known edge cases",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:48:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:48:domain": {
    __id: "client:root:ontologies:0:properties:48:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Concept",
    label: "Concept",
  },
  "client:root:ontologies:0:properties:49": {
    __id: "client:root:ontologies:0:properties:49",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/content",
    label: "content",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:49:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:49:domain": {
    __id: "client:root:ontologies:0:properties:49:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Concept",
    label: "Concept",
  },
  "client:root:ontologies:0:properties:4:domain": {
    __id: "client:root:ontologies:0:properties:4:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:5": {
    __id: "client:root:ontologies:0:properties:5",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/implementsBlock",
    label: "implementsBlock",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:5:domain",
    },
    range: "https://ds.canonical.com/UIBlock",
  },
  "client:root:ontologies:0:properties:50": {
    __id: "client:root:ontologies:0:properties:50",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/guidelines",
    label: "guidelines",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:50:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:50:domain": {
    __id: "client:root:ontologies:0:properties:50:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:51": {
    __id: "client:root:ontologies:0:properties:51",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/usage",
    label: "usage",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:51:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:51:domain": {
    __id: "client:root:ontologies:0:properties:51:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:52": {
    __id: "client:root:ontologies:0:properties:52",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/anatomyDsl",
    label: "anatomyDsl",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:52:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:52:domain": {
    __id: "client:root:ontologies:0:properties:52:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:53": {
    __id: "client:root:ontologies:0:properties:53",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/anatomyClassic",
    label: "anatomyClassic",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:53:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:53:domain": {
    __id: "client:root:ontologies:0:properties:53:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:54": {
    __id: "client:root:ontologies:0:properties:54",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/figmaLink",
    label: "figmaLink",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:54:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
  },
  "client:root:ontologies:0:properties:54:domain": {
    __id: "client:root:ontologies:0:properties:54:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  "client:root:ontologies:0:properties:55": {
    __id: "client:root:ontologies:0:properties:55",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/decisionLog",
    label: "decisionLog",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:55:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:55:domain": {
    __id: "client:root:ontologies:0:properties:55:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    label: "Entity",
  },
  "client:root:ontologies:0:properties:56": {
    __id: "client:root:ontologies:0:properties:56",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/version",
    label: "version",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:56:domain",
    },
    range: "https://ds.canonical.com/SemverString",
  },
  "client:root:ontologies:0:properties:56:domain": {
    __id: "client:root:ontologies:0:properties:56:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    label: "Entity",
  },
  "client:root:ontologies:0:properties:57": {
    __id: "client:root:ontologies:0:properties:57",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/summary",
    label: "summary",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:57:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:57:domain": {
    __id: "client:root:ontologies:0:properties:57:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    label: "Entity",
  },
  "client:root:ontologies:0:properties:58": {
    __id: "client:root:ontologies:0:properties:58",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/name",
    label: "name",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:0:properties:58:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:58:domain": {
    __id: "client:root:ontologies:0:properties:58:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    label: "Entity",
  },
  "client:root:ontologies:0:properties:59": {
    __id: "client:root:ontologies:0:properties:59",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/completionGuidance",
    label: "completionGuidance",
    kind: "ANNOTATION",
    domain: null,
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:5:domain": {
    __id: "client:root:ontologies:0:properties:5:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/ImplementationObject",
    label: "Implementation Object",
  },
  "client:root:ontologies:0:properties:6": {
    __id: "client:root:ontologies:0:properties:6",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/conceptType",
    label: "conceptType",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:6:domain",
    },
    range: "https://ds.canonical.com/ConceptType",
  },
  "client:root:ontologies:0:properties:60": {
    __id: "client:root:ontologies:0:properties:60",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/acceptanceCriteria",
    label: "acceptanceCriteria",
    kind: "ANNOTATION",
    domain: null,
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:0:properties:6:domain": {
    __id: "client:root:ontologies:0:properties:6:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Concept",
    label: "Concept",
  },
  "client:root:ontologies:0:properties:7": {
    __id: "client:root:ontologies:0:properties:7",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/category",
    label: "category",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:7:domain",
    },
    range: "https://ds.canonical.com/TagCategory",
  },
  "client:root:ontologies:0:properties:7:domain": {
    __id: "client:root:ontologies:0:properties:7:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Tag",
    label: "Tag",
  },
  "client:root:ontologies:0:properties:8": {
    __id: "client:root:ontologies:0:properties:8",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasSubcomponent",
    label: "hasSubcomponent",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:8:domain",
    },
    range: "https://ds.canonical.com/Subcomponent",
  },
  "client:root:ontologies:0:properties:8:domain": {
    __id: "client:root:ontologies:0:properties:8:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Component",
    label: "Component",
  },
  "client:root:ontologies:0:properties:9": {
    __id: "client:root:ontologies:0:properties:9",
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/parentComponent",
    label: "parentComponent",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:0:properties:9:domain",
    },
    range: "https://ds.canonical.com/Component",
  },
  "client:root:ontologies:0:properties:9:domain": {
    __id: "client:root:ontologies:0:properties:9:domain",
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Subcomponent",
    label: "Subcomponent",
  },
  "client:root:ontologies:1": {
    __id: "client:root:ontologies:1",
    __typename: "Ontology",
    prefix: "cs",
    namespace: "http://pragma.canonical.com/codestandards#",
    classes: {
      __refs: [
        "client:root:ontologies:1:classes:0",
        "client:root:ontologies:1:classes:1",
        "client:root:ontologies:1:classes:2",
      ],
    },
    label: "cs",
    properties: {
      __refs: [
        "client:root:ontologies:1:properties:0",
        "client:root:ontologies:1:properties:1",
        "client:root:ontologies:1:properties:2",
        "client:root:ontologies:1:properties:3",
        "client:root:ontologies:1:properties:4",
        "client:root:ontologies:1:properties:5",
        "client:root:ontologies:1:properties:6",
        "client:root:ontologies:1:properties:7",
        "client:root:ontologies:1:properties:8",
      ],
    },
  },
  "client:root:ontologies:1:classes:0": {
    __id: "client:root:ontologies:1:classes:0",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#Example",
    isAbstract: false,
    instanceCount: 0,
    label: "Example",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:1:classes:0:properties:0",
        "client:root:ontologies:1:classes:0:properties:1",
        "client:root:ontologies:1:classes:0:properties:2",
      ],
    },
  },
  "client:root:ontologies:1:classes:0:properties:0": {
    __id: "client:root:ontologies:1:classes:0:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:0:properties:0:property",
    },
  },
  "client:root:ontologies:1:classes:0:properties:0:property": {
    __id: "client:root:ontologies:1:classes:0:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#code",
  },
  "client:root:ontologies:1:classes:0:properties:1": {
    __id: "client:root:ontologies:1:classes:0:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:0:properties:1:property",
    },
  },
  "client:root:ontologies:1:classes:0:properties:1:property": {
    __id: "client:root:ontologies:1:classes:0:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#language",
  },
  "client:root:ontologies:1:classes:0:properties:2": {
    __id: "client:root:ontologies:1:classes:0:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:0:properties:2:property",
    },
  },
  "client:root:ontologies:1:classes:0:properties:2:property": {
    __id: "client:root:ontologies:1:classes:0:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#description",
  },
  "client:root:ontologies:1:classes:1": {
    __id: "client:root:ontologies:1:classes:1",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#Category",
    isAbstract: false,
    instanceCount: 21,
    label: "Category",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:1:classes:1:properties:0",
        "client:root:ontologies:1:classes:1:properties:1",
      ],
    },
  },
  "client:root:ontologies:1:classes:1:properties:0": {
    __id: "client:root:ontologies:1:classes:1:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:1:properties:0:property",
    },
  },
  "client:root:ontologies:1:classes:1:properties:0:property": {
    __id: "client:root:ontologies:1:classes:1:properties:0:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#description",
  },
  "client:root:ontologies:1:classes:1:properties:1": {
    __id: "client:root:ontologies:1:classes:1:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:1:properties:1:property",
    },
  },
  "client:root:ontologies:1:classes:1:properties:1:property": {
    __id: "client:root:ontologies:1:classes:1:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#slug",
  },
  "client:root:ontologies:1:classes:2": {
    __id: "client:root:ontologies:1:classes:2",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    isAbstract: false,
    instanceCount: 147,
    label: "Code Standard",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:1:classes:2:properties:0",
        "client:root:ontologies:1:classes:2:properties:1",
        "client:root:ontologies:1:classes:2:properties:2",
        "client:root:ontologies:1:classes:2:properties:3",
        "client:root:ontologies:1:classes:2:properties:4",
        "client:root:ontologies:1:classes:2:properties:5",
      ],
    },
  },
  "client:root:ontologies:1:classes:2:properties:0": {
    __id: "client:root:ontologies:1:classes:2:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:0:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:0:property": {
    __id: "client:root:ontologies:1:classes:2:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "http://pragma.canonical.com/codestandards#dont",
  },
  "client:root:ontologies:1:classes:2:properties:1": {
    __id: "client:root:ontologies:1:classes:2:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:1:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:1:property": {
    __id: "client:root:ontologies:1:classes:2:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "http://pragma.canonical.com/codestandards#do",
  },
  "client:root:ontologies:1:classes:2:properties:2": {
    __id: "client:root:ontologies:1:classes:2:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:2:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:2:property": {
    __id: "client:root:ontologies:1:classes:2:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "http://pragma.canonical.com/codestandards#extends",
  },
  "client:root:ontologies:1:classes:2:properties:3": {
    __id: "client:root:ontologies:1:classes:2:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:3:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:3:property": {
    __id: "client:root:ontologies:1:classes:2:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "http://pragma.canonical.com/codestandards#hasCategory",
  },
  "client:root:ontologies:1:classes:2:properties:4": {
    __id: "client:root:ontologies:1:classes:2:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:4:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:4:property": {
    __id: "client:root:ontologies:1:classes:2:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#description",
  },
  "client:root:ontologies:1:classes:2:properties:5": {
    __id: "client:root:ontologies:1:classes:2:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:1:classes:2:properties:5:property",
    },
  },
  "client:root:ontologies:1:classes:2:properties:5:property": {
    __id: "client:root:ontologies:1:classes:2:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "http://pragma.canonical.com/codestandards#name",
  },
  "client:root:ontologies:1:properties:0": {
    __id: "client:root:ontologies:1:properties:0",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#dont",
    label: "don't",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:1:properties:0:domain",
    },
    range: "http://pragma.canonical.com/codestandards#Example",
  },
  "client:root:ontologies:1:properties:0:domain": {
    __id: "client:root:ontologies:1:properties:0:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    label: "Code Standard",
  },
  "client:root:ontologies:1:properties:1": {
    __id: "client:root:ontologies:1:properties:1",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#do",
    label: "do",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:1:properties:1:domain",
    },
    range: "http://pragma.canonical.com/codestandards#Example",
  },
  "client:root:ontologies:1:properties:1:domain": {
    __id: "client:root:ontologies:1:properties:1:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    label: "Code Standard",
  },
  "client:root:ontologies:1:properties:2": {
    __id: "client:root:ontologies:1:properties:2",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#extends",
    label: "extends",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:1:properties:2:domain",
    },
    range: "http://pragma.canonical.com/codestandards#CodeStandard",
  },
  "client:root:ontologies:1:properties:2:domain": {
    __id: "client:root:ontologies:1:properties:2:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    label: "Code Standard",
  },
  "client:root:ontologies:1:properties:3": {
    __id: "client:root:ontologies:1:properties:3",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#hasCategory",
    label: "has category",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:1:properties:3:domain",
    },
    range: "http://pragma.canonical.com/codestandards#Category",
  },
  "client:root:ontologies:1:properties:3:domain": {
    __id: "client:root:ontologies:1:properties:3:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    label: "Code Standard",
  },
  "client:root:ontologies:1:properties:4": {
    __id: "client:root:ontologies:1:properties:4",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#code",
    label: "code",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:1:properties:4:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:1:properties:4:domain": {
    __id: "client:root:ontologies:1:properties:4:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#Example",
    label: "Example",
  },
  "client:root:ontologies:1:properties:5": {
    __id: "client:root:ontologies:1:properties:5",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#language",
    label: "language",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:1:properties:5:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:1:properties:5:domain": {
    __id: "client:root:ontologies:1:properties:5:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#Example",
    label: "Example",
  },
  "client:root:ontologies:1:properties:6": {
    __id: "client:root:ontologies:1:properties:6",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#description",
    label: "description",
    kind: "DATATYPE",
    domain: null,
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:1:properties:7": {
    __id: "client:root:ontologies:1:properties:7",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#slug",
    label: "slug",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:1:properties:7:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:1:properties:7:domain": {
    __id: "client:root:ontologies:1:properties:7:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#Category",
    label: "Category",
  },
  "client:root:ontologies:1:properties:8": {
    __id: "client:root:ontologies:1:properties:8",
    __typename: "OntologyProperty",
    uri: "http://pragma.canonical.com/codestandards#name",
    label: "name",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:1:properties:8:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:1:properties:8:domain": {
    __id: "client:root:ontologies:1:properties:8:domain",
    __typename: "OntologyClass",
    uri: "http://pragma.canonical.com/codestandards#CodeStandard",
    label: "Code Standard",
  },
  "client:root:ontologies:2": {
    __id: "client:root:ontologies:2",
    __typename: "Ontology",
    prefix: "anatomy",
    namespace: "https://anatomy.canonical.com/",
    classes: {
      __refs: [
        "client:root:ontologies:2:classes:0",
        "client:root:ontologies:2:classes:1",
        "client:root:ontologies:2:classes:2",
        "client:root:ontologies:2:classes:3",
        "client:root:ontologies:2:classes:4",
        "client:root:ontologies:2:classes:5",
        "client:root:ontologies:2:classes:6",
        "client:root:ontologies:2:classes:7",
        "client:root:ontologies:2:classes:8",
        "client:root:ontologies:2:classes:9",
        "client:root:ontologies:2:classes:10",
        "client:root:ontologies:2:classes:11",
      ],
    },
    label: "anatomy",
    properties: {
      __refs: [
        "client:root:ontologies:2:properties:0",
        "client:root:ontologies:2:properties:1",
        "client:root:ontologies:2:properties:2",
        "client:root:ontologies:2:properties:3",
        "client:root:ontologies:2:properties:4",
        "client:root:ontologies:2:properties:5",
        "client:root:ontologies:2:properties:6",
        "client:root:ontologies:2:properties:7",
        "client:root:ontologies:2:properties:8",
        "client:root:ontologies:2:properties:9",
        "client:root:ontologies:2:properties:10",
        "client:root:ontologies:2:properties:11",
        "client:root:ontologies:2:properties:12",
        "client:root:ontologies:2:properties:13",
        "client:root:ontologies:2:properties:14",
        "client:root:ontologies:2:properties:15",
        "client:root:ontologies:2:properties:16",
        "client:root:ontologies:2:properties:17",
        "client:root:ontologies:2:properties:18",
        "client:root:ontologies:2:properties:19",
        "client:root:ontologies:2:properties:20",
        "client:root:ontologies:2:properties:21",
        "client:root:ontologies:2:properties:22",
        "client:root:ontologies:2:properties:23",
        "client:root:ontologies:2:properties:24",
      ],
    },
  },
  "client:root:ontologies:2:classes:0": {
    __id: "client:root:ontologies:2:classes:0",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/StyleKey",
    isAbstract: false,
    instanceCount: 111,
    label: "Style Key",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:0:properties:0",
        "client:root:ontologies:2:classes:0:properties:1",
        "client:root:ontologies:2:classes:0:properties:2",
        "client:root:ontologies:2:classes:0:properties:3",
        "client:root:ontologies:2:classes:0:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:0:properties:0": {
    __id: "client:root:ontologies:2:classes:0:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:0:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:0:properties:0:property": {
    __id: "client:root:ontologies:2:classes:0:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:0:properties:1": {
    __id: "client:root:ontologies:2:classes:0:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:0:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:0:properties:1:property": {
    __id: "client:root:ontologies:2:classes:0:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:0:properties:2": {
    __id: "client:root:ontologies:2:classes:0:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:0:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:0:properties:2:property": {
    __id: "client:root:ontologies:2:classes:0:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:0:properties:3": {
    __id: "client:root:ontologies:2:classes:0:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:0:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:0:properties:3:property": {
    __id: "client:root:ontologies:2:classes:0:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/tokenNamespace",
  },
  "client:root:ontologies:2:classes:0:properties:4": {
    __id: "client:root:ontologies:2:classes:0:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:0:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:0:properties:4:property": {
    __id: "client:root:ontologies:2:classes:0:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/valueKind",
  },
  "client:root:ontologies:2:classes:1": {
    __id: "client:root:ontologies:2:classes:1",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/SwitchCase",
    isAbstract: false,
    instanceCount: 0,
    label: "Switch Case",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:1:properties:0",
        "client:root:ontologies:2:classes:1:properties:1",
        "client:root:ontologies:2:classes:1:properties:2",
        "client:root:ontologies:2:classes:1:properties:3",
      ],
    },
  },
  "client:root:ontologies:2:classes:10": {
    __id: "client:root:ontologies:2:classes:10",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Node",
    isAbstract: true,
    instanceCount: 0,
    label: "Node",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:10:properties:0",
        "client:root:ontologies:2:classes:10:properties:1",
        "client:root:ontologies:2:classes:10:properties:2",
        "client:root:ontologies:2:classes:10:properties:3",
        "client:root:ontologies:2:classes:10:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:10:properties:0": {
    __id: "client:root:ontologies:2:classes:10:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:10:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:10:properties:0:property": {
    __id: "client:root:ontologies:2:classes:10:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:10:properties:1": {
    __id: "client:root:ontologies:2:classes:10:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:10:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:10:properties:1:property": {
    __id: "client:root:ontologies:2:classes:10:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasStyle",
  },
  "client:root:ontologies:2:classes:10:properties:2": {
    __id: "client:root:ontologies:2:classes:10:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:10:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:10:properties:2:property": {
    __id: "client:root:ontologies:2:classes:10:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasEdge",
  },
  "client:root:ontologies:2:classes:10:properties:3": {
    __id: "client:root:ontologies:2:classes:10:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:10:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:10:properties:3:property": {
    __id: "client:root:ontologies:2:classes:10:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:10:properties:4": {
    __id: "client:root:ontologies:2:classes:10:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:10:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:10:properties:4:property": {
    __id: "client:root:ontologies:2:classes:10:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:11": {
    __id: "client:root:ontologies:2:classes:11",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Specification",
    isAbstract: false,
    instanceCount: 0,
    label: "Specification",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:11:properties:0",
        "client:root:ontologies:2:classes:11:properties:1",
        "client:root:ontologies:2:classes:11:properties:2",
        "client:root:ontologies:2:classes:11:properties:3",
      ],
    },
  },
  "client:root:ontologies:2:classes:11:properties:0": {
    __id: "client:root:ontologies:2:classes:11:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:11:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:11:properties:0:property": {
    __id: "client:root:ontologies:2:classes:11:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:11:properties:1": {
    __id: "client:root:ontologies:2:classes:11:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:11:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:11:properties:1:property": {
    __id: "client:root:ontologies:2:classes:11:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/rootNode",
  },
  "client:root:ontologies:2:classes:11:properties:2": {
    __id: "client:root:ontologies:2:classes:11:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:11:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:11:properties:2:property": {
    __id: "client:root:ontologies:2:classes:11:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:11:properties:3": {
    __id: "client:root:ontologies:2:classes:11:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:11:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:11:properties:3:property": {
    __id: "client:root:ontologies:2:classes:11:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:1:properties:0": {
    __id: "client:root:ontologies:2:classes:1:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:1:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:1:properties:0:property": {
    __id: "client:root:ontologies:2:classes:1:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:1:properties:1": {
    __id: "client:root:ontologies:2:classes:1:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:1:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:1:properties:1:property": {
    __id: "client:root:ontologies:2:classes:1:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/caseNode",
  },
  "client:root:ontologies:2:classes:1:properties:2": {
    __id: "client:root:ontologies:2:classes:1:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:1:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:1:properties:2:property": {
    __id: "client:root:ontologies:2:classes:1:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:1:properties:3": {
    __id: "client:root:ontologies:2:classes:1:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:1:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:1:properties:3:property": {
    __id: "client:root:ontologies:2:classes:1:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:2": {
    __id: "client:root:ontologies:2:classes:2",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Switch",
    isAbstract: false,
    instanceCount: 0,
    label: "Switch",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:2:properties:0",
        "client:root:ontologies:2:classes:2:properties:1",
        "client:root:ontologies:2:classes:2:properties:2",
        "client:root:ontologies:2:classes:2:properties:3",
        "client:root:ontologies:2:classes:2:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:2:properties:0": {
    __id: "client:root:ontologies:2:classes:2:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:2:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:2:properties:0:property": {
    __id: "client:root:ontologies:2:classes:2:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:2:properties:1": {
    __id: "client:root:ontologies:2:classes:2:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:2:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:2:properties:1:property": {
    __id: "client:root:ontologies:2:classes:2:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasCase",
  },
  "client:root:ontologies:2:classes:2:properties:2": {
    __id: "client:root:ontologies:2:classes:2:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:2:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:2:properties:2:property": {
    __id: "client:root:ontologies:2:classes:2:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:2:properties:3": {
    __id: "client:root:ontologies:2:classes:2:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:2:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:2:properties:3:property": {
    __id: "client:root:ontologies:2:classes:2:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:2:properties:4": {
    __id: "client:root:ontologies:2:classes:2:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:2:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:2:properties:4:property": {
    __id: "client:root:ontologies:2:classes:2:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/discriminator",
  },
  "client:root:ontologies:2:classes:3": {
    __id: "client:root:ontologies:2:classes:3",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Prop",
    isAbstract: false,
    instanceCount: 0,
    label: "Prop",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:3:properties:0",
        "client:root:ontologies:2:classes:3:properties:1",
        "client:root:ontologies:2:classes:3:properties:2",
        "client:root:ontologies:2:classes:3:properties:3",
        "client:root:ontologies:2:classes:3:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:3:properties:0": {
    __id: "client:root:ontologies:2:classes:3:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:3:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:3:properties:0:property": {
    __id: "client:root:ontologies:2:classes:3:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:3:properties:1": {
    __id: "client:root:ontologies:2:classes:3:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:3:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:3:properties:1:property": {
    __id: "client:root:ontologies:2:classes:3:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/propValue",
  },
  "client:root:ontologies:2:classes:3:properties:2": {
    __id: "client:root:ontologies:2:classes:3:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:3:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:3:properties:2:property": {
    __id: "client:root:ontologies:2:classes:3:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/propName",
  },
  "client:root:ontologies:2:classes:3:properties:3": {
    __id: "client:root:ontologies:2:classes:3:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:3:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:3:properties:3:property": {
    __id: "client:root:ontologies:2:classes:3:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:3:properties:4": {
    __id: "client:root:ontologies:2:classes:3:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:3:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:3:properties:4:property": {
    __id: "client:root:ontologies:2:classes:3:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:4": {
    __id: "client:root:ontologies:2:classes:4",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Projection",
    isAbstract: false,
    instanceCount: 0,
    label: "Projection",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:4:properties:0",
        "client:root:ontologies:2:classes:4:properties:1",
        "client:root:ontologies:2:classes:4:properties:2",
        "client:root:ontologies:2:classes:4:properties:3",
        "client:root:ontologies:2:classes:4:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:4:properties:0": {
    __id: "client:root:ontologies:2:classes:4:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:4:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:4:properties:0:property": {
    __id: "client:root:ontologies:2:classes:4:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:4:properties:1": {
    __id: "client:root:ontologies:2:classes:4:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:4:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:4:properties:1:property": {
    __id: "client:root:ontologies:2:classes:4:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/projectionField",
  },
  "client:root:ontologies:2:classes:4:properties:2": {
    __id: "client:root:ontologies:2:classes:4:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:4:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:4:properties:2:property": {
    __id: "client:root:ontologies:2:classes:4:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/projectionType",
  },
  "client:root:ontologies:2:classes:4:properties:3": {
    __id: "client:root:ontologies:2:classes:4:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:4:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:4:properties:3:property": {
    __id: "client:root:ontologies:2:classes:4:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:4:properties:4": {
    __id: "client:root:ontologies:2:classes:4:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:4:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:4:properties:4:property": {
    __id: "client:root:ontologies:2:classes:4:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:5": {
    __id: "client:root:ontologies:2:classes:5",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Style",
    isAbstract: false,
    instanceCount: 0,
    label: "Style",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:5:properties:0",
        "client:root:ontologies:2:classes:5:properties:1",
        "client:root:ontologies:2:classes:5:properties:2",
        "client:root:ontologies:2:classes:5:properties:3",
        "client:root:ontologies:2:classes:5:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:5:properties:0": {
    __id: "client:root:ontologies:2:classes:5:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:5:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:5:properties:0:property": {
    __id: "client:root:ontologies:2:classes:5:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/consumes",
  },
  "client:root:ontologies:2:classes:5:properties:1": {
    __id: "client:root:ontologies:2:classes:5:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:5:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:5:properties:1:property": {
    __id: "client:root:ontologies:2:classes:5:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:5:properties:2": {
    __id: "client:root:ontologies:2:classes:5:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:5:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:5:properties:2:property": {
    __id: "client:root:ontologies:2:classes:5:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:5:properties:3": {
    __id: "client:root:ontologies:2:classes:5:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:5:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:5:properties:3:property": {
    __id: "client:root:ontologies:2:classes:5:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleValue",
  },
  "client:root:ontologies:2:classes:5:properties:4": {
    __id: "client:root:ontologies:2:classes:5:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:5:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:5:properties:4:property": {
    __id: "client:root:ontologies:2:classes:5:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:6": {
    __id: "client:root:ontologies:2:classes:6",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Relation",
    isAbstract: false,
    instanceCount: 0,
    label: "Relation",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:6:properties:0",
        "client:root:ontologies:2:classes:6:properties:1",
        "client:root:ontologies:2:classes:6:properties:2",
        "client:root:ontologies:2:classes:6:properties:3",
        "client:root:ontologies:2:classes:6:properties:4",
      ],
    },
  },
  "client:root:ontologies:2:classes:6:properties:0": {
    __id: "client:root:ontologies:2:classes:6:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:6:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:6:properties:0:property": {
    __id: "client:root:ontologies:2:classes:6:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:6:properties:1": {
    __id: "client:root:ontologies:2:classes:6:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:6:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:6:properties:1:property": {
    __id: "client:root:ontologies:2:classes:6:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:6:properties:2": {
    __id: "client:root:ontologies:2:classes:6:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:6:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:6:properties:2:property": {
    __id: "client:root:ontologies:2:classes:6:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:6:properties:3": {
    __id: "client:root:ontologies:2:classes:6:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:6:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:6:properties:3:property": {
    __id: "client:root:ontologies:2:classes:6:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/slotName",
  },
  "client:root:ontologies:2:classes:6:properties:4": {
    __id: "client:root:ontologies:2:classes:6:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:6:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:6:properties:4:property": {
    __id: "client:root:ontologies:2:classes:6:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/cardinality",
  },
  "client:root:ontologies:2:classes:7": {
    __id: "client:root:ontologies:2:classes:7",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Edge",
    isAbstract: false,
    instanceCount: 0,
    label: "Edge",
    superclass: null,
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:7:properties:0",
        "client:root:ontologies:2:classes:7:properties:1",
        "client:root:ontologies:2:classes:7:properties:2",
        "client:root:ontologies:2:classes:7:properties:3",
        "client:root:ontologies:2:classes:7:properties:4",
        "client:root:ontologies:2:classes:7:properties:5",
      ],
    },
  },
  "client:root:ontologies:2:classes:7:properties:0": {
    __id: "client:root:ontologies:2:classes:7:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:0:property": {
    __id: "client:root:ontologies:2:classes:7:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:7:properties:1": {
    __id: "client:root:ontologies:2:classes:7:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:1:property": {
    __id: "client:root:ontologies:2:classes:7:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/edgeSwitch",
  },
  "client:root:ontologies:2:classes:7:properties:2": {
    __id: "client:root:ontologies:2:classes:7:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:2:property": {
    __id: "client:root:ontologies:2:classes:7:properties:2:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/edgeTarget",
  },
  "client:root:ontologies:2:classes:7:properties:3": {
    __id: "client:root:ontologies:2:classes:7:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:3:property": {
    __id: "client:root:ontologies:2:classes:7:properties:3:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasRelation",
  },
  "client:root:ontologies:2:classes:7:properties:4": {
    __id: "client:root:ontologies:2:classes:7:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:4:property": {
    __id: "client:root:ontologies:2:classes:7:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:7:properties:5": {
    __id: "client:root:ontologies:2:classes:7:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:7:properties:5:property",
    },
  },
  "client:root:ontologies:2:classes:7:properties:5:property": {
    __id: "client:root:ontologies:2:classes:7:properties:5:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:8": {
    __id: "client:root:ontologies:2:classes:8",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/AnonymousNode",
    isAbstract: false,
    instanceCount: 0,
    label: "Anonymous Node",
    superclass: {
      __ref: "client:root:ontologies:2:classes:8:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:8:properties:0",
        "client:root:ontologies:2:classes:8:properties:1",
        "client:root:ontologies:2:classes:8:properties:2",
        "client:root:ontologies:2:classes:8:properties:3",
        "client:root:ontologies:2:classes:8:properties:4",
        "client:root:ontologies:2:classes:8:properties:5",
      ],
    },
  },
  "client:root:ontologies:2:classes:8:properties:0": {
    __id: "client:root:ontologies:2:classes:8:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:0:property": {
    __id: "client:root:ontologies:2:classes:8:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:8:properties:1": {
    __id: "client:root:ontologies:2:classes:8:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:1:property": {
    __id: "client:root:ontologies:2:classes:8:properties:1:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:8:properties:2": {
    __id: "client:root:ontologies:2:classes:8:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:2:property": {
    __id: "client:root:ontologies:2:classes:8:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:8:properties:3": {
    __id: "client:root:ontologies:2:classes:8:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:3:property": {
    __id: "client:root:ontologies:2:classes:8:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/role",
  },
  "client:root:ontologies:2:classes:8:properties:4": {
    __id: "client:root:ontologies:2:classes:8:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:4:property": {
    __id: "client:root:ontologies:2:classes:8:properties:4:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasStyle",
  },
  "client:root:ontologies:2:classes:8:properties:5": {
    __id: "client:root:ontologies:2:classes:8:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:8:properties:5:property",
    },
  },
  "client:root:ontologies:2:classes:8:properties:5:property": {
    __id: "client:root:ontologies:2:classes:8:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasEdge",
  },
  "client:root:ontologies:2:classes:8:superclass": {
    __id: "client:root:ontologies:2:classes:8:superclass",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Node",
  },
  "client:root:ontologies:2:classes:9": {
    __id: "client:root:ontologies:2:classes:9",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/NamedNode",
    isAbstract: false,
    instanceCount: 0,
    label: "Named Node",
    superclass: {
      __ref: "client:root:ontologies:2:classes:9:superclass",
    },
    properties: {
      __refs: [
        "client:root:ontologies:2:classes:9:properties:0",
        "client:root:ontologies:2:classes:9:properties:1",
        "client:root:ontologies:2:classes:9:properties:2",
        "client:root:ontologies:2:classes:9:properties:3",
        "client:root:ontologies:2:classes:9:properties:4",
        "client:root:ontologies:2:classes:9:properties:5",
        "client:root:ontologies:2:classes:9:properties:6",
      ],
    },
  },
  "client:root:ontologies:2:classes:9:properties:0": {
    __id: "client:root:ontologies:2:classes:9:properties:0",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:0:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:0:property": {
    __id: "client:root:ontologies:2:classes:9:properties:0:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProp",
  },
  "client:root:ontologies:2:classes:9:properties:1": {
    __id: "client:root:ontologies:2:classes:9:properties:1",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:1:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:1:property": {
    __id: "client:root:ontologies:2:classes:9:properties:1:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasProjection",
  },
  "client:root:ontologies:2:classes:9:properties:2": {
    __id: "client:root:ontologies:2:classes:9:properties:2",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:2:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:2:property": {
    __id: "client:root:ontologies:2:classes:9:properties:2:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleState",
  },
  "client:root:ontologies:2:classes:9:properties:3": {
    __id: "client:root:ontologies:2:classes:9:properties:3",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:3:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:3:property": {
    __id: "client:root:ontologies:2:classes:9:properties:3:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/styleKey",
  },
  "client:root:ontologies:2:classes:9:properties:4": {
    __id: "client:root:ontologies:2:classes:9:properties:4",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:4:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:4:property": {
    __id: "client:root:ontologies:2:classes:9:properties:4:property",
    __typename: "OntologyProperty",
    kind: "DATATYPE",
    uri: "https://anatomy.canonical.com/uri",
  },
  "client:root:ontologies:2:classes:9:properties:5": {
    __id: "client:root:ontologies:2:classes:9:properties:5",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:5:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:5:property": {
    __id: "client:root:ontologies:2:classes:9:properties:5:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasStyle",
  },
  "client:root:ontologies:2:classes:9:properties:6": {
    __id: "client:root:ontologies:2:classes:9:properties:6",
    __typename: "ClassProperty",
    property: {
      __ref: "client:root:ontologies:2:classes:9:properties:6:property",
    },
  },
  "client:root:ontologies:2:classes:9:properties:6:property": {
    __id: "client:root:ontologies:2:classes:9:properties:6:property",
    __typename: "OntologyProperty",
    kind: "OBJECT",
    uri: "https://anatomy.canonical.com/hasEdge",
  },
  "client:root:ontologies:2:classes:9:superclass": {
    __id: "client:root:ontologies:2:classes:9:superclass",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Node",
  },
  "client:root:ontologies:2:properties:0": {
    __id: "client:root:ontologies:2:properties:0",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/consumes",
    label: "consumes",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:0:domain",
    },
    range: "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
  },
  "client:root:ontologies:2:properties:0:domain": {
    __id: "client:root:ontologies:2:properties:0:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Style",
    label: "Style",
  },
  "client:root:ontologies:2:properties:1": {
    __id: "client:root:ontologies:2:properties:1",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasProp",
    label: "has prop",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:1:domain",
    },
    range: "https://anatomy.canonical.com/Prop",
  },
  "client:root:ontologies:2:properties:10": {
    __id: "client:root:ontologies:2:properties:10",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/rootNode",
    label: "root node",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:10:domain",
    },
    range: "https://anatomy.canonical.com/NamedNode",
  },
  "client:root:ontologies:2:properties:10:domain": {
    __id: "client:root:ontologies:2:properties:10:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Specification",
    label: "Specification",
  },
  "client:root:ontologies:2:properties:11": {
    __id: "client:root:ontologies:2:properties:11",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/projectionField",
    label: "projection field",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:11:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:11:domain": {
    __id: "client:root:ontologies:2:properties:11:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Projection",
    label: "Projection",
  },
  "client:root:ontologies:2:properties:12": {
    __id: "client:root:ontologies:2:properties:12",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/propValue",
    label: "prop value",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:12:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:12:domain": {
    __id: "client:root:ontologies:2:properties:12:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Prop",
    label: "Prop",
  },
  "client:root:ontologies:2:properties:13": {
    __id: "client:root:ontologies:2:properties:13",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/propName",
    label: "prop name",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:13:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:13:domain": {
    __id: "client:root:ontologies:2:properties:13:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Prop",
    label: "Prop",
  },
  "client:root:ontologies:2:properties:14": {
    __id: "client:root:ontologies:2:properties:14",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/projectionType",
    label: "projection type",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:14:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:14:domain": {
    __id: "client:root:ontologies:2:properties:14:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Projection",
    label: "Projection",
  },
  "client:root:ontologies:2:properties:15": {
    __id: "client:root:ontologies:2:properties:15",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/styleState",
    label: "style state",
    kind: "DATATYPE",
    domain: null,
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:16": {
    __id: "client:root:ontologies:2:properties:16",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/styleValue",
    label: "style value",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:16:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:16:domain": {
    __id: "client:root:ontologies:2:properties:16:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Style",
    label: "Style",
  },
  "client:root:ontologies:2:properties:17": {
    __id: "client:root:ontologies:2:properties:17",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/styleKey",
    label: "style key",
    kind: "DATATYPE",
    domain: null,
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:18": {
    __id: "client:root:ontologies:2:properties:18",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/slotName",
    label: "slot name",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:18:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:18:domain": {
    __id: "client:root:ontologies:2:properties:18:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Relation",
    label: "Relation",
  },
  "client:root:ontologies:2:properties:19": {
    __id: "client:root:ontologies:2:properties:19",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/cardinality",
    label: "cardinality",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:19:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:19:domain": {
    __id: "client:root:ontologies:2:properties:19:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Relation",
    label: "Relation",
  },
  "client:root:ontologies:2:properties:1:domain": {
    __id: "client:root:ontologies:2:properties:1:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/NamedNode",
    label: "Named Node",
  },
  "client:root:ontologies:2:properties:2": {
    __id: "client:root:ontologies:2:properties:2",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasProjection",
    label: "has projection",
    kind: "OBJECT",
    domain: null,
    range: "https://anatomy.canonical.com/Projection",
  },
  "client:root:ontologies:2:properties:20": {
    __id: "client:root:ontologies:2:properties:20",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/discriminator",
    label: "discriminator",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:20:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:20:domain": {
    __id: "client:root:ontologies:2:properties:20:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Switch",
    label: "Switch",
  },
  "client:root:ontologies:2:properties:21": {
    __id: "client:root:ontologies:2:properties:21",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/role",
    label: "role",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:21:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:21:domain": {
    __id: "client:root:ontologies:2:properties:21:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/AnonymousNode",
    label: "Anonymous Node",
  },
  "client:root:ontologies:2:properties:22": {
    __id: "client:root:ontologies:2:properties:22",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/uri",
    label: "uri",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:22:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:22:domain": {
    __id: "client:root:ontologies:2:properties:22:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/NamedNode",
    label: "Named Node",
  },
  "client:root:ontologies:2:properties:23": {
    __id: "client:root:ontologies:2:properties:23",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/tokenNamespace",
    label: "token namespace",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:23:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:23:domain": {
    __id: "client:root:ontologies:2:properties:23:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/StyleKey",
    label: "Style Key",
  },
  "client:root:ontologies:2:properties:24": {
    __id: "client:root:ontologies:2:properties:24",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/valueKind",
    label: "value kind",
    kind: "DATATYPE",
    domain: {
      __ref: "client:root:ontologies:2:properties:24:domain",
    },
    range: "http://www.w3.org/2001/XMLSchema#string",
  },
  "client:root:ontologies:2:properties:24:domain": {
    __id: "client:root:ontologies:2:properties:24:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/StyleKey",
    label: "Style Key",
  },
  "client:root:ontologies:2:properties:3": {
    __id: "client:root:ontologies:2:properties:3",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasStyle",
    label: "has style",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:3:domain",
    },
    range: "https://anatomy.canonical.com/Style",
  },
  "client:root:ontologies:2:properties:3:domain": {
    __id: "client:root:ontologies:2:properties:3:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Node",
    label: "Node",
  },
  "client:root:ontologies:2:properties:4": {
    __id: "client:root:ontologies:2:properties:4",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/caseNode",
    label: "case node",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:4:domain",
    },
    range: "https://anatomy.canonical.com/Node",
  },
  "client:root:ontologies:2:properties:4:domain": {
    __id: "client:root:ontologies:2:properties:4:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/SwitchCase",
    label: "Switch Case",
  },
  "client:root:ontologies:2:properties:5": {
    __id: "client:root:ontologies:2:properties:5",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasCase",
    label: "has case",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:5:domain",
    },
    range: "https://anatomy.canonical.com/SwitchCase",
  },
  "client:root:ontologies:2:properties:5:domain": {
    __id: "client:root:ontologies:2:properties:5:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Switch",
    label: "Switch",
  },
  "client:root:ontologies:2:properties:6": {
    __id: "client:root:ontologies:2:properties:6",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/edgeSwitch",
    label: "edge switch",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:6:domain",
    },
    range: "https://anatomy.canonical.com/Switch",
  },
  "client:root:ontologies:2:properties:6:domain": {
    __id: "client:root:ontologies:2:properties:6:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Edge",
    label: "Edge",
  },
  "client:root:ontologies:2:properties:7": {
    __id: "client:root:ontologies:2:properties:7",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/edgeTarget",
    label: "edge target",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:7:domain",
    },
    range: "https://anatomy.canonical.com/Node",
  },
  "client:root:ontologies:2:properties:7:domain": {
    __id: "client:root:ontologies:2:properties:7:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Edge",
    label: "Edge",
  },
  "client:root:ontologies:2:properties:8": {
    __id: "client:root:ontologies:2:properties:8",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasRelation",
    label: "has relation",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:8:domain",
    },
    range: "https://anatomy.canonical.com/Relation",
  },
  "client:root:ontologies:2:properties:8:domain": {
    __id: "client:root:ontologies:2:properties:8:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Edge",
    label: "Edge",
  },
  "client:root:ontologies:2:properties:9": {
    __id: "client:root:ontologies:2:properties:9",
    __typename: "OntologyProperty",
    uri: "https://anatomy.canonical.com/hasEdge",
    label: "has edge",
    kind: "OBJECT",
    domain: {
      __ref: "client:root:ontologies:2:properties:9:domain",
    },
    range: "https://anatomy.canonical.com/Edge",
  },
  "client:root:ontologies:2:properties:9:domain": {
    __id: "client:root:ontologies:2:properties:9:domain",
    __typename: "OntologyClass",
    uri: "https://anatomy.canonical.com/Node",
    label: "Node",
  },
  'client:root:ontologyClass(uri:"ds:Component")': {
    __id: 'client:root:ontologyClass(uri:"ds:Component")',
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Component",
    label: "Component",
    definition:
      "An implementable piece of user interface defined by its appearance and behaviour",
    isAbstract: false,
    namespace: "ds",
    instanceCount: 139,
    superclass: {
      __ref: 'client:root:ontologyClass(uri:"ds:Component"):superclass',
    },
    superclasses: {
      __refs: [
        'client:root:ontologyClass(uri:"ds:Component"):superclasses:0',
        'client:root:ontologyClass(uri:"ds:Component"):superclasses:1',
        'client:root:ontologyClass(uri:"ds:Component"):superclasses:2',
      ],
    },
    subclasses: {
      __refs: [],
    },
    properties: {
      __refs: [
        'client:root:ontologyClass(uri:"ds:Component"):properties:0',
        'client:root:ontologyClass(uri:"ds:Component"):properties:1',
        'client:root:ontologyClass(uri:"ds:Component"):properties:2',
        'client:root:ontologyClass(uri:"ds:Component"):properties:3',
        'client:root:ontologyClass(uri:"ds:Component"):properties:4',
        'client:root:ontologyClass(uri:"ds:Component"):properties:5',
        'client:root:ontologyClass(uri:"ds:Component"):properties:6',
        'client:root:ontologyClass(uri:"ds:Component"):properties:7',
        'client:root:ontologyClass(uri:"ds:Component"):properties:8',
        'client:root:ontologyClass(uri:"ds:Component"):properties:9',
        'client:root:ontologyClass(uri:"ds:Component"):properties:10',
        'client:root:ontologyClass(uri:"ds:Component"):properties:11',
        'client:root:ontologyClass(uri:"ds:Component"):properties:12',
        'client:root:ontologyClass(uri:"ds:Component"):properties:13',
        'client:root:ontologyClass(uri:"ds:Component"):properties:14',
        'client:root:ontologyClass(uri:"ds:Component"):properties:15',
        'client:root:ontologyClass(uri:"ds:Component"):properties:16',
        'client:root:ontologyClass(uri:"ds:Component"):properties:17',
        'client:root:ontologyClass(uri:"ds:Component"):properties:18',
        'client:root:ontologyClass(uri:"ds:Component"):properties:19',
      ],
    },
    "instances(first:12)": {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12)',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12)': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12)',
    __typename: "NodeConnection",
    edges: {
      __refs: [
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10',
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11',
      ],
    },
    pageInfo: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):pageInfo',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_launchpad.component.accordion",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_launchpad.component.accordion",
      title: "Accordion",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:0:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10',
      __typename: "NodeEdge",
      node: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/sites_webcomponentsprototype.component.blog_cards",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:sites_webcomponentsprototype.component.blog_cards",
      title: "BlogCards",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:10:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11',
      __typename: "NodeEdge",
      node: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_launchpad.component.breadcrumbs",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_launchpad.component.breadcrumbs",
      title: "Breadcrumbs",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:11:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/global.component.accordion",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:global.component.accordion",
      title: "Accordion",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:1:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/global.component.announcement",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:global.component.announcement",
      title: "Announcement",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:2:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_launchpad.component.avatar",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_launchpad.component.avatar",
      title: "Avatar",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:3:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/global.component.avatar",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:global.component.avatar",
      title: "Avatar",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:4:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_lxd.component.back_link",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_lxd.component.back_link",
      title: "BackLink",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:5:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_launchpad.component.badge",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_launchpad.component.badge",
      title: "Badge",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:6:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/apps_portal.component.badge",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:apps_portal.component.badge",
      title: "Badge",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:7:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/global.component.badge",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:global.component.badge",
      title: "Badge",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:8:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9',
    __typename: "NodeEdge",
    node: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node',
      __typename: "Component",
      uri: "https://ds.canonical.com/sites.component.blog_card",
      _meta: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta',
      __typename: "EntityMeta",
      curie: "ds:sites.component.blog_card",
      title: "BlogCard",
      type: {
        __ref:
          'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta:type',
      },
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta:type':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):edges:9:node:_meta:type',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):pageInfo':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):instances(first:12):pageInfo',
      __typename: "PageInfo",
      hasNextPage: true,
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:0': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:0',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: false,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:0:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:0:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:0:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasSubcomponent",
    label: "hasSubcomponent",
    definition: "Subcomponents that are structural parts of this component",
    range: "https://ds.canonical.com/Subcomponent",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:0:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:0:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:0:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Component",
      label: "Component",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:1': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:1',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:1:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:10': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:10',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:10:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:10:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:10:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/tier",
    label: "tier",
    definition: "The tier to which the UI block belongs to",
    range: "https://ds.canonical.com/Tier",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:10:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:10:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:10:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:11': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:11',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:11:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:11:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:11:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/guidelines",
    label: "guidelines",
    definition:
      "Detailed specification for correctly using and implementing the UI block.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:11:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:11:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:11:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:12': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:12',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:12:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:12:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:12:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/usage",
    label: "usage",
    definition:
      "Free-text (Markdown) usage documentation for the UI block. Subsumes the former whenToUse/whenNotToUse: a usage entry describes the contexts where the component is most appropriate ('When to use'), the contexts where it is NOT appropriate and what to use instead ('When not to use'), and a general description, typically as Markdown sub-sections.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:12:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:12:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:12:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:13': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:13',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:13:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:13:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:13:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/anatomyDsl",
    label: "anatomyDsl",
    definition:
      "YAML specification of component structure using the Anatomy DSL. Describes nodes (named/anonymous), edges with cardinality, slots, and CTI-inspired styles.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:13:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:13:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:13:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:14': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:14',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:14:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:14:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:14:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/anatomyClassic",
    label: "anatomyClassic",
    definition:
      "DEPRECATED. Legacy anatomy field (free-form text). Superseded by ds:anatomyDsl.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:14:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:14:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:14:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:15': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:15',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:15:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:15:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:15:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/figmaLink",
    label: "figmaLink",
    definition: "Link to the Figma design file for this UI block",
    range: "http://www.w3.org/2001/XMLSchema#anyURI",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:15:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:15:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:15:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:16': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:16',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:16:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:16:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:16:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/decisionLog",
    label: "decisionLog",
    definition: "Log of decisions with [date][author][content]",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:16:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:16:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:16:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Entity",
      label: "Entity",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:17': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:17',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:17:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:17:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:17:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/version",
    label: "version",
    definition: "Semantic version of the entity following semver specification",
    range: "https://ds.canonical.com/SemverString",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:17:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:17:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:17:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Entity",
      label: "Entity",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:18': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:18',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:18:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:18:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:18:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/summary",
    label: "summary",
    definition:
      "A comprehensive paragraph of text that states the singular purpose of the entity.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:18:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:18:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:18:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Entity",
      label: "Entity",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:19': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:19',
    __typename: "ClassProperty",
    required: false,
    singular: true,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:19:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:19:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:19:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/name",
    label: "name",
    definition:
      "A human-readable text for the entity. The primary identifier, used for referencing and display purposes.",
    range: "http://www.w3.org/2001/XMLSchema#string",
    kind: "DATATYPE",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:19:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:19:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:19:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/Entity",
      label: "Entity",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:1:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:1:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasTokenBinding",
    label: "hasTokenBinding",
    definition:
      "A token binding of this block: one record per consumed symbol per rank, over the block's own anatomy tree and the trees of every block its anatomy references.",
    range: "https://ds.canonical.com/TokenBinding",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:1:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:1:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:1:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:2': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:2',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:2:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:2:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:2:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasVariant",
    label: "hasVariant",
    definition:
      "The variants of this UI Block (inverse of ds:variantOf). E.g. Tooltip has variant Tooltip+Dense.",
    range: "https://ds.canonical.com/UIBlock",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:2:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:2:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:2:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:3': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:3',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:3:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:3:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:3:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/variantOf",
    label: "variantOf",
    definition:
      "The base UI Block this block is a variant of, by the '+' naming convention (e.g. Tooltip+Dense is a variant of Tooltip). Distinct from ds:inheritsFrom: a variant is a modifier-style derivative rather than a prefixed specialisation.",
    range: "https://ds.canonical.com/UIBlock",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:3:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:3:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:3:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:4': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:4',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:4:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:4:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:4:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/specializedBy",
    label: "specializedBy",
    definition:
      "The UI Blocks that inherit from / specialise this block (inverse of ds:inheritsFrom). E.g. Tooltip is specialised by DataTooltip.",
    range: "https://ds.canonical.com/UIBlock",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:4:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:4:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:4:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:5': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:5',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:5:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:5:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:5:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/inheritsFrom",
    label: "inheritsFrom",
    definition:
      "The UI Block this block inherits from / specialises (e.g. a Data tooltip inherits from Tooltip). Distinct from subcomponent containment: inheritance is an is-a-specialisation relationship.",
    range: "https://ds.canonical.com/UIBlock",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:5:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:5:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:5:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:6': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:6',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:6:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:6:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:6:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/changeLog",
    label: "changeLog",
    definition: "Links a UI Block to its dated change log entries.",
    range: "https://ds.canonical.com/ChangeLogEntry",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:6:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:6:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:6:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:7': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:7',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:7:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:7:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:7:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/documentationStage",
    label: "documentationStage",
    definition:
      "Links a UI Block to the documentation-stage Tag(s) applied to it (e.g. needs:documentation). One facet of the wider Tag vocabulary; the other tag facets are tracked as future work.",
    range: "https://ds.canonical.com/Tag",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:7:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:7:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:7:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:8': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:8',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:8:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:8:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:8:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasProperty",
    label: "hasProperty",
    definition: "Links a UI Block to its configurable properties",
    range: "https://ds.canonical.com/Property",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:8:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:8:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:8:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):properties:9': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:9',
    __typename: "ClassProperty",
    required: false,
    singular: false,
    inherited: true,
    property: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:9:property',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:9:property': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:9:property',
    __typename: "OntologyProperty",
    uri: "https://ds.canonical.com/hasModifierFamily",
    label: "hasModifierFamily",
    definition: "Links a UI Block to applicable modifier families",
    range: "https://ds.canonical.com/ModifierFamily",
    kind: "OBJECT",
    domain: {
      __ref:
        'client:root:ontologyClass(uri:"ds:Component"):properties:9:property:domain',
    },
  },
  'client:root:ontologyClass(uri:"ds:Component"):properties:9:property:domain':
    {
      __id: 'client:root:ontologyClass(uri:"ds:Component"):properties:9:property:domain',
      __typename: "OntologyClass",
      uri: "https://ds.canonical.com/UIBlock",
      label: "UI Block",
    },
  'client:root:ontologyClass(uri:"ds:Component"):superclass': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):superclass',
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  'client:root:ontologyClass(uri:"ds:Component"):superclasses:0': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):superclasses:0',
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIBlock",
    label: "UI Block",
  },
  'client:root:ontologyClass(uri:"ds:Component"):superclasses:1': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):superclasses:1',
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/UIElement",
    label: "UI Element",
  },
  'client:root:ontologyClass(uri:"ds:Component"):superclasses:2': {
    __id: 'client:root:ontologyClass(uri:"ds:Component"):superclasses:2',
    __typename: "OntologyClass",
    uri: "https://ds.canonical.com/Entity",
    label: "Entity",
  },
} as unknown as RecordMap;

export default definitionsExplorerRecordsComponent;
