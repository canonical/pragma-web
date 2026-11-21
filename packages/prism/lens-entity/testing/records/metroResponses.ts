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
    "operation": "EntityNamespacesQuery",
    "variables": {},
    "response": {
      "data": {
        "ontologies": [
          {
            "prefix": "metro",
            "namespace": "https://metro.example/onto#"
          },
          {
            "prefix": "geo",
            "namespace": "https://geo.example/onto#"
          },
          {
            "prefix": "rdfs",
            "namespace": "http://www.w3.org/2000/01/rdf-schema#"
          }
        ]
      }
    }
  },
  {
    "operation": "EntityIndexQuery",
    "variables": {
      "classUri": "metro:Nowhere",
      "count": 100,
      "cursor": null
    },
    "response": {
      "data": {
        "ontologyClass": null
      }
    }
  },
  {
    "operation": "EntityIndexQuery",
    "variables": {
      "classUri": "metro:Station",
      "count": 100,
      "cursor": null
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station",
          "instanceCount": 16,
          "instances": {
            "edges": [
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#",
                  "_meta": {
                    "title": "https://metro.example/onto#",
                    "curie": "metro:",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8j"
              },
              {
                "node": {
                  "__typename": "Interchange",
                  "uri": "https://metro.example/onto#central-exchange",
                  "_meta": {
                    "title": "Central Exchange",
                    "curie": "metro:central-exchange",
                    "type": {
                      "uri": "https://metro.example/onto#Interchange",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": "The busiest transfer point on the network."
                  },
                  "__isNode": "Interchange"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jY2VudHJhbC1leGNoYW5nZQ=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#eastcliff",
                  "_meta": {
                    "title": "Eastcliff",
                    "curie": "metro:eastcliff",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZWFzdGNsaWZm"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#foundry-row",
                  "_meta": {
                    "title": "Foundry Row",
                    "curie": "metro:foundry-row",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZm91bmRyeS1yb3c="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#ghost",
                  "_meta": {
                    "title": "ghost",
                    "curie": "metro:ghost",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#greenhithe",
                  "_meta": {
                    "title": "Greenhithe",
                    "curie": "metro:greenhithe",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ3JlZW5oaXRoZQ=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#harbourside",
                  "_meta": {
                    "title": "Harbourside",
                    "curie": "metro:harbourside",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jaGFyYm91cnNpZGU="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#kilnwood",
                  "_meta": {
                    "title": "Kilnwood",
                    "curie": "metro:kilnwood",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8ja2lsbndvb2Q="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#marsh-end",
                  "_meta": {
                    "title": "Marsh End",
                    "curie": "metro:marsh-end",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbWFyc2gtZW5k"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#northgate",
                  "_meta": {
                    "title": "Northgate",
                    "curie": "metro:northgate",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": "The northern terminus."
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbm9ydGhnYXRl"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#quarry-hill",
                  "_meta": {
                    "title": "Quarry Hill",
                    "curie": "metro:quarry-hill",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcXVhcnJ5LWhpbGw="
              },
              {
                "node": {
                  "__typename": "Interchange",
                  "uri": "https://metro.example/onto#riverside-junction",
                  "_meta": {
                    "title": "Riverside Junction",
                    "curie": "metro:riverside-junction",
                    "type": {
                      "uri": "https://metro.example/onto#Interchange",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Interchange"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcml2ZXJzaWRlLWp1bmN0aW9u"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#saltford",
                  "_meta": {
                    "title": "Saltford",
                    "curie": "metro:saltford",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jc2FsdGZvcmQ="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#tannery-lane",
                  "_meta": {
                    "title": "Tannery Lane",
                    "curie": "metro:tannery-lane",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdGFubmVyeS1sYW5l"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#verge-park",
                  "_meta": {
                    "title": "Verge Park",
                    "curie": "metro:verge-park",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdmVyZ2UtcGFyaw=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#willowbank",
                  "_meta": {
                    "title": "Willowbank",
                    "curie": "metro:willowbank",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw=="
              }
            ],
            "pageInfo": {
              "endCursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              "hasNextPage": false
            }
          }
        }
      }
    }
  },
  {
    "operation": "EntityIndexQuery",
    "variables": {
      "classUri": "metro:Station",
      "count": 5,
      "cursor": null
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station",
          "instanceCount": 16,
          "instances": {
            "edges": [
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#",
                  "_meta": {
                    "title": "https://metro.example/onto#",
                    "curie": "metro:",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8j"
              },
              {
                "node": {
                  "__typename": "Interchange",
                  "uri": "https://metro.example/onto#central-exchange",
                  "_meta": {
                    "title": "Central Exchange",
                    "curie": "metro:central-exchange",
                    "type": {
                      "uri": "https://metro.example/onto#Interchange",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": "The busiest transfer point on the network."
                  },
                  "__isNode": "Interchange"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jY2VudHJhbC1leGNoYW5nZQ=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#eastcliff",
                  "_meta": {
                    "title": "Eastcliff",
                    "curie": "metro:eastcliff",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZWFzdGNsaWZm"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#foundry-row",
                  "_meta": {
                    "title": "Foundry Row",
                    "curie": "metro:foundry-row",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZm91bmRyeS1yb3c="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#ghost",
                  "_meta": {
                    "title": "ghost",
                    "curie": "metro:ghost",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q="
              }
            ],
            "pageInfo": {
              "endCursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q=",
              "hasNextPage": true
            }
          }
        }
      }
    }
  },
  {
    "operation": "EntityIndexPaginationQuery",
    "variables": {
      "classUri": "metro:Station",
      "count": 100,
      "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ2hvc3Q="
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station",
          "instanceCount": 16,
          "instances": {
            "edges": [
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#greenhithe",
                  "_meta": {
                    "title": "Greenhithe",
                    "curie": "metro:greenhithe",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jZ3JlZW5oaXRoZQ=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#harbourside",
                  "_meta": {
                    "title": "Harbourside",
                    "curie": "metro:harbourside",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jaGFyYm91cnNpZGU="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#kilnwood",
                  "_meta": {
                    "title": "Kilnwood",
                    "curie": "metro:kilnwood",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8ja2lsbndvb2Q="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#marsh-end",
                  "_meta": {
                    "title": "Marsh End",
                    "curie": "metro:marsh-end",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbWFyc2gtZW5k"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#northgate",
                  "_meta": {
                    "title": "Northgate",
                    "curie": "metro:northgate",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": "The northern terminus."
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jbm9ydGhnYXRl"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#quarry-hill",
                  "_meta": {
                    "title": "Quarry Hill",
                    "curie": "metro:quarry-hill",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcXVhcnJ5LWhpbGw="
              },
              {
                "node": {
                  "__typename": "Interchange",
                  "uri": "https://metro.example/onto#riverside-junction",
                  "_meta": {
                    "title": "Riverside Junction",
                    "curie": "metro:riverside-junction",
                    "type": {
                      "uri": "https://metro.example/onto#Interchange",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Interchange"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jcml2ZXJzaWRlLWp1bmN0aW9u"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#saltford",
                  "_meta": {
                    "title": "Saltford",
                    "curie": "metro:saltford",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jc2FsdGZvcmQ="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#tannery-lane",
                  "_meta": {
                    "title": "Tannery Lane",
                    "curie": "metro:tannery-lane",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Interchange"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdGFubmVyeS1sYW5l"
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#verge-park",
                  "_meta": {
                    "title": "Verge Park",
                    "curie": "metro:verge-park",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jdmVyZ2UtcGFyaw=="
              },
              {
                "node": {
                  "__typename": "Station",
                  "uri": "https://metro.example/onto#willowbank",
                  "_meta": {
                    "title": "Willowbank",
                    "curie": "metro:willowbank",
                    "type": {
                      "uri": "https://metro.example/onto#Station",
                      "_meta": {
                        "title": "Station"
                      }
                    },
                    "definition": null
                  },
                  "__isNode": "Station"
                },
                "cursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw=="
              }
            ],
            "pageInfo": {
              "endCursor": "aHR0cHM6Ly9tZXRyby5leGFtcGxlL29udG8jd2lsbG93YmFuaw==",
              "hasNextPage": false
            }
          }
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "geo:Zone",
      "id": "https://geo.example/onto#coastal-zone"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://geo.example/onto#Zone"
        },
        "node": {
          "__typename": "Zone",
          "uri": "https://geo.example/onto#coastal-zone",
          "_meta": {
            "title": "Coastal Zone",
            "type": {
              "uri": "https://geo.example/onto#Zone",
              "superclasses": [],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "geo:Zone",
                "title": "Fare zone",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Fare zone"
            },
            "fields": [
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": null,
                "visibility": null,
                "group": null
              }
            ],
            "curie": "geo:coastal-zone",
            "definition": null,
            "comment": null,
            "label": "Coastal Zone"
          },
          "__isNode": "Zone"
        }
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://geo.example/onto#coastal-zone"
    },
    "response": {
      "data": {
        "outgoing": {
          "total": 2,
          "groups": [
            {
              "predicateUri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "OntologyClass",
                    "uri": "https://geo.example/onto#Zone",
                    "__isNode": "OntologyClass",
                    "_meta": {
                      "title": "Fare zone",
                      "curie": "geo:Zone"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#label",
              "total": 1,
              "predicate": {
                "label": "label",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "http://www.w3.org/2000/01/rdf-schema#label"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Coastal Zone",
                  "lang": null
                }
              ]
            }
          ]
        },
        "incoming": {
          "total": 3,
          "groups": [
            {
              "predicateUri": "https://geo.example/onto#inZone",
              "total": 3,
              "predicate": {
                "label": "in zone",
                "pluralLabel": "in zones",
                "inverseLabel": "stops",
                "inversePluralLabel": "stops",
                "uri": "https://geo.example/onto#inZone"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#eastcliff",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Eastcliff",
                      "curie": "metro:eastcliff"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#harbourside",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Harbourside",
                      "curie": "metro:harbourside"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#saltford",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Saltford",
                      "curie": "metro:saltford"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Nowhere",
      "id": "https://metro.example/onto#northgate"
    },
    "response": {
      "data": {
        "ontologyClass": null,
        "node": {
          "__typename": "Station",
          "uri": "https://metro.example/onto#northgate",
          "_meta": {
            "title": "Northgate",
            "type": {
              "uri": "https://metro.example/onto#Station",
              "superclasses": [
                {
                  "uri": "https://metro.example/onto#Stop"
                }
              ],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "metro:Station",
                "title": "Station",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Station"
            },
            "fields": [
              {
                "name": "platformCount",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#platformCount",
                  "kind": "DATATYPE",
                  "range": "Int"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "servesLine",
                "required": true,
                "singular": false,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#servesLine",
                  "kind": "OBJECT",
                  "range": "metro:Line"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                }
              },
              {
                "name": "location",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#location",
                  "kind": "OBJECT",
                  "range": "geo:GeoPoint"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "inZone",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#inZone",
                  "kind": "OBJECT",
                  "range": "geo:Zone"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "note",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#note",
                  "kind": "ANNOTATION",
                  "range": "String"
                },
                "order": null,
                "visibility": "HIDDEN",
                "group": null
              }
            ],
            "curie": "metro:northgate",
            "definition": "The northern terminus.",
            "comment": null,
            "label": "Northgate"
          },
          "__isNode": "Station"
        }
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://metro.example/onto#northgate"
    },
    "response": {
      "data": {
        "outgoing": {
          "total": 10,
          "groups": [
            {
              "predicateUri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "OntologyClass",
                    "uri": "https://metro.example/onto#Station",
                    "__isNode": "OntologyClass",
                    "_meta": {
                      "title": "Station",
                      "curie": "metro:Station"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#inZone",
              "total": 1,
              "predicate": {
                "label": "in zone",
                "pluralLabel": "in zones",
                "inverseLabel": "stops",
                "inversePluralLabel": "stops",
                "uri": "https://geo.example/onto#inZone"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Zone",
                    "uri": "https://geo.example/onto#central-zone",
                    "__isNode": "Zone",
                    "_meta": {
                      "title": "Central Zone",
                      "curie": "geo:central-zone"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#location",
              "total": 1,
              "predicate": {
                "label": "location",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://geo.example/onto#location"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": {
                    "label": "Geo point",
                    "uri": "https://geo.example/onto#GeoPoint"
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#diagramPosition",
              "total": 1,
              "predicate": {
                "label": "diagram position",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#diagramPosition"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformCount",
              "total": 1,
              "predicate": {
                "label": "platform count",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformCount"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "4",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformLength",
              "total": 1,
              "predicate": {
                "label": "platform length",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformLength"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "125000",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#servesLine",
              "total": 1,
              "predicate": {
                "label": "serves line",
                "pluralLabel": "serves lines",
                "inverseLabel": "served by",
                "inversePluralLabel": "served by",
                "uri": "https://metro.example/onto#servesLine"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#label",
              "total": 2,
              "predicate": {
                "label": "label",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "http://www.w3.org/2000/01/rdf-schema#label"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Northgate",
                  "lang": null
                },
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Porte-Nord",
                  "lang": "fr"
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2004/02/skos/core#definition",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "The northern terminus.",
                  "lang": null
                }
              ]
            }
          ]
        },
        "incoming": {
          "total": 2,
          "groups": [
            {
              "predicateUri": "https://metro.example/onto#calls",
              "total": 2,
              "predicate": {
                "label": "calls",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#calls"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Station",
      "id": "https://metro.example/onto#central-exchange"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station"
        },
        "node": {
          "__typename": "Interchange",
          "uri": "https://metro.example/onto#central-exchange",
          "_meta": {
            "title": "Central Exchange",
            "type": {
              "uri": "https://metro.example/onto#Interchange",
              "superclasses": [
                {
                  "uri": "https://metro.example/onto#Station"
                },
                {
                  "uri": "https://metro.example/onto#Stop"
                }
              ],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "metro:Interchange",
                "title": "Interchange",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Interchange"
            },
            "fields": [
              {
                "name": "transferMinutes",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#transferMinutes",
                  "kind": "DATATYPE",
                  "range": "Int"
                },
                "order": 2,
                "visibility": "PROMINENT",
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "platformCount",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#platformCount",
                  "kind": "DATATYPE",
                  "range": "Int"
                },
                "order": 3,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "servesLine",
                "required": true,
                "singular": false,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#servesLine",
                  "kind": "OBJECT",
                  "range": "metro:Line"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                }
              },
              {
                "name": "location",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://geo.example/onto#location",
                  "kind": "OBJECT",
                  "range": "geo:GeoPoint"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "inZone",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://geo.example/onto#inZone",
                  "kind": "OBJECT",
                  "range": "geo:Zone"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "note",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#note",
                  "kind": "ANNOTATION",
                  "range": "String"
                },
                "order": null,
                "visibility": "HIDDEN",
                "group": null
              }
            ],
            "curie": "metro:central-exchange",
            "definition": "The busiest transfer point on the network.",
            "comment": null,
            "label": "Central Exchange"
          },
          "__isNode": "Interchange"
        }
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://metro.example/onto#central-exchange"
    },
    "response": {
      "data": {
        "outgoing": {
          "total": 12,
          "groups": [
            {
              "predicateUri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "OntologyClass",
                    "uri": "https://metro.example/onto#Interchange",
                    "__isNode": "OntologyClass",
                    "_meta": {
                      "title": "Interchange",
                      "curie": "metro:Interchange"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#inZone",
              "total": 1,
              "predicate": {
                "label": "in zone",
                "pluralLabel": "in zones",
                "inverseLabel": "stops",
                "inversePluralLabel": "stops",
                "uri": "https://geo.example/onto#inZone"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Zone",
                    "uri": "https://geo.example/onto#central-zone",
                    "__isNode": "Zone",
                    "_meta": {
                      "title": "Central Zone",
                      "curie": "geo:central-zone"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#location",
              "total": 1,
              "predicate": {
                "label": "location",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://geo.example/onto#location"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": {
                    "label": "Geo point",
                    "uri": "https://geo.example/onto#GeoPoint"
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#diagramPosition",
              "total": 1,
              "predicate": {
                "label": "diagram position",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#diagramPosition"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformCount",
              "total": 1,
              "predicate": {
                "label": "platform count",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformCount"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "8",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformLength",
              "total": 1,
              "predicate": {
                "label": "platform length",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformLength"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "160000",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#servesLine",
              "total": 3,
              "predicate": {
                "label": "serves line",
                "pluralLabel": "serves lines",
                "inverseLabel": "served by",
                "inversePluralLabel": "served by",
                "uri": "https://metro.example/onto#servesLine"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#circle-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Circle Line",
                      "curie": "metro:circle-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#transferMinutes",
              "total": 1,
              "predicate": {
                "label": "transfer minutes",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#transferMinutes"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "4",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#label",
              "total": 1,
              "predicate": {
                "label": "label",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "http://www.w3.org/2000/01/rdf-schema#label"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Central Exchange",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2004/02/skos/core#definition",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "The busiest transfer point on the network.",
                  "lang": null
                }
              ]
            }
          ]
        },
        "incoming": {
          "total": 6,
          "groups": [
            {
              "predicateUri": "https://metro.example/onto#calls",
              "total": 6,
              "predicate": {
                "label": "calls",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#calls"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#circle-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Circle Line",
                      "curie": "metro:circle-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#circle-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Circle Line",
                      "curie": "metro:circle-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#north-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "North Line",
                      "curie": "metro:north-line"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Station",
      "id": "https://metro.example/onto#circle-line"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station"
        },
        "node": {
          "__typename": "Line",
          "uri": "https://metro.example/onto#circle-line",
          "_meta": {
            "title": "Circle Line",
            "type": {
              "uri": "https://metro.example/onto#Line",
              "superclasses": [],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "metro:Line",
                "title": "Line",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Line"
            },
            "fields": [
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "servedBy",
                "required": false,
                "singular": false,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#servedBy",
                  "kind": "OBJECT",
                  "range": "metro:Station"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                }
              }
            ],
            "curie": "metro:circle-line",
            "definition": null,
            "comment": "Runs both directions; timetable is symmetric.",
            "label": "Circle Line"
          },
          "__isNode": "Line"
        }
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://metro.example/onto#circle-line"
    },
    "response": {
      "data": {
        "outgoing": {
          "total": 9,
          "groups": [
            {
              "predicateUri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "OntologyClass",
                    "uri": "https://metro.example/onto#Line",
                    "__isNode": "OntologyClass",
                    "_meta": {
                      "title": "Line",
                      "curie": "metro:Line"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#code",
              "total": 1,
              "predicate": {
                "label": "code",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#code"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "2",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#colour",
              "total": 1,
              "predicate": {
                "label": "colour",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#colour"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "#f2b705",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#formations",
              "total": 1,
              "predicate": {
                "label": "formations",
                "pluralLabel": "formations",
                "inverseLabel": "Run on",
                "inversePluralLabel": "Run on",
                "uri": "https://metro.example/onto#formations"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Formation",
                    "uri": "https://metro.example/onto#series-70-fixed",
                    "__isNode": "Formation",
                    "_meta": {
                      "title": "Series 70 fixed formation",
                      "curie": "metro:series-70-fixed"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#routes",
              "total": 2,
              "predicate": {
                "label": "routes",
                "pluralLabel": "routes",
                "inverseLabel": "Line",
                "inversePluralLabel": "Lines",
                "uri": "https://metro.example/onto#routes"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": null
                },
                {
                  "__typename": "StatementNested",
                  "type": null
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#comment",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Runs both directions; timetable is symmetric.",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#label",
              "total": 2,
              "predicate": {
                "label": "label",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "http://www.w3.org/2000/01/rdf-schema#label"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Circle Line",
                  "lang": null
                },
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Ligne Circulaire",
                  "lang": "fr"
                }
              ]
            }
          ]
        },
        "incoming": {
          "total": 6,
          "groups": [
            {
              "predicateUri": "https://metro.example/onto#servesLine",
              "total": 6,
              "predicate": {
                "label": "serves line",
                "pluralLabel": "serves lines",
                "inverseLabel": "served by",
                "inversePluralLabel": "served by",
                "uri": "https://metro.example/onto#servesLine"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Interchange",
                    "uri": "https://metro.example/onto#central-exchange",
                    "__isNode": "Interchange",
                    "_meta": {
                      "title": "Central Exchange",
                      "curie": "metro:central-exchange"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#kilnwood",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Kilnwood",
                      "curie": "metro:kilnwood"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#quarry-hill",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Quarry Hill",
                      "curie": "metro:quarry-hill"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Interchange",
                    "uri": "https://metro.example/onto#riverside-junction",
                    "__isNode": "Interchange",
                    "_meta": {
                      "title": "Riverside Junction",
                      "curie": "metro:riverside-junction"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Interchange",
                    "uri": "https://metro.example/onto#tannery-lane",
                    "__isNode": "Interchange",
                    "_meta": {
                      "title": "Tannery Lane",
                      "curie": "metro:tannery-lane"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Station",
                    "uri": "https://metro.example/onto#willowbank",
                    "__isNode": "Station",
                    "_meta": {
                      "title": "Willowbank",
                      "curie": "metro:willowbank"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Station",
      "id": "https://metro.example/onto#harbourside"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station"
        },
        "node": {
          "__typename": "Station",
          "uri": "https://metro.example/onto#harbourside",
          "_meta": {
            "title": "Harbourside",
            "type": {
              "uri": "https://metro.example/onto#Station",
              "superclasses": [
                {
                  "uri": "https://metro.example/onto#Stop"
                }
              ],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "metro:Station",
                "title": "Station",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Station"
            },
            "fields": [
              {
                "name": "platformCount",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#platformCount",
                  "kind": "DATATYPE",
                  "range": "Int"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "servesLine",
                "required": true,
                "singular": false,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#servesLine",
                  "kind": "OBJECT",
                  "range": "metro:Line"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                }
              },
              {
                "name": "location",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#location",
                  "kind": "OBJECT",
                  "range": "geo:GeoPoint"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "inZone",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#inZone",
                  "kind": "OBJECT",
                  "range": "geo:Zone"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "note",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#note",
                  "kind": "ANNOTATION",
                  "range": "String"
                },
                "order": null,
                "visibility": "HIDDEN",
                "group": null
              }
            ],
            "curie": "metro:harbourside",
            "definition": null,
            "comment": "Step-free to all platforms.",
            "label": "Harbourside"
          },
          "__isNode": "Station"
        }
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://metro.example/onto#harbourside"
    },
    "response": {
      "data": {
        "outgoing": {
          "total": 9,
          "groups": [
            {
              "predicateUri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "OntologyClass",
                    "uri": "https://metro.example/onto#Station",
                    "__isNode": "OntologyClass",
                    "_meta": {
                      "title": "Station",
                      "curie": "metro:Station"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#inZone",
              "total": 1,
              "predicate": {
                "label": "in zone",
                "pluralLabel": "in zones",
                "inverseLabel": "stops",
                "inversePluralLabel": "stops",
                "uri": "https://geo.example/onto#inZone"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Zone",
                    "uri": "https://geo.example/onto#coastal-zone",
                    "__isNode": "Zone",
                    "_meta": {
                      "title": "Coastal Zone",
                      "curie": "geo:coastal-zone"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "https://geo.example/onto#location",
              "total": 1,
              "predicate": {
                "label": "location",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://geo.example/onto#location"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": {
                    "label": "Geo point",
                    "uri": "https://geo.example/onto#GeoPoint"
                  }
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#diagramPosition",
              "total": 1,
              "predicate": {
                "label": "diagram position",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#diagramPosition"
              },
              "values": [
                {
                  "__typename": "StatementNested",
                  "type": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformCount",
              "total": 1,
              "predicate": {
                "label": "platform count",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformCount"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "2",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#platformLength",
              "total": 1,
              "predicate": {
                "label": "platform length",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#platformLength"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "125000",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "https://metro.example/onto#servesLine",
              "total": 1,
              "predicate": {
                "label": "serves line",
                "pluralLabel": "serves lines",
                "inverseLabel": "served by",
                "inversePluralLabel": "served by",
                "uri": "https://metro.example/onto#servesLine"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#comment",
              "total": 1,
              "predicate": null,
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Step-free to all platforms.",
                  "lang": null
                }
              ]
            },
            {
              "predicateUri": "http://www.w3.org/2000/01/rdf-schema#label",
              "total": 1,
              "predicate": {
                "label": "label",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "http://www.w3.org/2000/01/rdf-schema#label"
              },
              "values": [
                {
                  "__typename": "StatementLiteral",
                  "lexical": "Harbourside",
                  "lang": null
                }
              ]
            }
          ]
        },
        "incoming": {
          "total": 2,
          "groups": [
            {
              "predicateUri": "https://metro.example/onto#calls",
              "total": 2,
              "predicate": {
                "label": "calls",
                "pluralLabel": null,
                "inverseLabel": null,
                "inversePluralLabel": null,
                "uri": "https://metro.example/onto#calls"
              },
              "values": [
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                },
                {
                  "__typename": "StatementNode",
                  "node": {
                    "__typename": "Line",
                    "uri": "https://metro.example/onto#coastal-line",
                    "__isNode": "Line",
                    "_meta": {
                      "title": "Coastal Line",
                      "curie": "metro:coastal-line"
                    }
                  }
                }
              ]
            }
          ]
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Station",
      "id": "https://metro.example/onto#northgate"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station"
        },
        "node": {
          "__typename": "Station",
          "uri": "https://metro.example/onto#northgate",
          "_meta": {
            "title": "Northgate",
            "type": {
              "uri": "https://metro.example/onto#Station",
              "superclasses": [
                {
                  "uri": "https://metro.example/onto#Stop"
                }
              ],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "curie": "metro:Station",
                "title": "Station",
                "type": {
                  "uri": "http://www.w3.org/2000/01/rdf-schema#Class"
                }
              },
              "label": "Station"
            },
            "fields": [
              {
                "name": "platformCount",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#platformCount",
                  "kind": "DATATYPE",
                  "range": "Int"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "servesLine",
                "required": true,
                "singular": false,
                "inherited": false,
                "property": {
                  "uri": "https://metro.example/onto#servesLine",
                  "kind": "OBJECT",
                  "range": "metro:Line"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                }
              },
              {
                "name": "location",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#location",
                  "kind": "OBJECT",
                  "range": "geo:GeoPoint"
                },
                "order": 1,
                "visibility": "PROMINENT",
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "inZone",
                "required": false,
                "singular": true,
                "inherited": false,
                "property": {
                  "uri": "https://geo.example/onto#inZone",
                  "kind": "OBJECT",
                  "range": "geo:Zone"
                },
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 3,
                  "uri": "https://metro.example/onto#section.place"
                }
              },
              {
                "name": "name",
                "required": true,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                }
              },
              {
                "name": "note",
                "required": false,
                "singular": true,
                "inherited": true,
                "property": {
                  "uri": "https://metro.example/onto#note",
                  "kind": "ANNOTATION",
                  "range": "String"
                },
                "order": null,
                "visibility": "HIDDEN",
                "group": null
              }
            ],
            "curie": "metro:northgate",
            "definition": "The northern terminus.",
            "comment": null,
            "label": "Northgate"
          },
          "__isNode": "Station"
        }
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Station",
      "id": "https://metro.example/onto#nowhere"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Station"
        },
        "node": null
      }
    }
  },
  {
    "operation": "EntityStatementsQuery",
    "variables": {
      "uri": "https://metro.example/onto#nowhere"
    },
    "response": {
      "data": {
        "outgoing": null,
        "incoming": null
      }
    }
  },
  {
    "operation": "EntityPageQuery",
    "variables": {
      "classUri": "metro:Line",
      "id": "https://metro.example/onto#circle-line"
    },
    "response": {
      "data": {
        "ontologyClass": {
          "uri": "https://metro.example/onto#Line"
        },
        "node": {
          "__typename": "Line",
          "uri": "https://metro.example/onto#circle-line",
          "_meta": {
            "title": "Circle Line",
            "curie": "metro:circle-line",
            "type": {
              "uri": "https://metro.example/onto#Line",
              "label": "Line",
              "superclasses": [],
              "__isNode": "OntologyClass",
              "__typename": "OntologyClass",
              "_meta": {
                "title": "Line",
                "curie": "metro:Line"
              }
            },
            "label": "Circle Line",
            "definition": null,
            "comment": "Runs both directions; timetable is symmetric.",
            "fields": [
              {
                "name": "name",
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                },
                "property": {
                  "uri": "https://metro.example/onto#name",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "required": true,
                "singular": true,
                "inherited": false
              },
              {
                "name": "servedBy",
                "order": 2,
                "visibility": null,
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                },
                "property": {
                  "uri": "https://metro.example/onto#servedBy",
                  "kind": "OBJECT",
                  "range": "metro:Station"
                },
                "required": false,
                "singular": false,
                "inherited": false
              },
              {
                "name": "code",
                "order": 2,
                "visibility": "PROMINENT",
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                },
                "property": {
                  "uri": "https://metro.example/onto#code",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "required": true,
                "singular": true,
                "inherited": false
              },
              {
                "name": "colour",
                "order": 3,
                "visibility": null,
                "group": {
                  "order": 1,
                  "uri": "https://metro.example/onto#section.overview"
                },
                "property": {
                  "uri": "https://metro.example/onto#colour",
                  "kind": "DATATYPE",
                  "range": "String"
                },
                "required": true,
                "singular": true,
                "inherited": false
              },
              {
                "name": "routes",
                "order": 1,
                "visibility": null,
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                },
                "property": {
                  "uri": "https://metro.example/onto#routes",
                  "kind": "OBJECT",
                  "range": "metro:Route"
                },
                "required": true,
                "singular": false,
                "inherited": false
              },
              {
                "name": "formations",
                "order": 3,
                "visibility": null,
                "group": {
                  "order": 2,
                  "uri": "https://metro.example/onto#section.service"
                },
                "property": {
                  "uri": "https://metro.example/onto#formations",
                  "kind": "OBJECT",
                  "range": "metro:Formation"
                },
                "required": true,
                "singular": false,
                "inherited": false
              }
            ]
          },
          "__isNode": "Line"
        }
      }
    }
  }
] satisfies readonly RecordedResponse[];
