/**
 * The class graph's input as the example metro provider serves it: 16
 * classes in three namespaces (metro, geo and rdfs) and their object
 * properties. The layout's measurements of a short, wide graph are pinned
 * against it.
 *
 * Regenerate: run the Definitions page's ontology selection against
 * `createExampleProvider()` from `@canonical/prism-graph-example` and keep
 * each class's IRI, label, prefix, abstractness, superclass, instance count
 * and field count, and each object property's IRI, label, domain and range.
 */

import type { ClassGraphInput } from "../../src/lib/classGraph/types.js";

const metroGraph: ClassGraphInput = {
  classes: [
    {
      uri: "https://metro.example/onto#Stop",
      label: "Stop",
      prefix: "metro",
      abstract: true,
      superclass: null,
      instanceCount: 27,
      fields: 1,
    },
    {
      uri: "https://metro.example/onto#Station",
      label: "Station",
      prefix: "metro",
      abstract: false,
      superclass: "https://metro.example/onto#Stop",
      instanceCount: 27,
      fields: 3,
    },
    {
      uri: "https://metro.example/onto#Interchange",
      label: "Interchange",
      prefix: "metro",
      abstract: false,
      superclass: "https://metro.example/onto#Station",
      instanceCount: 4,
      fields: 4,
    },
    {
      uri: "https://metro.example/onto#Line",
      label: "Line",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 7,
      fields: 3,
    },
    {
      uri: "https://metro.example/onto#Route",
      label: "Route",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 1,
    },
    {
      uri: "https://metro.example/onto#Call",
      label: "Call",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 1,
    },
    {
      uri: "https://metro.example/onto#DiagramPoint",
      label: "Diagram point",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 2,
    },
    {
      uri: "https://metro.example/onto#RollingStock",
      label: "Rolling stock",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 3,
      fields: 1,
    },
    {
      uri: "https://metro.example/onto#Formation",
      label: "Formation",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 4,
      fields: 3,
    },
    {
      uri: "https://metro.example/onto#Unit",
      label: "Unit",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 3,
      fields: 3,
    },
    {
      uri: "https://metro.example/onto#CarType",
      label: "Car type",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 7,
      fields: 5,
    },
    {
      uri: "https://metro.example/onto#UnitPosition",
      label: "Unit position",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 2,
    },
    {
      uri: "https://metro.example/onto#CarPosition",
      label: "Car position",
      prefix: "metro",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 2,
    },
    {
      uri: "https://geo.example/onto#GeoPoint",
      label: "Geo point",
      prefix: "geo",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 2,
    },
    {
      uri: "https://geo.example/onto#Zone",
      label: "Fare zone",
      prefix: "geo",
      abstract: false,
      superclass: null,
      instanceCount: 2,
      fields: 1,
    },
    {
      uri: "http://www.w3.org/2000/01/rdf-schema#Class",
      label: "Class",
      prefix: "rdfs",
      abstract: false,
      superclass: null,
      instanceCount: 0,
      fields: 0,
    },
  ],
  relations: [
    {
      uri: "https://metro.example/onto#servesLine",
      label: "serves line",
      domain: "https://metro.example/onto#Station",
      range: "https://metro.example/onto#Line",
    },
    {
      uri: "https://metro.example/onto#servedBy",
      label: "served by",
      domain: "https://metro.example/onto#Line",
      range: "https://metro.example/onto#Station",
    },
    {
      uri: "https://metro.example/onto#routes",
      label: "routes",
      domain: "https://metro.example/onto#Line",
      range: "https://metro.example/onto#Route",
    },
    {
      uri: "https://metro.example/onto#calls",
      label: "calls",
      domain: "https://metro.example/onto#Route",
      range: "https://metro.example/onto#Call",
    },
    {
      uri: "https://metro.example/onto#reverse",
      label: "reverse",
      domain: "https://metro.example/onto#Route",
      range: "https://metro.example/onto#Route",
    },
    {
      uri: "https://metro.example/onto#stop",
      label: "stop",
      domain: "https://metro.example/onto#Call",
      range: "https://metro.example/onto#Stop",
    },
    {
      uri: "https://metro.example/onto#diagramPosition",
      label: "diagram position",
      domain: "https://metro.example/onto#Station",
      range: "https://metro.example/onto#DiagramPoint",
    },
    {
      uri: "https://metro.example/onto#formations",
      label: "formations",
      domain: null,
      range: "https://metro.example/onto#Formation",
    },
    {
      uri: "https://metro.example/onto#stock",
      label: "stock",
      domain: "https://metro.example/onto#Formation",
      range: "https://metro.example/onto#RollingStock",
    },
    {
      uri: "https://metro.example/onto#units",
      label: "units",
      domain: "https://metro.example/onto#Formation",
      range: "https://metro.example/onto#UnitPosition",
    },
    {
      uri: "https://metro.example/onto#lines",
      label: "lines",
      domain: "https://metro.example/onto#Formation",
      range: "https://metro.example/onto#Line",
    },
    {
      uri: "https://metro.example/onto#unit",
      label: "unit",
      domain: "https://metro.example/onto#UnitPosition",
      range: "https://metro.example/onto#Unit",
    },
    {
      uri: "https://metro.example/onto#cars",
      label: "cars",
      domain: "https://metro.example/onto#Unit",
      range: "https://metro.example/onto#CarPosition",
    },
    {
      uri: "https://metro.example/onto#carType",
      label: "car type",
      domain: "https://metro.example/onto#CarPosition",
      range: "https://metro.example/onto#CarType",
    },
    {
      uri: "https://geo.example/onto#location",
      label: "location",
      domain: "https://metro.example/onto#Station",
      range: "https://geo.example/onto#GeoPoint",
    },
    {
      uri: "https://geo.example/onto#inZone",
      label: "in zone",
      domain: "https://metro.example/onto#Station",
      range: "https://geo.example/onto#Zone",
    },
  ],
};

export default metroGraph;
