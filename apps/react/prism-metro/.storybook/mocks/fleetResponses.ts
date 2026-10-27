/**
 * The metro graph's answers to the fleet lens's operations, one per page a
 * story shows: the namespaces, the index, the Series 90 stock, its six-car
 * formation, its unit and its driving car. The stories read the lens off
 * these recorded answers, so they render without a provider; an app test
 * holds each one equal to the provider's live answer, so they cannot drift.
 *
 * Regenerate: execute each entry's operation (its text is the generated
 * artifact's `params.text`), with its variables, against the metro provider
 * (`createExampleProvider()` from `@canonical/prism-graph-example`), and
 * replace its `response` with the JSON answer.
 */

/** One recorded answer: the operation, its variables and the response. */
export interface FleetResponse {
  readonly operation: string;
  readonly variables: Readonly<Record<string, unknown>>;
  readonly response: { readonly data: unknown };
}

/** The recorded answers, one per operation and variables. */
export const FLEET_RESPONSES: readonly FleetResponse[] = [
  {
    operation: "FleetNamespacesQuery",
    variables: {},
    response: {
      data: {
        ontologies: [
          {
            prefix: "metro",
            namespace: "https://metro.example/onto#",
          },
          {
            prefix: "geo",
            namespace: "https://geo.example/onto#",
          },
          {
            prefix: "rdfs",
            namespace: "http://www.w3.org/2000/01/rdf-schema#",
          },
        ],
      },
    },
  },
  {
    operation: "FleetIndexQuery",
    variables: {
      classUri: "metro:RollingStock",
      count: 50,
    },
    response: {
      data: {
        ontologyClass: {
          instances: {
            edges: [
              {
                node: {
                  __typename: "RollingStock",
                  __isNode: "RollingStock",
                  uri: "https://metro.example/onto#series-50",
                  _meta: {
                    title: "Series 50",
                    curie: "metro:series-50",
                    definition: null,
                    type: {
                      _meta: {
                        title: "Rolling stock",
                      },
                      uri: "https://metro.example/onto#RollingStock",
                    },
                  },
                  formations: [
                    {
                      uri: "https://metro.example/onto#series-50-four-car",
                      length: 62000,
                      capacity: 460,
                      _meta: {
                        title: "Series 50 four-car",
                      },
                      units: [
                        {
                          position: 1,
                          reversed: false,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 16000,
                                  _meta: {
                                    title: "Series 50 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-50-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 15000,
                                  _meta: {
                                    title: "Series 50 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-50-trailer",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-50",
                          },
                        },
                        {
                          position: 2,
                          reversed: true,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 16000,
                                  _meta: {
                                    title: "Series 50 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-50-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 15000,
                                  _meta: {
                                    title: "Series 50 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-50-trailer",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-50",
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "RollingStock",
                  __isNode: "RollingStock",
                  uri: "https://metro.example/onto#series-70",
                  _meta: {
                    title: "Series 70",
                    curie: "metro:series-70",
                    definition: null,
                    type: {
                      _meta: {
                        title: "Rolling stock",
                      },
                      uri: "https://metro.example/onto#RollingStock",
                    },
                  },
                  formations: [
                    {
                      uri: "https://metro.example/onto#series-70-fixed",
                      length: 107200,
                      capacity: 880,
                      _meta: {
                        title: "Series 70 fixed formation",
                      },
                      units: [
                        {
                          position: 1,
                          reversed: false,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 18400,
                                  _meta: {
                                    title: "Series 70 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-70-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "M",
                                  hasCab: false,
                                  length: 17600,
                                  _meta: {
                                    title: "Series 70 motor car",
                                  },
                                  uri: "https://metro.example/onto#car-70-motor",
                                },
                              },
                              {
                                position: 3,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 17600,
                                  _meta: {
                                    title: "Series 70 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-70-trailer",
                                },
                              },
                              {
                                position: 4,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 17600,
                                  _meta: {
                                    title: "Series 70 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-70-trailer",
                                },
                              },
                              {
                                position: 5,
                                reversed: false,
                                carType: {
                                  code: "M",
                                  hasCab: false,
                                  length: 17600,
                                  _meta: {
                                    title: "Series 70 motor car",
                                  },
                                  uri: "https://metro.example/onto#car-70-motor",
                                },
                              },
                              {
                                position: 6,
                                reversed: true,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 18400,
                                  _meta: {
                                    title: "Series 70 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-70-driving",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-70",
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                node: {
                  __typename: "RollingStock",
                  __isNode: "RollingStock",
                  uri: "https://metro.example/onto#series-90",
                  _meta: {
                    title: "Series 90",
                    curie: "metro:series-90",
                    definition: null,
                    type: {
                      _meta: {
                        title: "Rolling stock",
                      },
                      uri: "https://metro.example/onto#RollingStock",
                    },
                  },
                  formations: [
                    {
                      uri: "https://metro.example/onto#series-90-three-car",
                      length: 60000,
                      capacity: 490,
                      _meta: {
                        title: "Series 90 three-car",
                      },
                      units: [
                        {
                          position: 1,
                          reversed: false,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-90-trailer",
                                },
                              },
                              {
                                position: 3,
                                reversed: true,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-90",
                          },
                        },
                      ],
                    },
                    {
                      uri: "https://metro.example/onto#series-90-six-car",
                      length: 120000,
                      capacity: 980,
                      _meta: {
                        title: "Series 90 six-car",
                      },
                      units: [
                        {
                          position: 1,
                          reversed: false,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-90-trailer",
                                },
                              },
                              {
                                position: 3,
                                reversed: true,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-90",
                          },
                        },
                        {
                          position: 2,
                          reversed: false,
                          unit: {
                            cars: [
                              {
                                position: 1,
                                reversed: false,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                              {
                                position: 2,
                                reversed: false,
                                carType: {
                                  code: "T",
                                  hasCab: false,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 trailer car",
                                  },
                                  uri: "https://metro.example/onto#car-90-trailer",
                                },
                              },
                              {
                                position: 3,
                                reversed: true,
                                carType: {
                                  code: "DM",
                                  hasCab: true,
                                  length: 20000,
                                  _meta: {
                                    title: "Series 90 driving motor car",
                                  },
                                  uri: "https://metro.example/onto#car-90-driving",
                                },
                              },
                            ],
                            uri: "https://metro.example/onto#unit-90",
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          uri: "https://metro.example/onto#RollingStock",
        },
      },
    },
  },
  {
    operation: "StockPageQuery",
    variables: {
      id: "https://metro.example/onto#series-90",
    },
    response: {
      data: {
        node: {
          __typename: "RollingStock",
          _meta: {
            title: "Series 90",
          },
          formations: [
            {
              uri: "https://metro.example/onto#series-90-three-car",
              length: 60000,
              capacity: 490,
              __isNode: "Formation",
              __typename: "Formation",
              _meta: {
                title: "Series 90 three-car",
                curie: "metro:series-90-three-car",
              },
              units: [
                {
                  unit: {
                    cars: [
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 1,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-trailer",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 trailer car",
                            curie: "metro:car-90-trailer",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "T",
                          hasCab: false,
                        },
                        position: 2,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 3,
                        reversed: true,
                      },
                    ],
                    uri: "https://metro.example/onto#unit-90",
                  },
                  position: 1,
                  reversed: false,
                },
              ],
            },
            {
              uri: "https://metro.example/onto#series-90-six-car",
              length: 120000,
              capacity: 980,
              __isNode: "Formation",
              __typename: "Formation",
              _meta: {
                title: "Series 90 six-car",
                curie: "metro:series-90-six-car",
              },
              units: [
                {
                  unit: {
                    cars: [
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 1,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-trailer",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 trailer car",
                            curie: "metro:car-90-trailer",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "T",
                          hasCab: false,
                        },
                        position: 2,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 3,
                        reversed: true,
                      },
                    ],
                    uri: "https://metro.example/onto#unit-90",
                  },
                  position: 1,
                  reversed: false,
                },
                {
                  unit: {
                    cars: [
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 1,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-trailer",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 trailer car",
                            curie: "metro:car-90-trailer",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "T",
                          hasCab: false,
                        },
                        position: 2,
                        reversed: false,
                      },
                      {
                        carType: {
                          uri: "https://metro.example/onto#car-90-driving",
                          __isNode: "CarType",
                          __typename: "CarType",
                          _meta: {
                            title: "Series 90 driving motor car",
                            curie: "metro:car-90-driving",
                            type: {
                              _meta: {
                                title: "Car type",
                              },
                              uri: "https://metro.example/onto#CarType",
                            },
                          },
                          length: 20000,
                          code: "DM",
                          hasCab: true,
                        },
                        position: 3,
                        reversed: true,
                      },
                    ],
                    uri: "https://metro.example/onto#unit-90",
                  },
                  position: 2,
                  reversed: false,
                },
              ],
            },
          ],
          uri: "https://metro.example/onto#series-90",
        },
      },
    },
  },
  {
    operation: "FormationPageQuery",
    variables: {
      id: "https://metro.example/onto#series-90-six-car",
    },
    response: {
      data: {
        node: {
          __typename: "Formation",
          length: 120000,
          capacity: 980,
          _meta: {
            title: "Series 90 six-car",
          },
          stock: {
            _meta: {
              title: "Series 90",
              curie: "metro:series-90",
            },
            __isNode: "RollingStock",
            __typename: "RollingStock",
            uri: "https://metro.example/onto#series-90",
          },
          units: [
            {
              position: 1,
              reversed: false,
              unit: {
                length: 60000,
                __isNode: "Unit",
                __typename: "Unit",
                _meta: {
                  title: "Series 90 unit",
                  curie: "metro:unit-90",
                },
                uri: "https://metro.example/onto#unit-90",
                cars: [
                  {
                    position: 1,
                    reversed: false,
                    carType: {
                      code: "DM",
                      hasCab: true,
                      length: 20000,
                      _meta: {
                        title: "Series 90 driving motor car",
                      },
                      uri: "https://metro.example/onto#car-90-driving",
                    },
                  },
                  {
                    position: 2,
                    reversed: false,
                    carType: {
                      code: "T",
                      hasCab: false,
                      length: 20000,
                      _meta: {
                        title: "Series 90 trailer car",
                      },
                      uri: "https://metro.example/onto#car-90-trailer",
                    },
                  },
                  {
                    position: 3,
                    reversed: true,
                    carType: {
                      code: "DM",
                      hasCab: true,
                      length: 20000,
                      _meta: {
                        title: "Series 90 driving motor car",
                      },
                      uri: "https://metro.example/onto#car-90-driving",
                    },
                  },
                ],
              },
            },
            {
              position: 2,
              reversed: false,
              unit: {
                length: 60000,
                __isNode: "Unit",
                __typename: "Unit",
                _meta: {
                  title: "Series 90 unit",
                  curie: "metro:unit-90",
                },
                uri: "https://metro.example/onto#unit-90",
                cars: [
                  {
                    position: 1,
                    reversed: false,
                    carType: {
                      code: "DM",
                      hasCab: true,
                      length: 20000,
                      _meta: {
                        title: "Series 90 driving motor car",
                      },
                      uri: "https://metro.example/onto#car-90-driving",
                    },
                  },
                  {
                    position: 2,
                    reversed: false,
                    carType: {
                      code: "T",
                      hasCab: false,
                      length: 20000,
                      _meta: {
                        title: "Series 90 trailer car",
                      },
                      uri: "https://metro.example/onto#car-90-trailer",
                    },
                  },
                  {
                    position: 3,
                    reversed: true,
                    carType: {
                      code: "DM",
                      hasCab: true,
                      length: 20000,
                      _meta: {
                        title: "Series 90 driving motor car",
                      },
                      uri: "https://metro.example/onto#car-90-driving",
                    },
                  },
                ],
              },
            },
          ],
          lines: [
            {
              code: "3",
              __isNode: "Line",
              __typename: "Line",
              _meta: {
                title: "Coastal Line",
                curie: "metro:coastal-line",
              },
              uri: "https://metro.example/onto#coastal-line",
              servedBy: [
                {
                  __typename: "Interchange",
                  platformLength: 160000,
                  _meta: {
                    title: "Central Exchange",
                  },
                  uri: "https://metro.example/onto#central-exchange",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Eastcliff",
                  },
                  uri: "https://metro.example/onto#eastcliff",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Greenhithe",
                  },
                  uri: "https://metro.example/onto#greenhithe",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Harbourside",
                  },
                  uri: "https://metro.example/onto#harbourside",
                },
                {
                  __typename: "Interchange",
                  platformLength: 125000,
                  _meta: {
                    title: "Riverside Junction",
                  },
                  uri: "https://metro.example/onto#riverside-junction",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Saltford",
                  },
                  uri: "https://metro.example/onto#saltford",
                },
              ],
            },
            {
              code: "1",
              __isNode: "Line",
              __typename: "Line",
              _meta: {
                title: "North Line",
                curie: "metro:north-line",
              },
              uri: "https://metro.example/onto#north-line",
              servedBy: [
                {
                  __typename: "Interchange",
                  platformLength: 160000,
                  _meta: {
                    title: "Central Exchange",
                  },
                  uri: "https://metro.example/onto#central-exchange",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Foundry Row",
                  },
                  uri: "https://metro.example/onto#foundry-row",
                },
                {
                  __typename: "Station",
                  platformLength: 100000,
                  _meta: {
                    title: "Marsh End",
                  },
                  uri: "https://metro.example/onto#marsh-end",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Northgate",
                  },
                  uri: "https://metro.example/onto#northgate",
                },
                {
                  __typename: "Station",
                  platformLength: 125000,
                  _meta: {
                    title: "Verge Park",
                  },
                  uri: "https://metro.example/onto#verge-park",
                },
              ],
            },
          ],
          uri: "https://metro.example/onto#series-90-six-car",
        },
      },
    },
  },
  {
    operation: "UnitPageQuery",
    variables: {
      id: "https://metro.example/onto#unit-90",
    },
    response: {
      data: {
        node: {
          __typename: "Unit",
          length: 60000,
          capacity: 490,
          _meta: {
            title: "Series 90 unit",
            curie: "metro:unit-90",
          },
          cars: [
            {
              position: 1,
              reversed: false,
              carType: {
                code: "DM",
                hasCab: true,
                length: 20000,
                _meta: {
                  title: "Series 90 driving motor car",
                },
                uri: "https://metro.example/onto#car-90-driving",
              },
            },
            {
              position: 2,
              reversed: false,
              carType: {
                code: "T",
                hasCab: false,
                length: 20000,
                _meta: {
                  title: "Series 90 trailer car",
                },
                uri: "https://metro.example/onto#car-90-trailer",
              },
            },
            {
              position: 3,
              reversed: true,
              carType: {
                code: "DM",
                hasCab: true,
                length: 20000,
                _meta: {
                  title: "Series 90 driving motor car",
                },
                uri: "https://metro.example/onto#car-90-driving",
              },
            },
          ],
          uri: "https://metro.example/onto#unit-90",
        },
      },
    },
  },
  {
    operation: "CarTypePageQuery",
    variables: {
      id: "https://metro.example/onto#car-90-driving",
    },
    response: {
      data: {
        node: {
          __typename: "CarType",
          code: "DM",
          hasCab: true,
          length: 20000,
          capacity: 160,
          _meta: {
            title: "Series 90 driving motor car",
            curie: "metro:car-90-driving",
          },
          uri: "https://metro.example/onto#car-90-driving",
        },
      },
    },
  },
];
