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
  "controls.instances.label": "Filter by instances",
  "controls.instances.with.label": "With instances",
  "controls.instances.with.hint": "Dim the classes that have no instances",
  "status.classes": {
    one: "{visible} of {count} class",
    other: "{visible} of {count} classes",
  },
  "status.classes.abstract": {
    one: "{visible} of {count} class · {abstract} abstract",
    other: "{visible} of {count} classes · {abstract} abstract",
  },
  "well.label": "Class graph",
  "well.name":
    "Class {label}, in {namespace}, {subclasses} subclasses, {relations} relations, {instances} instances, {fields} fields",
  "well.name.abstract":
    "Class {label}, abstract, in {namespace}, {subclasses} subclasses, {relations} relations, {instances} instances, {fields} fields",
  "well.region.count": {
    one: "{count} class",
    other: "{count} classes",
  },
  "well.relations.count": "{count} relations",
  "well.phone.label": "Class graph, in rail order",
  "rail.label": "Ontology terms",
  "rail.classes": "Classes",
  "rail.properties": "Properties",
  "rail.count": "{matches} of {total}",
  "rail.abstract": "abstract",
  "kind.object": "object",
  "kind.datatype": "datatype",
  "kind.annotation": "annotation",
  "inspector.label": "Term inspector",
  "inspector.overview.legend": "Reading the graph",
  "inspector.overview.namespaces": "Namespaces",
  "inspector.overview.gestures": "Gestures",
  "inspector.overview.gestures.text":
    "Drag to pan · scroll or pinch to zoom · select a class to inspect it · arrows move along the tree",
  "inspector.overview.namespace":
    "{classes} classes · {instances} instances · {relations} relations",
  "inspector.overview.fit": "Fit the graph to {prefix}",
  "legend.concrete": "A concrete class with its instance count",
  "legend.abstract":
    "An abstract class: a hollow box and an italic label, never a count",
  "legend.hub": "A hub: four or more edges, a taller box and a larger label",
  "legend.subclass":
    "Subclasses: one bus, with a hollow arrowhead at the superclass",
  "legend.relation": "A relation, its arrowhead at the range",
  "legend.bundle":
    "Every relation between two classes as one path, a head at each range",
  "legend.loop": "Relations from a class to itself, as one loop",
  "legend.specimen.concrete": "Concrete class",
  "legend.specimen.abstract": "Abstract class",
  "legend.specimen.hub": "Hub",
  "legend.specimen.superclass": "Superclass",
  "legend.specimen.subclass": "Subclass",
  "legend.specimen.domain": "Domain",
  "legend.specimen.range": "Range",
  "legend.specimen.predicate": "predicate",
  "legend.specimen.family": "Class A",
  "legend.specimen.member": "Class B",
  "legend.specimen.has": "toB",
  "legend.specimen.of": "toA",
  "legend.specimen.standard": "Class C",
  "legend.specimen.extends": "toItself",
  "inspector.unknown":
    "No term at {term}. The rail lists every term the ontologies carry.",
  "inspector.tag.class": "class",
  "inspector.tag.property": "property",
  "inspector.tag.abstract": "abstract",
  "inspector.definition": "Definition",
  "inspector.definition.none": "No definition recorded.",
  "inspector.address": "{term} in {namespace}",
  "inspector.lineage": "Lineage",
  "inspector.lineage.root": "A root of its ontology.",
  "inspector.subclasses": "Subclasses",
  "inspector.subclasses.none": "None.",
  "inspector.fields": "Fields ({count})",
  "inspector.fields.none": "No fields.",
  "inspector.fields.inherited": "Inherited from {class}",
  "inspector.relations": "Relations ({count})",
  "inspector.relations.none": "No relations.",
  "inspector.relations.outgoing": "Outgoing",
  "inspector.relations.incoming": "Incoming",
  "inspector.relations.inherited": "Inherited from {class}",
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
