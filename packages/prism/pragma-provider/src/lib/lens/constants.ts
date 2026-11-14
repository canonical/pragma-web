/**
 * The lens domain's fixed values: the site lens the provider serves until
 * ke-graphql reads the type lens from the ontologies, the SDL of the lens
 * fields it adds to the compiled schema, and the queries the TBox outline is
 * read with.
 */

import type { SiteLens } from "@canonical/prism-contract";

const DS = "https://ds.canonical.com/";
const CS = "http://pragma.canonical.com/codestandards#";
const ANATOMY = "https://anatomy.canonical.com/";
const SURFACE = "sem://surface#";

/**
 * The site's type lens. The design-system, code-standards and anatomy-dsl
 * entries are the lens those ontologies declare in Turtle from the release
 * of ke-graphql that reads it, transcribed word for word; the surface
 * entries are this site's own. Surface classes whose instances are pure
 * enumerations other classes point at (verdicts, fluencies, regions,
 * authority families and the dimension classes) are hidden.
 */
export const SITE_LENS: SiteLens = {
  groups: [
    { uri: `${CS}section.examples`, labels: { en: "Examples" }, order: 2 },
    { uri: `${CS}section.overview`, labels: { en: "Overview" }, order: 1 },
    { uri: `${CS}section.relations`, labels: { en: "Relations" }, order: 3 },
    { uri: `${DS}section.anatomy`, labels: { en: "Anatomy" }, order: 4 },
    { uri: `${DS}section.api`, labels: { en: "API" }, order: 5 },
    { uri: `${DS}section.content`, labels: { en: "Content" }, order: 2 },
    { uri: `${DS}section.history`, labels: { en: "History" }, order: 7 },
    { uri: `${DS}section.overview`, labels: { en: "Overview" }, order: 1 },
    { uri: `${DS}section.relations`, labels: { en: "Relations" }, order: 6 },
    { uri: `${DS}section.usage`, labels: { en: "Usage" }, order: 3 },
  ],
  classes: [
    {
      uri: `${CS}Category`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Categories" },
    },
    {
      uri: `${CS}CodeStandard`,
      visibility: "PROMINENT",
      glyph: "security",
      pluralLabels: { en: "Code Standards" },
      fields: [
        { property: `${CS}do`, group: `${CS}section.examples`, order: 1 },
        { property: `${CS}dont`, group: `${CS}section.examples`, order: 2 },
        {
          property: `${CS}name`,
          group: `${CS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${CS}description`,
          group: `${CS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${CS}hasCategory`,
          group: `${CS}section.overview`,
          order: 3,
          role: "CLASSIFICATION",
          visibility: "PROMINENT",
        },
        { property: `${CS}extends`, group: `${CS}section.relations`, order: 1 },
      ],
    },
    { uri: `${CS}Example`, pluralLabels: { en: "Examples" } },
    { uri: `${ANATOMY}AnonymousNode`, pluralLabels: { en: "Anonymous Nodes" } },
    { uri: `${ANATOMY}Edge`, pluralLabels: { en: "Edges" } },
    { uri: `${ANATOMY}NamedNode`, pluralLabels: { en: "Named Nodes" } },
    { uri: `${ANATOMY}Node`, pluralLabels: { en: "Nodes" } },
    { uri: `${ANATOMY}Projection`, pluralLabels: { en: "Projections" } },
    { uri: `${ANATOMY}Prop`, pluralLabels: { en: "Props" } },
    { uri: `${ANATOMY}Relation`, pluralLabels: { en: "Relations" } },
    { uri: `${ANATOMY}Specification`, pluralLabels: { en: "Specifications" } },
    { uri: `${ANATOMY}Style`, pluralLabels: { en: "Styles" } },
    {
      uri: `${ANATOMY}StyleKey`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Style Keys" },
    },
    { uri: `${ANATOMY}Switch`, pluralLabels: { en: "Switches" } },
    { uri: `${ANATOMY}SwitchCase`, pluralLabels: { en: "Switch Cases" } },
    { uri: `${DS}ChangeLogEntry`, pluralLabels: { en: "Change Log Entries" } },
    {
      uri: `${DS}Component`,
      visibility: "PROMINENT",
      glyph: "bundle",
      pluralLabels: { en: "Components" },
      fields: [
        {
          property: `${DS}hasSubcomponent`,
          group: `${DS}section.relations`,
          order: 5,
        },
      ],
    },
    {
      uri: `${DS}Concept`,
      glyph: "book",
      pluralLabels: { en: "Concepts" },
      fields: [
        { property: `${DS}content`, group: `${DS}section.content`, order: 1 },
        {
          property: `${DS}knownEdgeCases`,
          group: `${DS}section.content`,
          order: 2,
        },
        {
          property: `${DS}name`,
          group: `${DS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${DS}summary`,
          group: `${DS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${DS}conceptType`,
          group: `${DS}section.overview`,
          order: 3,
          role: "CLASSIFICATION",
        },
      ],
    },
    {
      uri: `${DS}ConceptType`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Concept Types" },
    },
    { uri: `${DS}Entity`, pluralLabels: { en: "Entities" } },
    { uri: `${DS}Group`, glyph: "containers", pluralLabels: { en: "Groups" } },
    {
      uri: `${DS}ImplementationLibrary`,
      glyph: "repository",
      pluralLabels: { en: "Implementation Libraries" },
    },
    {
      uri: `${DS}ImplementationObject`,
      glyph: "file",
      pluralLabels: { en: "Implementation Objects" },
    },
    {
      uri: `${DS}Layout`,
      visibility: "PROMINENT",
      glyph: "layout-grid",
      pluralLabels: { en: "Layouts" },
      fields: [
        { property: `${DS}grid`, group: `${DS}section.anatomy`, order: 4 },
        { property: `${DS}gridAreas`, group: `${DS}section.anatomy`, order: 5 },
        { property: `${DS}domain`, group: `${DS}section.overview`, order: 7 },
        {
          property: `${DS}targetDevices`,
          group: `${DS}section.overview`,
          order: 8,
        },
      ],
    },
    {
      uri: `${DS}Modifier`,
      glyph: "tag",
      pluralLabels: { en: "Modifiers" },
      fields: [
        {
          property: `${DS}name`,
          group: `${DS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${DS}summary`,
          group: `${DS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${DS}modifierFamily`,
          group: `${DS}section.overview`,
          order: 3,
          role: "CLASSIFICATION",
        },
      ],
    },
    {
      uri: `${DS}ModifierFamily`,
      glyph: "switcher",
      pluralLabels: { en: "Modifier Families" },
      fields: [
        {
          property: `${DS}name`,
          group: `${DS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${DS}summary`,
          group: `${DS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${DS}hasModifier`,
          group: `${DS}section.overview`,
          order: 3,
          visibility: "PROMINENT",
        },
      ],
    },
    {
      uri: `${DS}Pattern`,
      visibility: "PROMINENT",
      glyph: "blueprint",
      pluralLabels: { en: "Patterns" },
    },
    { uri: `${DS}Property`, pluralLabels: { en: "Properties" } },
    {
      uri: `${DS}Subcomponent`,
      glyph: "units",
      pluralLabels: { en: "Subcomponents" },
      fields: [
        {
          property: `${DS}standalone`,
          group: `${DS}section.overview`,
          order: 7,
        },
        {
          property: `${DS}parentComponent`,
          group: `${DS}section.relations`,
          order: 0,
          visibility: "PROMINENT",
        },
      ],
    },
    {
      uri: `${DS}Tag`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Tags" },
      fields: [
        {
          property: `${DS}name`,
          group: `${DS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${DS}summary`,
          group: `${DS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${DS}category`,
          group: `${DS}section.overview`,
          order: 3,
          role: "CLASSIFICATION",
        },
        { property: `${DS}whenToApply`, group: `${DS}section.usage`, order: 1 },
        {
          property: `${DS}whenToRemove`,
          group: `${DS}section.usage`,
          order: 2,
        },
      ],
    },
    {
      uri: `${DS}TagCategory`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Tag Categories" },
    },
    { uri: `${DS}Tier`, visibility: "HIDDEN", pluralLabels: { en: "Tiers" } },
    { uri: `${DS}TokenBinding`, pluralLabels: { en: "Token Bindings" } },
    {
      uri: `${DS}UIBlock`,
      pluralLabels: { en: "UI Blocks" },
      fields: [
        {
          property: `${DS}anatomyDsl`,
          group: `${DS}section.anatomy`,
          order: 1,
        },
        {
          property: `${DS}anatomyClassic`,
          group: `${DS}section.anatomy`,
          order: 2,
        },
        {
          property: `${DS}hasTokenBinding`,
          group: `${DS}section.anatomy`,
          order: 3,
        },
        { property: `${DS}hasProperty`, group: `${DS}section.api`, order: 1 },
        {
          property: `${DS}hasModifierFamily`,
          group: `${DS}section.api`,
          order: 2,
        },
        { property: `${DS}changeLog`, group: `${DS}section.history`, order: 1 },
        {
          property: `${DS}decisionLog`,
          group: `${DS}section.history`,
          order: 2,
        },
        {
          property: `${DS}name`,
          group: `${DS}section.overview`,
          order: 1,
          role: "LABEL",
        },
        {
          property: `${DS}summary`,
          group: `${DS}section.overview`,
          order: 2,
          role: "DESCRIPTION",
        },
        {
          property: `${DS}tier`,
          group: `${DS}section.overview`,
          order: 3,
          role: "CLASSIFICATION",
        },
        {
          property: `${DS}documentationStage`,
          group: `${DS}section.overview`,
          order: 4,
        },
        { property: `${DS}version`, group: `${DS}section.overview`, order: 5 },
        {
          property: `${DS}figmaLink`,
          group: `${DS}section.overview`,
          order: 6,
        },
        {
          property: `${DS}inheritsFrom`,
          group: `${DS}section.relations`,
          order: 1,
        },
        {
          property: `${DS}specializedBy`,
          group: `${DS}section.relations`,
          order: 2,
        },
        {
          property: `${DS}variantOf`,
          group: `${DS}section.relations`,
          order: 3,
        },
        {
          property: `${DS}hasVariant`,
          group: `${DS}section.relations`,
          order: 4,
        },
        { property: `${DS}usage`, group: `${DS}section.usage`, order: 1 },
        { property: `${DS}guidelines`, group: `${DS}section.usage`, order: 2 },
      ],
    },
    { uri: `${DS}UIElement`, pluralLabels: { en: "UI Elements" } },
    { uri: `${SURFACE}Actor`, pluralLabels: { en: "Actors" } },
    {
      uri: `${SURFACE}Anchoring`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Anchorings" },
    },
    {
      uri: `${SURFACE}AuthorityFamily`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Authority families" },
    },
    { uri: `${SURFACE}Bet`, pluralLabels: { en: "Bets" } },
    { uri: `${SURFACE}Capability`, pluralLabels: { en: "Capabilities" } },
    {
      uri: `${SURFACE}ComposerSurface`,
      pluralLabels: { en: "Composer surfaces" },
    },
    { uri: `${SURFACE}Coordinate`, pluralLabels: { en: "Coordinates" } },
    { uri: `${SURFACE}Detail`, pluralLabels: { en: "Details" } },
    {
      uri: `${SURFACE}Direction`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Directions" },
    },
    { uri: `${SURFACE}Editor`, pluralLabels: { en: "Editors" } },
    { uri: `${SURFACE}Exemplar`, pluralLabels: { en: "Exemplars" } },
    {
      uri: `${SURFACE}Fluency`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Fluencies" },
    },
    { uri: `${SURFACE}Job`, pluralLabels: { en: "Jobs" } },
    { uri: `${SURFACE}Law`, pluralLabels: { en: "Laws" } },
    { uri: `${SURFACE}Lens`, pluralLabels: { en: "Lenses" } },
    { uri: `${SURFACE}Mechanism`, pluralLabels: { en: "Mechanisms" } },
    { uri: `${SURFACE}Pairing`, pluralLabels: { en: "Pairings" } },
    {
      uri: `${SURFACE}PairingRole`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Pairing roles" },
    },
    { uri: `${SURFACE}Peek`, pluralLabels: { en: "Peeks" } },
    { uri: `${SURFACE}Persona`, pluralLabels: { en: "Personas" } },
    { uri: `${SURFACE}Port`, pluralLabels: { en: "Ports" } },
    {
      uri: `${SURFACE}Preservation`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Preservations" },
    },
    {
      uri: `${SURFACE}Region`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Regions" },
    },
    {
      uri: `${SURFACE}Rendering`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Renderings" },
    },
    { uri: `${SURFACE}Role`, pluralLabels: { en: "Roles" } },
    { uri: `${SURFACE}Slot`, pluralLabels: { en: "Slots" } },
    { uri: `${SURFACE}Substrate`, pluralLabels: { en: "Substrates" } },
    { uri: `${SURFACE}Surface`, pluralLabels: { en: "Surfaces" } },
    {
      uri: `${SURFACE}Validity`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Validities" },
    },
    {
      uri: `${SURFACE}Verdict`,
      visibility: "HIDDEN",
      pluralLabels: { en: "Verdicts" },
    },
    { uri: `${SURFACE}View`, pluralLabels: { en: "Views" } },
  ],
  properties: [
    {
      uri: `${CS}extends`,
      inverseLabels: { en: "Extended by" },
      inversePluralLabels: { en: "Extended by" },
    },
    {
      uri: `${CS}hasCategory`,
      inverseLabels: { en: "Code standard" },
      inversePluralLabels: { en: "Code standards" },
    },
    {
      uri: `${DS}category`,
      inverseLabels: { en: "Tag" },
      inversePluralLabels: { en: "Tags" },
    },
    {
      uri: `${DS}conceptType`,
      inverseLabels: { en: "Concept" },
      inversePluralLabels: { en: "Concepts" },
    },
    {
      uri: `${DS}documentationStage`,
      visibility: "PROMINENT",
      inverseLabels: { en: "Block at this stage" },
      inversePluralLabels: { en: "Blocks at this stage" },
    },
    {
      uri: `${DS}hasModifierFamily`,
      inverseLabels: { en: "Used by" },
      inversePluralLabels: { en: "Used by" },
    },
    {
      uri: `${DS}implementsBlock`,
      inverseLabels: { en: "Implementation" },
      inversePluralLabels: { en: "Implementations" },
    },
    {
      uri: `${DS}library`,
      inverseLabels: { en: "Implementation" },
      inversePluralLabels: { en: "Implementations" },
    },
    {
      uri: `${DS}libraryTier`,
      inverseLabels: { en: "Library" },
      inversePluralLabels: { en: "Libraries" },
    },
    {
      uri: `${DS}tier`,
      visibility: "PROMINENT",
      inverseLabels: { en: "Block" },
      inversePluralLabels: { en: "Blocks" },
    },
    {
      uri: `${DS}viaBlock`,
      inverseLabels: { en: "Bound through it" },
      inversePluralLabels: { en: "Bound through it" },
    },
  ],
};

