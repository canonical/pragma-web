/**
 * The class edges the pragma provider serves at 0.43.0 whose property lies
 * in the design-system, code-standards or anatomy-dsl ontologies: 55 edges,
 * sorted by property, subject class and object class, each with the
 * instance statements it covers and whether the property's domain and
 * range declare it. A declared edge may end at a class outside those
 * namespaces (`dt:TokenSymbol`, `rdf:List`).
 *
 * Regenerate: query `classEdges { property subjectClass objectClass count
 * declared }` through `createPragmaProvider()`'s handler, over the
 * installed ref packages, and keep the edges whose property's IRI starts
 * with the `ds`, `cs` or `anatomy` namespace: the captures predate the
 * demand model's `surface` package.
 */

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import type { ClassEdgeInput } from "../../src/lib/classGraph/types.js";

const classEdges: readonly ClassEdgeInput[] = [
  {
    property: "http://pragma.canonical.com/codestandards#do",
    subjectClass: "http://pragma.canonical.com/codestandards#CodeStandard",
    objectClass: "http://pragma.canonical.com/codestandards#Example",
    count: 0,
    declared: true,
  },
  {
    property: "http://pragma.canonical.com/codestandards#dont",
    subjectClass: "http://pragma.canonical.com/codestandards#CodeStandard",
    objectClass: "http://pragma.canonical.com/codestandards#Example",
    count: 0,
    declared: true,
  },
  {
    property: "http://pragma.canonical.com/codestandards#extends",
    subjectClass: "http://pragma.canonical.com/codestandards#CodeStandard",
    objectClass: "http://pragma.canonical.com/codestandards#CodeStandard",
    count: 7,
    declared: true,
  },
  {
    property: "http://pragma.canonical.com/codestandards#hasCategory",
    subjectClass: "http://pragma.canonical.com/codestandards#CodeStandard",
    objectClass: "http://pragma.canonical.com/codestandards#Category",
    count: 147,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/caseNode",
    subjectClass: "https://anatomy.canonical.com/SwitchCase",
    objectClass: "https://anatomy.canonical.com/Node",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/consumes",
    subjectClass: "https://anatomy.canonical.com/Style",
    objectClass: "http://www.w3.org/1999/02/22-rdf-syntax-ns#List",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/edgeSwitch",
    subjectClass: "https://anatomy.canonical.com/Edge",
    objectClass: "https://anatomy.canonical.com/Switch",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/edgeTarget",
    subjectClass: "https://anatomy.canonical.com/Edge",
    objectClass: "https://anatomy.canonical.com/Node",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/hasCase",
    subjectClass: "https://anatomy.canonical.com/Switch",
    objectClass: "https://anatomy.canonical.com/SwitchCase",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/hasEdge",
    subjectClass: "https://anatomy.canonical.com/Node",
    objectClass: "https://anatomy.canonical.com/Edge",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/hasProp",
    subjectClass: "https://anatomy.canonical.com/NamedNode",
    objectClass: "https://anatomy.canonical.com/Prop",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/hasRelation",
    subjectClass: "https://anatomy.canonical.com/Edge",
    objectClass: "https://anatomy.canonical.com/Relation",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/hasStyle",
    subjectClass: "https://anatomy.canonical.com/Node",
    objectClass: "https://anatomy.canonical.com/Style",
    count: 0,
    declared: true,
  },
  {
    property: "https://anatomy.canonical.com/rootNode",
    subjectClass: "https://anatomy.canonical.com/Specification",
    objectClass: "https://anatomy.canonical.com/NamedNode",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/category",
    subjectClass: "https://ds.canonical.com/Tag",
    objectClass: "https://ds.canonical.com/TagCategory",
    count: 43,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/changeLog",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/ChangeLogEntry",
    count: 42,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/changeLog",
    subjectClass: "https://ds.canonical.com/View",
    objectClass: "https://ds.canonical.com/ChangeLogEntry",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/conceptType",
    subjectClass: "https://ds.canonical.com/Concept",
    objectClass: "https://ds.canonical.com/ConceptType",
    count: 13,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/consumesSymbol",
    subjectClass: "https://ds.canonical.com/TokenBinding",
    objectClass: "https://dt.canonical.com/TokenSymbol",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/documentationStage",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/Tag",
    count: 218,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/documentationStage",
    subjectClass: "https://ds.canonical.com/Variant",
    objectClass: "https://ds.canonical.com/Tag",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/documentationStage",
    subjectClass: "https://ds.canonical.com/View",
    objectClass: "https://ds.canonical.com/Tag",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasModifier",
    subjectClass: "https://ds.canonical.com/ModifierFamily",
    objectClass: "https://ds.canonical.com/Modifier",
    count: 33,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/hasModifierFamily",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/ModifierFamily",
    count: 7,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/hasProperty",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/Property",
    count: 726,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/hasProperty",
    subjectClass: "https://ds.canonical.com/View",
    objectClass: "https://ds.canonical.com/Property",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasSubcomponent",
    subjectClass: "https://ds.canonical.com/Component",
    objectClass: "https://ds.canonical.com/Component",
    count: 4,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasSubcomponent",
    subjectClass: "https://ds.canonical.com/Component",
    objectClass: "https://ds.canonical.com/Subcomponent",
    count: 28,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/hasSubcomponent",
    subjectClass: "https://ds.canonical.com/Pattern",
    objectClass: "https://ds.canonical.com/Subcomponent",
    count: 20,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasSubcomponent",
    subjectClass: "https://ds.canonical.com/Subcomponent",
    objectClass: "https://ds.canonical.com/Subcomponent",
    count: 8,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasSubcomponent",
    subjectClass: "https://ds.canonical.com/Variant",
    objectClass: "https://ds.canonical.com/Variant",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasTokenBinding",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/TokenBinding",
    count: 1010,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/hasVariant",
    subjectClass: "https://ds.canonical.com/Component",
    objectClass: "https://ds.canonical.com/Variant",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/hasVariant",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/implementsBlock",
    subjectClass: "https://ds.canonical.com/ImplementationObject",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/inheritsFrom",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 3,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/library",
    subjectClass: "https://ds.canonical.com/ImplementationObject",
    objectClass: "https://ds.canonical.com/ImplementationLibrary",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/libraryTier",
    subjectClass: "https://ds.canonical.com/ImplementationLibrary",
    objectClass: "https://ds.canonical.com/Tier",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/modifierFamily",
    subjectClass: "https://ds.canonical.com/Modifier",
    objectClass: "https://ds.canonical.com/ModifierFamily",
    count: 33,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/parentComponent",
    subjectClass: "https://ds.canonical.com/Component",
    objectClass: "https://ds.canonical.com/Component",
    count: 4,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/parentComponent",
    subjectClass: "https://ds.canonical.com/Subcomponent",
    objectClass: "https://ds.canonical.com/Component",
    count: 28,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/parentComponent",
    subjectClass: "https://ds.canonical.com/Subcomponent",
    objectClass: "https://ds.canonical.com/Pattern",
    count: 20,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/parentComponent",
    subjectClass: "https://ds.canonical.com/Subcomponent",
    objectClass: "https://ds.canonical.com/Subcomponent",
    count: 8,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/parentComponent",
    subjectClass: "https://ds.canonical.com/Variant",
    objectClass: "https://ds.canonical.com/Variant",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/specializedBy",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 3,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/Concept",
    objectClass: "https://ds.canonical.com/Tier",
    count: 13,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/Layout",
    objectClass: "http://www.w3.org/2002/07/owl#DatatypeProperty",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/ModifierFamily",
    objectClass: "https://ds.canonical.com/Tier",
    count: 11,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/Pattern",
    objectClass: "http://www.w3.org/2002/07/owl#DatatypeProperty",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/Tier",
    count: 320,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/Variant",
    objectClass: "https://ds.canonical.com/Tier",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/tier",
    subjectClass: "https://ds.canonical.com/View",
    objectClass: "https://ds.canonical.com/Tier",
    count: 2,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/variantOf",
    subjectClass: "https://ds.canonical.com/UIBlock",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 0,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/variantOf",
    subjectClass: "https://ds.canonical.com/Variant",
    objectClass: "https://ds.canonical.com/Component",
    count: 1,
    declared: false,
  },
  {
    property: "https://ds.canonical.com/viaBlock",
    subjectClass: "https://ds.canonical.com/TokenBinding",
    objectClass: "https://ds.canonical.com/UIBlock",
    count: 1010,
    declared: true,
  },
];

/** The id a serialised store gives the edge at `index` of the root's list. */
const recordIdOf = (index: number): string => `client:root:classEdges:${index}`;

/** The root's `classEdges` field as a serialised store holds it. */
export const CLASS_EDGES_ROOT_FIELD = {
  __refs: classEdges.map((_, index) => recordIdOf(index)),
};

/** The edges' records as a serialised store holds them, by id. */
export const CLASS_EDGE_RECORDS: RecordMap = Object.fromEntries(
  classEdges.map((edge, index) => [
    recordIdOf(index),
    { __id: recordIdOf(index), __typename: "ClassEdge", ...edge },
  ]),
);

export default classEdges;
