/**
 * The package's English catalog: every string a reader sees, by message key.
 * A value may hold `{name}` placeholders the translator fills: the flat
 * key-to-message shape `@canonical/i18n-core`'s `createTranslator` reads.
 */
export const MESSAGES = {
  "canvasSkipLink.label": "Skip to content",
  "rail.label": "Primary",
  "themeSelector.label": "Color theme",
  "themeSelector.system": "System",
  "themeSelector.light": "Light",
  "themeSelector.dark": "Dark",
  "chip.summaryWithLifecycle": "{summary} ({lifecycle})",
  "chip.legend.namespace.label": "{prefix}:",
  "chip.legend.namespace.description":
    "Entities whose URI starts with {prefix}:",
  "chip.legend.kind.label": "{label} ({shape})",
  "chip.channel.namespace.label": "Tint — namespace",
  "chip.channel.namespace.description":
    "The colour says which vocabulary the entity belongs to.",
  "chip.channel.box.label": "Border vs fill — class vs instance",
  "chip.channel.box.description":
    "An outline marks a class (TBox); a fill marks an instance (ABox).",
  "chip.channel.kind.label": "Shape — entity family",
  "chip.channel.kind.description":
    "The silhouette says what family of thing is mentioned.",
  "chip.channel.lifecycle.label": "Dot — lifecycle",
  "chip.channel.lifecycle.description":
    "A leading dot marks canonical, beta or deprecated status.",
  "chip.kind.component.label": "Component",
  "chip.kind.component.description": "A buildable UI component.",
  "chip.kind.component.shape": "rounded",
  "chip.kind.pattern.label": "Pattern",
  "chip.kind.pattern.description":
    "A composition of components solving a recurring problem.",
  "chip.kind.pattern.shape": "pill",
  "chip.kind.standard.label": "Standard",
  "chip.kind.standard.description": "A normative rule the codebase is held to.",
  "chip.kind.standard.shape": "square",
  "chip.kind.concept.label": "Concept",
  "chip.kind.concept.description": "An idea the corpus reasons with.",
  "chip.kind.concept.shape": "leaf",
  "chip.kind.term.label": "Term",
  "chip.kind.term.description": "A glossary word with a pinned meaning.",
  "chip.kind.term.shape": "leaf-reverse",
  "chip.kind.token.label": "Token",
  "chip.kind.token.description":
    "A named design value (colour, spacing, type…).",
  "chip.kind.token.shape": "tag",
  "chip.box.class.label": "Class (TBox)",
  "chip.box.class.description": "A category of things — outlined, not filled.",
  "chip.box.instance.label": "Instance (ABox)",
  "chip.box.instance.description": "One concrete thing — filled, no outline.",
  "chip.lifecycle.canonical.label": "Canonical",
  "chip.lifecycle.canonical.description": "The blessed, current form.",
  "chip.lifecycle.beta.label": "Beta",
  "chip.lifecycle.beta.description": "Usable, still settling.",
  "chip.lifecycle.deprecated.label": "Deprecated",
  "chip.lifecycle.deprecated.description":
    "On the way out; prefer the replacement.",
  "chip.lifecycle.none.label": "Unmarked",
  "chip.lifecycle.none.description": "Lifecycle not asserted — no dot.",
} as const;