/**
 * The lens fields and types of the contract, as an extension of a compiled
 * schema that lacks them. The descriptions are the contract's, word for word,
 * so the served SDL carries the contract's text.
 */
export const LENS_SDL = `
"""
How prominently a term is shown: prominent leads, normal is listed, hidden is a value and never an entity (prism:visibility).
"""
enum TermVisibility {
  PROMINENT
  NORMAL
  HIDDEN
}

"""
The role a property's values play for their subject (SHACL UI shui:propertyRole).
"""
enum PropertyRole {
  LABEL
  DESCRIPTION
  DEPICTION
  ICON
  CLASSIFICATION
}

"""
A sh:PropertyGroup: a named, ordered section of a class's properties.
"""
type PropertyGroup {
  """
  The group's IRI.
  """
  uri: ID!

  """
  rdfs:label in \`lang\` (exact tag, else untagged); null when undeclared.
  """
  label(lang: String = "en"): String

  """
  sh:order: the group's position among a class's groups, ascending; null when undeclared.
  """
  order: Float
}

extend type OntologyClass {
  """
  prism:visibility of the class or its nearest declaring ancestor; null when none declares one.
  """
  visibility: TermVisibility

  """
  prism:glyph of the class or its nearest declaring ancestor; null when none declares one.
  """
  glyph: String

  """
  prism:pluralLabel in \`lang\` (exact tag, else untagged); never inherited; null when undeclared.
  """
  pluralLabel(lang: String = "en"): String
}

extend type ClassProperty {
  """
  sh:group of the lens shape targeting this class, else of its nearest ancestor's that declares one; null when none does.
  """
  group: PropertyGroup

  """
  sh:order of the lens shape targeting this class, else of its nearest ancestor's that declares one, ascending; null when none does.
  """
  order: Float

  """
  shui:propertyRole of the lens shape targeting this class, else of its nearest ancestor's that declares one; null when none does.
  """
  role: PropertyRole

  """
  prism:visibility on this class: the lens shape's, else the property's own; null when neither declares one.
  """
  visibility: TermVisibility
}

extend type OntologyProperty {
  """
  prism:visibility of the property; null when undeclared.
  """
  visibility: TermVisibility

  """
  prism:pluralLabel in \`lang\` (exact tag, else untagged); null when undeclared.
  """
  pluralLabel(lang: String = "en"): String

  """
  prism:inverseLabel, else the declared inverse property's asserted rdfs:label; null when neither exists.
  """
  inverseLabel(lang: String = "en"): String

  """
  prism:inversePluralLabel, else the declared inverse property's prism:pluralLabel; null when neither exists.
  """
  inversePluralLabel(lang: String = "en"): String

  """
  prism:inverseVisibility, else the declared inverse property's prism:visibility; null when neither exists.
  """
  inverseVisibility: TermVisibility
}
`;

/** The type names {@link LENS_SDL} declares; a schema that has one already serves the lens. */
export const LENS_TYPE_NAMES: readonly string[] = [
  "TermVisibility",
  "PropertyRole",
  "PropertyGroup",
];

/** Every class with its direct, named superclasses. */
export const OUTLINE_CLASSES_QUERY = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?class ?parent WHERE {
  { ?class a owl:Class } UNION { ?class a rdfs:Class }
  FILTER(isIRI(?class))
  OPTIONAL { ?class rdfs:subClassOf ?parent FILTER(isIRI(?parent)) }
}`;

/** Every property with its declared inverse, read both ways, and its asserted labels. */
export const OUTLINE_PROPERTIES_QUERY = `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?property ?inverse ?label WHERE {
  { ?property a owl:ObjectProperty } UNION { ?property a owl:DatatypeProperty }
  UNION { ?property a owl:AnnotationProperty } UNION { ?property a rdf:Property }
  FILTER(isIRI(?property))
  OPTIONAL { { ?property owl:inverseOf ?inverse } UNION { ?inverse owl:inverseOf ?property } }
  OPTIONAL { ?property rdfs:label ?label }
}`;
