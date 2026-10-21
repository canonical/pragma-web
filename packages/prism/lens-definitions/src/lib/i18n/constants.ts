/**
 * The lens's English catalog: every string a reader sees, by message key. A
 * value may hold `{name}` placeholders the translator fills, or be a plural
 * record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads. A sentence that wraps
 * an element is still one message: the element's `{name}` placeholder marks
 * where it goes, and `Message` renders the element there, so a translation
 * may reorder the sentence around it.
 */
export const MESSAGES = {
  "lens.label": "Definitions",
  "page.title.term": "{term} — Definitions",
  "page.error":
    "The graph query failed. Is the dev backend up? Reload to retry.",
  "page.loading": "Loading the ontologies…",
  "explorer.search.label": "Filter terms",
  "explorer.search.placeholder": "Search terms…",
  "controls.abstraction.label": "Filter by abstraction",
  "controls.abstraction.abstract.label": "Abstract",
  "controls.abstraction.abstract.hint":
    "Classes that are never instantiated directly",
  "controls.abstraction.concrete.label": "Concrete",
  "controls.abstraction.concrete.hint": "Classes with instances of their own",
  "controls.ontology.label": "Filter by ontology",
  "controls.ontology.hint": "Terms from the {label} ontology",
  "status.classes": {
    one: "{visible} of {count} class",
    other: "{visible} of {count} classes",
  },
  "status.classes.abstract": {
    one: "{visible} of {count} class · {abstract} abstract",
    other: "{visible} of {count} classes · {abstract} abstract",
  },
  "legend.label": "Graph legend",
  "legend.abstract": "abstract class — not instantiated directly",
  "legend.concrete": "concrete class",
  "legend.superclass": "points to its superclass",
  "legend.relation": "relation — hover a class to see its named arcs",
  "well.label": "Class hierarchy",
  "well.abstract": "abstract",
  "well.hint": "Drag to pan · scroll to zoom · select a class to inspect it",
  "rail.label": "Ontology terms",
  "rail.classes": "Classes",
  "rail.properties": "Properties",
  "rail.count": "{matches} of {total}",
  "rail.abstract": "abstract",
  "inspector.label": "Term inspector",
  "inspector.empty":
    "Select a term — from the rail or the hierarchy — to inspect its definition, relations, and instances.",
  "inspector.unknown":
    "No term at {term}. The rail lists every term the ontologies carry.",
  "inspector.definition.none": "No definition recorded.",
  "inspector.class.address": "{term} · class in {namespace}",
  "inspector.class.address.abstract":
    "{term} · class in {namespace} · abstract",
  "inspector.property.address": "{term} · property in {namespace}",
  "inspector.lineage": "Lineage",
  "inspector.lineage.root": "A root of its ontology.",
  "inspector.subclasses": "Subclasses",
  "inspector.subclasses.none": "None.",
  "inspector.properties": "Properties",
  "inspector.properties.none": "None declared on this class.",
  "inspector.inherited": "Inherited",
  "inspector.table.property": "Property",
  "inspector.table.range": "Range",
  "inspector.table.kind": "Kind",
  "inspector.table.notes": "Notes",
  "inspector.notes.required": "required",
  "inspector.notes.singular": "singular",
  "inspector.notes.separator": " · ",
  "inspector.instances": "Instances",
  "inspector.instances.unrecorded": "No named instances ({count} recorded).",
  "inspector.instances.unnamed":
    "No named instances ({count} recorded — blank-node instances are embeddable, not standalone).",
  "inspector.instances.more": {
    one: "…and more — {count} named instance in the graph.",
    other: "…and more — {count} named instances in the graph.",
  },
  "inspector.property.kind": "Kind",
  "inspector.property.functional": "Functional",
  "inspector.property.range": "Range",
  "inspector.property.domain": "Domain",
  "inspector.property.inverse": "Inverse",
  "inspector.yes": "yes",
  "inspector.no": "no",
  "inspector.domain.unstated": "unstated",
  "inspector.inverse.none": "none",
} as const;
