/**
 * The metro graph's answers to every request the lens's suites make: each
 * operation the lens runs, at each set of variables a test reaches, with the
 * response a contract-conforming provider gave. The suites read the lens's
 * behaviour off these recorded answers, so they run without a provider.
 *
 * Regenerate: execute each entry's operation (its text is the generated
 * artifact's `params.text`), with its variables, against the metro provider
 * (`createExampleHandler(createExampleProvider())` from
 * `@canonical/prism-graph-example`), and replace its `response` with the
 * JSON answer. A request a test makes that no entry holds fails that test,
 * naming the operation and the variables to record.
 */

import type { RecordedResponse } from "../types.js";

/** The recorded answers, one per operation and variables. */
export default [
  {
    operation: "EntityNamespacesQuery",
    variables: {},
    response: {
      data: {
        ontologies: [
          { prefix: "metro", namespace: "https://metro.example/onto#" },
          { prefix: "geo", namespace: "https://geo.example/onto#" },
          {
            prefix: "rdfs",
            namespace: "http://www.w3.org/2000/01/rdf-schema#",
          },
        ],
      },
    },
  },
  {
    operation: "EntityIndexQuery",
    variables: { classUri: "metro:Nowhere", count: 100, cursor: null },
    response: { data: { ontologyClass: null } },
  },
  {
    operation: "EntityIndexQuery",
    variables: { classUri: "metro:Station", count: 100, cursor: null },
    response: {
      data: {
        ontologyClass: {
          uri: "https://metro.example/onto#Station",
          instanceCount: 16,
          instances: {
            edges: [
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#",
                  _meta: {
                    title: "https://metro.example/onto#",
                    curie: "metro:",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8j",
              },
              {
                node: {
                  __typename: "Interchange",
                  uri: "https://metro.example/onto#central-exchange",
                  _meta: {
                    title: "Central Exchange",
                    curie: "metro:central-exchange",
                    type: { uri: "https://metro.example/onto#Interchange" },
                  },
                  __isNode: "Interchange",
                },
                cursor:
                  "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jY2VudHJhbC1leGNoYW5nZQ==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#eastcliff",
                  _meta: {
                    title: "Eastcliff",
                    curie: "metro:eastcliff",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZWFzdGNsaWZm",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#foundry-row",
                  _meta: {
                    title: "Foundry Row",
                    curie: "metro:foundry-row",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZm91bmRyeS1yb3c=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#ghost",
                  _meta: {
                    title: "ghost",
                    curie: "metro:ghost",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#greenhithe",
                  _meta: {
                    title: "Greenhithe",
                    curie: "metro:greenhithe",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ3JlZW5oaXRoZQ==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#harbourside",
                  _meta: {
                    title: "Harbourside",
                    curie: "metro:harbourside",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jaGFyYm91cnNpZGU=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#kilnwood",
                  _meta: {
                    title: "Kilnwood",
                    curie: "metro:kilnwood",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8ja2lsbndvb2Q=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#marsh-end",
                  _meta: {
                    title: "Marsh End",
                    curie: "metro:marsh-end",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbWFyc2gtZW5k",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#northgate",
                  _meta: {
                    title: "Northgate",
                    curie: "metro:northgate",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbm9ydGhnYXRl",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#quarry-hill",
                  _meta: {
                    title: "Quarry Hill",
                    curie: "metro:quarry-hill",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcXVhcnJ5LWhpbGw=",
              },
              {
                node: {
                  __typename: "Interchange",
                  uri: "https://metro.example/onto#riverside-junction",
                  _meta: {
                    title: "Riverside Junction",
                    curie: "metro:riverside-junction",
                    type: { uri: "https://metro.example/onto#Interchange" },
                  },
                  __isNode: "Interchange",
                },
                cursor:
                  "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcml2ZXJzaWRlLWp1bmN0aW9u",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#saltford",
                  _meta: {
                    title: "Saltford",
                    curie: "metro:saltford",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jc2FsdGZvcmQ=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#tannery-lane",
                  _meta: {
                    title: "Tannery Lane",
                    curie: "metro:tannery-lane",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdGFubmVyeS1sYW5l",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#verge-park",
                  _meta: {
                    title: "Verge Park",
                    curie: "metro:verge-park",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdmVyZ2UtcGFyaw==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#willowbank",
                  _meta: {
                    title: "Willowbank",
                    curie: "metro:willowbank",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              },
            ],
            pageInfo: {
              endCursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              hasNextPage: false,
            },
          },
        },
      },
    },
  },
  {
    operation: "EntityIndexQuery",
    variables: { classUri: "metro:Station", count: 5, cursor: null },
    response: {
      data: {
        ontologyClass: {
          uri: "https://metro.example/onto#Station",
          instanceCount: 16,
          instances: {
            edges: [
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#",
                  _meta: {
                    title: "https://metro.example/onto#",
                    curie: "metro:",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8j",
              },
              {
                node: {
                  __typename: "Interchange",
                  uri: "https://metro.example/onto#central-exchange",
                  _meta: {
                    title: "Central Exchange",
                    curie: "metro:central-exchange",
                    type: { uri: "https://metro.example/onto#Interchange" },
                  },
                  __isNode: "Interchange",
                },
                cursor:
                  "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jY2VudHJhbC1leGNoYW5nZQ==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#eastcliff",
                  _meta: {
                    title: "Eastcliff",
                    curie: "metro:eastcliff",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZWFzdGNsaWZm",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#foundry-row",
                  _meta: {
                    title: "Foundry Row",
                    curie: "metro:foundry-row",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZm91bmRyeS1yb3c=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#ghost",
                  _meta: {
                    title: "ghost",
                    curie: "metro:ghost",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q=",
              },
            ],
            pageInfo: {
              endCursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q=",
              hasNextPage: true,
            },
          },
        },
      },
    },
  },
  {
    operation: "EntityIndexPaginationQuery",
    variables: {
      classUri: "metro:Station",
      count: 100,
      cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q=",
    },
    response: {
      data: {
        ontologyClass: {
          uri: "https://metro.example/onto#Station",
          instanceCount: 16,
          instances: {
            edges: [
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#greenhithe",
                  _meta: {
                    title: "Greenhithe",
                    curie: "metro:greenhithe",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ3JlZW5oaXRoZQ==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#harbourside",
                  _meta: {
                    title: "Harbourside",
                    curie: "metro:harbourside",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jaGFyYm91cnNpZGU=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#kilnwood",
                  _meta: {
                    title: "Kilnwood",
                    curie: "metro:kilnwood",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8ja2lsbndvb2Q=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#marsh-end",
                  _meta: {
                    title: "Marsh End",
                    curie: "metro:marsh-end",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbWFyc2gtZW5k",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#northgate",
                  _meta: {
                    title: "Northgate",
                    curie: "metro:northgate",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbm9ydGhnYXRl",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#quarry-hill",
                  _meta: {
                    title: "Quarry Hill",
                    curie: "metro:quarry-hill",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcXVhcnJ5LWhpbGw=",
              },
              {
                node: {
                  __typename: "Interchange",
                  uri: "https://metro.example/onto#riverside-junction",
                  _meta: {
                    title: "Riverside Junction",
                    curie: "metro:riverside-junction",
                    type: { uri: "https://metro.example/onto#Interchange" },
                  },
                  __isNode: "Interchange",
                },
                cursor:
                  "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcml2ZXJzaWRlLWp1bmN0aW9u",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#saltford",
                  _meta: {
                    title: "Saltford",
                    curie: "metro:saltford",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jc2FsdGZvcmQ=",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#tannery-lane",
                  _meta: {
                    title: "Tannery Lane",
                    curie: "metro:tannery-lane",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdGFubmVyeS1sYW5l",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#verge-park",
                  _meta: {
                    title: "Verge Park",
                    curie: "metro:verge-park",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdmVyZ2UtcGFyaw==",
              },
              {
                node: {
                  __typename: "Station",
                  uri: "https://metro.example/onto#willowbank",
                  _meta: {
                    title: "Willowbank",
                    curie: "metro:willowbank",
                    type: { uri: "https://metro.example/onto#Station" },
                  },
                  __isNode: "Station",
                },
                cursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              },
            ],
            pageInfo: {
              endCursor: "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              hasNextPage: false,
            },
          },
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "geo:Zone",
      id: "https://geo.example/onto#coastal-zone",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://geo.example/onto#Zone" },
        node: {
          __typename: "Zone",
          uri: "https://geo.example/onto#coastal-zone",
          _meta: {
            title: "Coastal Zone",
            type: {
              uri: "https://geo.example/onto#Zone",
              superclasses: [],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "geo:Zone",
                title: "Fare zone",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "name",
                required: true,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
            ],
            curie: "geo:coastal-zone",
            definition: null,
            comment: null,
          },
          __isNode: "Zone",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Nowhere",
      id: "https://metro.example/onto#northgate",
    },
    response: {
      data: {
        ontologyClass: null,
        node: {
          __typename: "Station",
          uri: "https://metro.example/onto#northgate",
          _meta: {
            title: "Northgate",
            type: {
              uri: "https://metro.example/onto#Station",
              superclasses: [{ uri: "https://metro.example/onto#Stop" }],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "metro:Station",
                title: "Station",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "platformCount",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#platformCount",
                  kind: "DATATYPE",
                  range: "Int",
                },
              },
              {
                name: "servesLine",
                required: true,
                singular: false,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#servesLine",
                  kind: "OBJECT",
                  range: "metro:Line",
                },
              },
              {
                name: "location",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#location",
                  kind: "OBJECT",
                  range: "geo:GeoPoint",
                },
              },
              {
                name: "inZone",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#inZone",
                  kind: "OBJECT",
                  range: "geo:Zone",
                },
              },
              {
                name: "name",
                required: true,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
              {
                name: "note",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#note",
                  kind: "ANNOTATION",
                  range: "String",
                },
              },
            ],
            curie: "metro:northgate",
            definition: "The northern terminus.",
            comment: null,
          },
          __isNode: "Station",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Station",
      id: "https://metro.example/onto#central-exchange",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://metro.example/onto#Station" },
        node: {
          __typename: "Interchange",
          uri: "https://metro.example/onto#central-exchange",
          _meta: {
            title: "Central Exchange",
            type: {
              uri: "https://metro.example/onto#Interchange",
              superclasses: [
                { uri: "https://metro.example/onto#Station" },
                { uri: "https://metro.example/onto#Stop" },
              ],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "metro:Interchange",
                title: "Interchange",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "transferMinutes",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#transferMinutes",
                  kind: "DATATYPE",
                  range: "Int",
                },
              },
              {
                name: "platformCount",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#platformCount",
                  kind: "DATATYPE",
                  range: "Int",
                },
              },
              {
                name: "servesLine",
                required: true,
                singular: false,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#servesLine",
                  kind: "OBJECT",
                  range: "metro:Line",
                },
              },
              {
                name: "location",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://geo.example/onto#location",
                  kind: "OBJECT",
                  range: "geo:GeoPoint",
                },
              },
              {
                name: "inZone",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://geo.example/onto#inZone",
                  kind: "OBJECT",
                  range: "geo:Zone",
                },
              },
              {
                name: "name",
                required: true,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
              {
                name: "note",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#note",
                  kind: "ANNOTATION",
                  range: "String",
                },
              },
            ],
            curie: "metro:central-exchange",
            definition: "The busiest transfer point on the network.",
            comment: null,
          },
          __isNode: "Interchange",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Station",
      id: "https://metro.example/onto#circle-line",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://metro.example/onto#Station" },
        node: {
          __typename: "Line",
          uri: "https://metro.example/onto#circle-line",
          _meta: {
            title: "Circle Line",
            type: {
              uri: "https://metro.example/onto#Line",
              superclasses: [],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "metro:Line",
                title: "Line",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "name",
                required: true,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
              {
                name: "servedBy",
                required: false,
                singular: false,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#servedBy",
                  kind: "OBJECT",
                  range: "metro:Station",
                },
              },
            ],
            curie: "metro:circle-line",
            definition: null,
            comment: "Runs both directions; timetable is symmetric.",
          },
          __isNode: "Line",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Station",
      id: "https://metro.example/onto#harbourside",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://metro.example/onto#Station" },
        node: {
          __typename: "Station",
          uri: "https://metro.example/onto#harbourside",
          _meta: {
            title: "Harbourside",
            type: {
              uri: "https://metro.example/onto#Station",
              superclasses: [{ uri: "https://metro.example/onto#Stop" }],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "metro:Station",
                title: "Station",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "platformCount",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#platformCount",
                  kind: "DATATYPE",
                  range: "Int",
                },
              },
              {
                name: "servesLine",
                required: true,
                singular: false,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#servesLine",
                  kind: "OBJECT",
                  range: "metro:Line",
                },
              },
              {
                name: "location",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#location",
                  kind: "OBJECT",
                  range: "geo:GeoPoint",
                },
              },
              {
                name: "inZone",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#inZone",
                  kind: "OBJECT",
                  range: "geo:Zone",
                },
              },
              {
                name: "name",
                required: true,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
              {
                name: "note",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#note",
                  kind: "ANNOTATION",
                  range: "String",
                },
              },
            ],
            curie: "metro:harbourside",
            definition: null,
            comment: "Step-free to all platforms.",
          },
          __isNode: "Station",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Station",
      id: "https://metro.example/onto#northgate",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://metro.example/onto#Station" },
        node: {
          __typename: "Station",
          uri: "https://metro.example/onto#northgate",
          _meta: {
            title: "Northgate",
            type: {
              uri: "https://metro.example/onto#Station",
              superclasses: [{ uri: "https://metro.example/onto#Stop" }],
              __isNode: "OntologyClass",
              __typename: "OntologyClass",
              _meta: {
                curie: "metro:Station",
                title: "Station",
                type: { uri: "http://www.w3.org/2000/01/rdf-schema#Class" },
              },
            },
            fields: [
              {
                name: "platformCount",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#platformCount",
                  kind: "DATATYPE",
                  range: "Int",
                },
              },
              {
                name: "servesLine",
                required: true,
                singular: false,
                inherited: false,
                property: {
                  uri: "https://metro.example/onto#servesLine",
                  kind: "OBJECT",
                  range: "metro:Line",
                },
              },
              {
                name: "location",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#location",
                  kind: "OBJECT",
                  range: "geo:GeoPoint",
                },
              },
              {
                name: "inZone",
                required: false,
                singular: true,
                inherited: false,
                property: {
                  uri: "https://geo.example/onto#inZone",
                  kind: "OBJECT",
                  range: "geo:Zone",
                },
              },
              {
                name: "name",
                required: true,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#name",
                  kind: "DATATYPE",
                  range: "String",
                },
              },
              {
                name: "note",
                required: false,
                singular: true,
                inherited: true,
                property: {
                  uri: "https://metro.example/onto#note",
                  kind: "ANNOTATION",
                  range: "String",
                },
              },
            ],
            curie: "metro:northgate",
            definition: "The northern terminus.",
            comment: null,
          },
          __isNode: "Station",
        },
      },
    },
  },
  {
    operation: "EntityPageQuery",
    variables: {
      classUri: "metro:Station",
      id: "https://metro.example/onto#nowhere",
    },
    response: {
      data: {
        ontologyClass: { uri: "https://metro.example/onto#Station" },
        node: null,
      },
    },
  },
] satisfies readonly RecordedResponse[];
