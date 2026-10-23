/**
 * The metro provider's answers to the network lens's operations, at the
 * variables the stories and the record check use: the map, two stations
 * (an interchange where four routes meet, and a terminus) and two lines (a
 * loop run both ways, and a linear line). Stories read the lens off these
 * answers, so Storybook needs no provider; `networkResponses.tests.ts`
 * re-runs each operation against the provider and fails when an answer
 * drifts.
 *
 * Regenerate: execute each entry's operation (its text is the generated
 * artifact's `params.text`), with its variables, against the metro provider
 * (`createMetroExecute` in this folder's parent), and replace its `response`
 * with the answer.
 */

import type { RecordedResponse } from "../types.js";

/** The recorded answers, one per operation and variables. */
export default [
  {
    operation: "NetworkMapQuery",
    variables: {
      classUri: "metro:Line",
      first: 100,
    },
    response: {
      data: {
        ontologyClass: {
          instances: {
            edges: [
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#circle-line",
                  _meta: {
                    title: "Circle Line",
                    curie: "metro:circle-line",
                  },
                  code: "2",
                  colour: "#f2b705",
                  routes: [
                    {
                      label: "Clockwise",
                      isLoop: true,
                      reverse: {
                        label: "Anticlockwise",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#kilnwood",
                            __typename: "Station",
                            _meta: {
                              title: "Kilnwood",
                              curie: "metro:kilnwood",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#quarry-hill",
                            __typename: "Station",
                            _meta: {
                              title: "Quarry Hill",
                              curie: "metro:quarry-hill",
                            },
                            diagramPosition: {
                              x: 10,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#willowbank",
                            __typename: "Station",
                            _meta: {
                              title: "Willowbank",
                              curie: "metro:willowbank",
                            },
                            diagramPosition: {
                              x: 10,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#riverside-junction",
                            __typename: "Interchange",
                            _meta: {
                              title: "Riverside Junction",
                              curie: "metro:riverside-junction",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 13,
                            },
                          },
                        },
                      ],
                    },
                    {
                      label: "Anticlockwise",
                      isLoop: true,
                      reverse: {
                        label: "Clockwise",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#riverside-junction",
                            __typename: "Interchange",
                            _meta: {
                              title: "Riverside Junction",
                              curie: "metro:riverside-junction",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#willowbank",
                            __typename: "Station",
                            _meta: {
                              title: "Willowbank",
                              curie: "metro:willowbank",
                            },
                            diagramPosition: {
                              x: 10,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#quarry-hill",
                            __typename: "Station",
                            _meta: {
                              title: "Quarry Hill",
                              curie: "metro:quarry-hill",
                            },
                            diagramPosition: {
                              x: 10,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#kilnwood",
                            __typename: "Station",
                            _meta: {
                              title: "Kilnwood",
                              curie: "metro:kilnwood",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 5,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#coastal-line",
                  _meta: {
                    title: "Coastal Line",
                    curie: "metro:coastal-line",
                  },
                  code: "3",
                  colour: "#0072ce",
                  routes: [
                    {
                      label: "To Eastcliff",
                      isLoop: false,
                      reverse: {
                        label: "To Central Exchange",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#riverside-junction",
                            __typename: "Interchange",
                            _meta: {
                              title: "Riverside Junction",
                              curie: "metro:riverside-junction",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#harbourside",
                            __typename: "Station",
                            _meta: {
                              title: "Harbourside",
                              curie: "metro:harbourside",
                            },
                            diagramPosition: {
                              x: 9,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#saltford",
                            __typename: "Station",
                            _meta: {
                              title: "Saltford",
                              curie: "metro:saltford",
                            },
                            diagramPosition: {
                              x: 13,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#greenhithe",
                            __typename: "Station",
                            _meta: {
                              title: "Greenhithe",
                              curie: "metro:greenhithe",
                            },
                            diagramPosition: {
                              x: 17,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#eastcliff",
                            __typename: "Station",
                            _meta: {
                              title: "Eastcliff",
                              curie: "metro:eastcliff",
                            },
                            diagramPosition: {
                              x: 21,
                              y: 18,
                            },
                          },
                        },
                      ],
                    },
                    {
                      label: "To Central Exchange",
                      isLoop: false,
                      reverse: {
                        label: "To Eastcliff",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#eastcliff",
                            __typename: "Station",
                            _meta: {
                              title: "Eastcliff",
                              curie: "metro:eastcliff",
                            },
                            diagramPosition: {
                              x: 21,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#greenhithe",
                            __typename: "Station",
                            _meta: {
                              title: "Greenhithe",
                              curie: "metro:greenhithe",
                            },
                            diagramPosition: {
                              x: 17,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#saltford",
                            __typename: "Station",
                            _meta: {
                              title: "Saltford",
                              curie: "metro:saltford",
                            },
                            diagramPosition: {
                              x: 13,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#harbourside",
                            __typename: "Station",
                            _meta: {
                              title: "Harbourside",
                              curie: "metro:harbourside",
                            },
                            diagramPosition: {
                              x: 9,
                              y: 18,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#riverside-junction",
                            __typename: "Interchange",
                            _meta: {
                              title: "Riverside Junction",
                              curie: "metro:riverside-junction",
                            },
                            diagramPosition: {
                              x: 4,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#lowland-line",
                  _meta: {
                    title: "Lowland Line",
                    curie: "metro:lowland-line",
                  },
                  code: "5",
                  colour: "#8e3ba3",
                  routes: [
                    {
                      label: "To Eastwick Cross",
                      isLoop: false,
                      reverse: {
                        label: "To Tannery Lane",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#millford",
                            __typename: "Station",
                            _meta: {
                              title: "Millford",
                              curie: "metro:millford",
                            },
                            diagramPosition: {
                              x: 18,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#reedmere",
                            __typename: "Station",
                            _meta: {
                              title: "Reedmere",
                              curie: "metro:reedmere",
                            },
                            diagramPosition: {
                              x: 24,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#eastwick-cross",
                            __typename: "Interchange",
                            _meta: {
                              title: "Eastwick Cross",
                              curie: "metro:eastwick-cross",
                            },
                            diagramPosition: {
                              x: 28,
                              y: 9,
                            },
                          },
                        },
                      ],
                    },
                    {
                      label: "To Tannery Lane",
                      isLoop: false,
                      reverse: {
                        label: "To Eastwick Cross",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#eastwick-cross",
                            __typename: "Interchange",
                            _meta: {
                              title: "Eastwick Cross",
                              curie: "metro:eastwick-cross",
                            },
                            diagramPosition: {
                              x: 28,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#reedmere",
                            __typename: "Station",
                            _meta: {
                              title: "Reedmere",
                              curie: "metro:reedmere",
                            },
                            diagramPosition: {
                              x: 24,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#millford",
                            __typename: "Station",
                            _meta: {
                              title: "Millford",
                              curie: "metro:millford",
                            },
                            diagramPosition: {
                              x: 18,
                              y: 13,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#north-line",
                  _meta: {
                    title: "North Line",
                    curie: "metro:north-line",
                  },
                  code: "1",
                  colour: "#c8102e",
                  routes: [
                    {
                      label: "To Marsh End",
                      isLoop: false,
                      reverse: {
                        label: "To Northgate",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#northgate",
                            __typename: "Station",
                            _meta: {
                              title: "Northgate",
                              curie: "metro:northgate",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 0,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#verge-park",
                            __typename: "Station",
                            _meta: {
                              title: "Verge Park",
                              curie: "metro:verge-park",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 3,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#foundry-row",
                            __typename: "Station",
                            _meta: {
                              title: "Foundry Row",
                              curie: "metro:foundry-row",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 6,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#marsh-end",
                            __typename: "Station",
                            _meta: {
                              title: "Marsh End",
                              curie: "metro:marsh-end",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 12,
                            },
                          },
                        },
                      ],
                    },
                    {
                      label: "To Northgate",
                      isLoop: false,
                      reverse: {
                        label: "To Marsh End",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#marsh-end",
                            __typename: "Station",
                            _meta: {
                              title: "Marsh End",
                              curie: "metro:marsh-end",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 12,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#central-exchange",
                            __typename: "Interchange",
                            _meta: {
                              title: "Central Exchange",
                              curie: "metro:central-exchange",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#foundry-row",
                            __typename: "Station",
                            _meta: {
                              title: "Foundry Row",
                              curie: "metro:foundry-row",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 6,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#verge-park",
                            __typename: "Station",
                            _meta: {
                              title: "Verge Park",
                              curie: "metro:verge-park",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 3,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#northgate",
                            __typename: "Station",
                            _meta: {
                              title: "Northgate",
                              curie: "metro:northgate",
                            },
                            diagramPosition: {
                              x: 0,
                              y: 0,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#ringway-anticlockwise",
                  _meta: {
                    title: "Ringway Anticlockwise",
                    curie: "metro:ringway-anticlockwise",
                  },
                  code: "R2",
                  colour: "#7a4b2a",
                  routes: [
                    {
                      label: "Anticlockwise",
                      isLoop: true,
                      reverse: null,
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#dyers-green",
                            __typename: "Station",
                            _meta: {
                              title: "Dyers Green",
                              curie: "metro:dyers-green",
                            },
                            diagramPosition: {
                              x: 11,
                              y: 22,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#ropewalk",
                            __typename: "Station",
                            _meta: {
                              title: "Ropewalk",
                              curie: "metro:ropewalk",
                            },
                            diagramPosition: {
                              x: 7,
                              y: 26,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#pinfold",
                            __typename: "Station",
                            _meta: {
                              title: "Pinfold",
                              curie: "metro:pinfold",
                            },
                            diagramPosition: {
                              x: 11,
                              y: 30,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#orchard-gate",
                            __typename: "Station",
                            _meta: {
                              title: "Orchard Gate",
                              curie: "metro:orchard-gate",
                            },
                            diagramPosition: {
                              x: 19,
                              y: 30,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#nettlebed",
                            __typename: "Station",
                            _meta: {
                              title: "Nettlebed",
                              curie: "metro:nettlebed",
                            },
                            diagramPosition: {
                              x: 23,
                              y: 26,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#fernside",
                            __typename: "Station",
                            _meta: {
                              title: "Fernside",
                              curie: "metro:fernside",
                            },
                            diagramPosition: {
                              x: 19,
                              y: 22,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#ringway-clockwise",
                  _meta: {
                    title: "Ringway Clockwise",
                    curie: "metro:ringway-clockwise",
                  },
                  code: "R1",
                  colour: "#c46a2b",
                  routes: [
                    {
                      label: "Clockwise",
                      isLoop: true,
                      reverse: null,
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#dyers-green",
                            __typename: "Station",
                            _meta: {
                              title: "Dyers Green",
                              curie: "metro:dyers-green",
                            },
                            diagramPosition: {
                              x: 11,
                              y: 22,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#fernside",
                            __typename: "Station",
                            _meta: {
                              title: "Fernside",
                              curie: "metro:fernside",
                            },
                            diagramPosition: {
                              x: 19,
                              y: 22,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#nettlebed",
                            __typename: "Station",
                            _meta: {
                              title: "Nettlebed",
                              curie: "metro:nettlebed",
                            },
                            diagramPosition: {
                              x: 23,
                              y: 26,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#orchard-gate",
                            __typename: "Station",
                            _meta: {
                              title: "Orchard Gate",
                              curie: "metro:orchard-gate",
                            },
                            diagramPosition: {
                              x: 19,
                              y: 30,
                            },
                          },
                        },
                        {
                          position: 5,
                          stop: {
                            uri: "https://metro.example/onto#pinfold",
                            __typename: "Station",
                            _meta: {
                              title: "Pinfold",
                              curie: "metro:pinfold",
                            },
                            diagramPosition: {
                              x: 11,
                              y: 30,
                            },
                          },
                        },
                        {
                          position: 6,
                          stop: {
                            uri: "https://metro.example/onto#ropewalk",
                            __typename: "Station",
                            _meta: {
                              title: "Ropewalk",
                              curie: "metro:ropewalk",
                            },
                            diagramPosition: {
                              x: 7,
                              y: 26,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "Line",
                  uri: "https://metro.example/onto#upland-line",
                  _meta: {
                    title: "Upland Line",
                    curie: "metro:upland-line",
                  },
                  code: "4",
                  colour: "#00843d",
                  routes: [
                    {
                      label: "To Eastwick Cross",
                      isLoop: false,
                      reverse: {
                        label: "To Tannery Lane",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#larkrise",
                            __typename: "Station",
                            _meta: {
                              title: "Larkrise",
                              curie: "metro:larkrise",
                            },
                            diagramPosition: {
                              x: 18,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#highmoor",
                            __typename: "Station",
                            _meta: {
                              title: "Highmoor",
                              curie: "metro:highmoor",
                            },
                            diagramPosition: {
                              x: 24,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#eastwick-cross",
                            __typename: "Interchange",
                            _meta: {
                              title: "Eastwick Cross",
                              curie: "metro:eastwick-cross",
                            },
                            diagramPosition: {
                              x: 28,
                              y: 9,
                            },
                          },
                        },
                      ],
                    },
                    {
                      label: "To Tannery Lane",
                      isLoop: false,
                      reverse: {
                        label: "To Eastwick Cross",
                      },
                      calls: [
                        {
                          position: 1,
                          stop: {
                            uri: "https://metro.example/onto#eastwick-cross",
                            __typename: "Interchange",
                            _meta: {
                              title: "Eastwick Cross",
                              curie: "metro:eastwick-cross",
                            },
                            diagramPosition: {
                              x: 28,
                              y: 9,
                            },
                          },
                        },
                        {
                          position: 2,
                          stop: {
                            uri: "https://metro.example/onto#highmoor",
                            __typename: "Station",
                            _meta: {
                              title: "Highmoor",
                              curie: "metro:highmoor",
                            },
                            diagramPosition: {
                              x: 24,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 3,
                          stop: {
                            uri: "https://metro.example/onto#larkrise",
                            __typename: "Station",
                            _meta: {
                              title: "Larkrise",
                              curie: "metro:larkrise",
                            },
                            diagramPosition: {
                              x: 18,
                              y: 5,
                            },
                          },
                        },
                        {
                          position: 4,
                          stop: {
                            uri: "https://metro.example/onto#tannery-lane",
                            __typename: "Interchange",
                            _meta: {
                              title: "Tannery Lane",
                              curie: "metro:tannery-lane",
                            },
                            diagramPosition: {
                              x: 14,
                              y: 9,
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          uri: "https://metro.example/onto#Line",
        },
      },
    },
  },
  {
    operation: "NetworkStationQuery",
    variables: {
      id: "https://metro.example/onto#tannery-lane",
    },
    response: {
      data: {
        node: {
          uri: "https://metro.example/onto#tannery-lane",
          __typename: "Interchange",
          _meta: {
            title: "Tannery Lane",
            curie: "metro:tannery-lane",
          },
          __isStop: "Interchange",
          platformCount: 2,
          inZone: null,
          servesLine: [
            {
              uri: "https://metro.example/onto#circle-line",
              code: "2",
              colour: "#f2b705",
              _meta: {
                title: "Circle Line",
                curie: "metro:circle-line",
              },
              routes: [
                {
                  label: "Clockwise",
                  isLoop: true,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#central-exchange",
                        _meta: {
                          title: "Central Exchange",
                          curie: "metro:central-exchange",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#kilnwood",
                        _meta: {
                          title: "Kilnwood",
                          curie: "metro:kilnwood",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#quarry-hill",
                        _meta: {
                          title: "Quarry Hill",
                          curie: "metro:quarry-hill",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#willowbank",
                        _meta: {
                          title: "Willowbank",
                          curie: "metro:willowbank",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#riverside-junction",
                        _meta: {
                          title: "Riverside Junction",
                          curie: "metro:riverside-junction",
                        },
                      },
                    },
                  ],
                },
                {
                  label: "Anticlockwise",
                  isLoop: true,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#central-exchange",
                        _meta: {
                          title: "Central Exchange",
                          curie: "metro:central-exchange",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#riverside-junction",
                        _meta: {
                          title: "Riverside Junction",
                          curie: "metro:riverside-junction",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#willowbank",
                        _meta: {
                          title: "Willowbank",
                          curie: "metro:willowbank",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#quarry-hill",
                        _meta: {
                          title: "Quarry Hill",
                          curie: "metro:quarry-hill",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#kilnwood",
                        _meta: {
                          title: "Kilnwood",
                          curie: "metro:kilnwood",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              uri: "https://metro.example/onto#upland-line",
              code: "4",
              colour: "#00843d",
              _meta: {
                title: "Upland Line",
                curie: "metro:upland-line",
              },
              routes: [
                {
                  label: "To Eastwick Cross",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#larkrise",
                        _meta: {
                          title: "Larkrise",
                          curie: "metro:larkrise",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#highmoor",
                        _meta: {
                          title: "Highmoor",
                          curie: "metro:highmoor",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#eastwick-cross",
                        _meta: {
                          title: "Eastwick Cross",
                          curie: "metro:eastwick-cross",
                        },
                      },
                    },
                  ],
                },
                {
                  label: "To Tannery Lane",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#eastwick-cross",
                        _meta: {
                          title: "Eastwick Cross",
                          curie: "metro:eastwick-cross",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#highmoor",
                        _meta: {
                          title: "Highmoor",
                          curie: "metro:highmoor",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#larkrise",
                        _meta: {
                          title: "Larkrise",
                          curie: "metro:larkrise",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              uri: "https://metro.example/onto#lowland-line",
              code: "5",
              colour: "#8e3ba3",
              _meta: {
                title: "Lowland Line",
                curie: "metro:lowland-line",
              },
              routes: [
                {
                  label: "To Eastwick Cross",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#millford",
                        _meta: {
                          title: "Millford",
                          curie: "metro:millford",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#reedmere",
                        _meta: {
                          title: "Reedmere",
                          curie: "metro:reedmere",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#eastwick-cross",
                        _meta: {
                          title: "Eastwick Cross",
                          curie: "metro:eastwick-cross",
                        },
                      },
                    },
                  ],
                },
                {
                  label: "To Tannery Lane",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#eastwick-cross",
                        _meta: {
                          title: "Eastwick Cross",
                          curie: "metro:eastwick-cross",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#reedmere",
                        _meta: {
                          title: "Reedmere",
                          curie: "metro:reedmere",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#millford",
                        _meta: {
                          title: "Millford",
                          curie: "metro:millford",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#tannery-lane",
                        _meta: {
                          title: "Tannery Lane",
                          curie: "metro:tannery-lane",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
          transferMinutes: 3,
        },
      },
    },
  },
  {
    operation: "NetworkStationQuery",
    variables: {
      id: "https://metro.example/onto#northgate",
    },
    response: {
      data: {
        node: {
          uri: "https://metro.example/onto#northgate",
          __typename: "Station",
          _meta: {
            title: "Northgate",
            curie: "metro:northgate",
          },
          __isStop: "Station",
          platformCount: 4,
          inZone: {
            _meta: {
              title: "Central Zone",
            },
            uri: "https://geo.example/onto#central-zone",
          },
          servesLine: [
            {
              uri: "https://metro.example/onto#north-line",
              code: "1",
              colour: "#c8102e",
              _meta: {
                title: "North Line",
                curie: "metro:north-line",
              },
              routes: [
                {
                  label: "To Marsh End",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#northgate",
                        _meta: {
                          title: "Northgate",
                          curie: "metro:northgate",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#verge-park",
                        _meta: {
                          title: "Verge Park",
                          curie: "metro:verge-park",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#foundry-row",
                        _meta: {
                          title: "Foundry Row",
                          curie: "metro:foundry-row",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#central-exchange",
                        _meta: {
                          title: "Central Exchange",
                          curie: "metro:central-exchange",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#marsh-end",
                        _meta: {
                          title: "Marsh End",
                          curie: "metro:marsh-end",
                        },
                      },
                    },
                  ],
                },
                {
                  label: "To Northgate",
                  isLoop: false,
                  calls: [
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#marsh-end",
                        _meta: {
                          title: "Marsh End",
                          curie: "metro:marsh-end",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Interchange",
                        uri: "https://metro.example/onto#central-exchange",
                        _meta: {
                          title: "Central Exchange",
                          curie: "metro:central-exchange",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#foundry-row",
                        _meta: {
                          title: "Foundry Row",
                          curie: "metro:foundry-row",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#verge-park",
                        _meta: {
                          title: "Verge Park",
                          curie: "metro:verge-park",
                        },
                      },
                    },
                    {
                      stop: {
                        __typename: "Station",
                        uri: "https://metro.example/onto#northgate",
                        _meta: {
                          title: "Northgate",
                          curie: "metro:northgate",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    operation: "NetworkLineQuery",
    variables: {
      id: "https://metro.example/onto#circle-line",
    },
    response: {
      data: {
        node: {
          uri: "https://metro.example/onto#circle-line",
          __typename: "Line",
          _meta: {
            title: "Circle Line",
            curie: "metro:circle-line",
          },
          code: "2",
          colour: "#f2b705",
          routes: [
            {
              label: "Clockwise",
              isLoop: true,
              reverse: {
                label: "Anticlockwise",
              },
              calls: [
                {
                  position: 1,
                  stop: {
                    uri: "https://metro.example/onto#central-exchange",
                    __typename: "Interchange",
                    _meta: {
                      title: "Central Exchange",
                      curie: "metro:central-exchange",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 4,
                  },
                },
                {
                  position: 2,
                  stop: {
                    uri: "https://metro.example/onto#kilnwood",
                    __typename: "Station",
                    _meta: {
                      title: "Kilnwood",
                      curie: "metro:kilnwood",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 3,
                  stop: {
                    uri: "https://metro.example/onto#quarry-hill",
                    __typename: "Station",
                    _meta: {
                      title: "Quarry Hill",
                      curie: "metro:quarry-hill",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 4,
                  stop: {
                    uri: "https://metro.example/onto#tannery-lane",
                    __typename: "Interchange",
                    _meta: {
                      title: "Tannery Lane",
                      curie: "metro:tannery-lane",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#upland-line",
                        code: "4",
                        colour: "#00843d",
                        _meta: {
                          title: "Upland Line",
                          curie: "metro:upland-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#lowland-line",
                        code: "5",
                        colour: "#8e3ba3",
                        _meta: {
                          title: "Lowland Line",
                          curie: "metro:lowland-line",
                        },
                      },
                    ],
                    transferMinutes: 3,
                  },
                },
                {
                  position: 5,
                  stop: {
                    uri: "https://metro.example/onto#willowbank",
                    __typename: "Station",
                    _meta: {
                      title: "Willowbank",
                      curie: "metro:willowbank",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 6,
                  stop: {
                    uri: "https://metro.example/onto#riverside-junction",
                    __typename: "Interchange",
                    _meta: {
                      title: "Riverside Junction",
                      curie: "metro:riverside-junction",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 7,
                  },
                },
              ],
            },
            {
              label: "Anticlockwise",
              isLoop: true,
              reverse: {
                label: "Clockwise",
              },
              calls: [
                {
                  position: 1,
                  stop: {
                    uri: "https://metro.example/onto#central-exchange",
                    __typename: "Interchange",
                    _meta: {
                      title: "Central Exchange",
                      curie: "metro:central-exchange",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 4,
                  },
                },
                {
                  position: 2,
                  stop: {
                    uri: "https://metro.example/onto#riverside-junction",
                    __typename: "Interchange",
                    _meta: {
                      title: "Riverside Junction",
                      curie: "metro:riverside-junction",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 7,
                  },
                },
                {
                  position: 3,
                  stop: {
                    uri: "https://metro.example/onto#willowbank",
                    __typename: "Station",
                    _meta: {
                      title: "Willowbank",
                      curie: "metro:willowbank",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 4,
                  stop: {
                    uri: "https://metro.example/onto#tannery-lane",
                    __typename: "Interchange",
                    _meta: {
                      title: "Tannery Lane",
                      curie: "metro:tannery-lane",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#upland-line",
                        code: "4",
                        colour: "#00843d",
                        _meta: {
                          title: "Upland Line",
                          curie: "metro:upland-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#lowland-line",
                        code: "5",
                        colour: "#8e3ba3",
                        _meta: {
                          title: "Lowland Line",
                          curie: "metro:lowland-line",
                        },
                      },
                    ],
                    transferMinutes: 3,
                  },
                },
                {
                  position: 5,
                  stop: {
                    uri: "https://metro.example/onto#quarry-hill",
                    __typename: "Station",
                    _meta: {
                      title: "Quarry Hill",
                      curie: "metro:quarry-hill",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 6,
                  stop: {
                    uri: "https://metro.example/onto#kilnwood",
                    __typename: "Station",
                    _meta: {
                      title: "Kilnwood",
                      curie: "metro:kilnwood",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    operation: "NetworkLineQuery",
    variables: {
      id: "https://metro.example/onto#north-line",
    },
    response: {
      data: {
        node: {
          uri: "https://metro.example/onto#north-line",
          __typename: "Line",
          _meta: {
            title: "North Line",
            curie: "metro:north-line",
          },
          code: "1",
          colour: "#c8102e",
          routes: [
            {
              label: "To Marsh End",
              isLoop: false,
              reverse: {
                label: "To Northgate",
              },
              calls: [
                {
                  position: 1,
                  stop: {
                    uri: "https://metro.example/onto#northgate",
                    __typename: "Station",
                    _meta: {
                      title: "Northgate",
                      curie: "metro:northgate",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 2,
                  stop: {
                    uri: "https://metro.example/onto#verge-park",
                    __typename: "Station",
                    _meta: {
                      title: "Verge Park",
                      curie: "metro:verge-park",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 3,
                  stop: {
                    uri: "https://metro.example/onto#foundry-row",
                    __typename: "Station",
                    _meta: {
                      title: "Foundry Row",
                      curie: "metro:foundry-row",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 4,
                  stop: {
                    uri: "https://metro.example/onto#central-exchange",
                    __typename: "Interchange",
                    _meta: {
                      title: "Central Exchange",
                      curie: "metro:central-exchange",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 4,
                  },
                },
                {
                  position: 5,
                  stop: {
                    uri: "https://metro.example/onto#marsh-end",
                    __typename: "Station",
                    _meta: {
                      title: "Marsh End",
                      curie: "metro:marsh-end",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
              ],
            },
            {
              label: "To Northgate",
              isLoop: false,
              reverse: {
                label: "To Marsh End",
              },
              calls: [
                {
                  position: 1,
                  stop: {
                    uri: "https://metro.example/onto#marsh-end",
                    __typename: "Station",
                    _meta: {
                      title: "Marsh End",
                      curie: "metro:marsh-end",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 2,
                  stop: {
                    uri: "https://metro.example/onto#central-exchange",
                    __typename: "Interchange",
                    _meta: {
                      title: "Central Exchange",
                      curie: "metro:central-exchange",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#circle-line",
                        code: "2",
                        colour: "#f2b705",
                        _meta: {
                          title: "Circle Line",
                          curie: "metro:circle-line",
                        },
                      },
                      {
                        uri: "https://metro.example/onto#coastal-line",
                        code: "3",
                        colour: "#0072ce",
                        _meta: {
                          title: "Coastal Line",
                          curie: "metro:coastal-line",
                        },
                      },
                    ],
                    transferMinutes: 4,
                  },
                },
                {
                  position: 3,
                  stop: {
                    uri: "https://metro.example/onto#foundry-row",
                    __typename: "Station",
                    _meta: {
                      title: "Foundry Row",
                      curie: "metro:foundry-row",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 4,
                  stop: {
                    uri: "https://metro.example/onto#verge-park",
                    __typename: "Station",
                    _meta: {
                      title: "Verge Park",
                      curie: "metro:verge-park",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
                {
                  position: 5,
                  stop: {
                    uri: "https://metro.example/onto#northgate",
                    __typename: "Station",
                    _meta: {
                      title: "Northgate",
                      curie: "metro:northgate",
                    },
                    servesLine: [
                      {
                        uri: "https://metro.example/onto#north-line",
                        code: "1",
                        colour: "#c8102e",
                        _meta: {
                          title: "North Line",
                          curie: "metro:north-line",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
] satisfies readonly RecordedResponse[];
