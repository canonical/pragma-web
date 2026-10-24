/**
 * Every string the app's own shell, pages and projections show a reader, in
 * English, by key. The lens packages keep their own catalogs; these are the
 * words the site adds around them: its loading line, its colophon's
 * statement, its not-found page, and the words its projections of the
 * design-system types set around the graph's data. A value may hold
 * `{name}` placeholders the translator fills, or be a plural record whose
 * branch the `count` value selects: the shape `@canonical/i18n-core`'s
 * `createTranslator` reads.
 */
export const MESSAGES = {
  "shell.loading": "Loading…",
  "page.loading": "Loading the graph…",
  "page.queryFailed":
    "The graph query failed. Is the dev backend up? Reload to retry.",
  "rail.caption": "design system docs",
  "rail.utilities": "Utilities",
  "rail.playground": "Playground",
  "rail.signIn": "Demo sign-in",
  "colophon.statement":
    "Pragma — the design system, documented from its knowledge graph.",
  "guides.title": "Guides",
  "guides.lands":
    "Long-form reading: foundations, setup, the analog map — prose that references entities through chips.",
  "guides.placeholder":
    "This canvas is a placeholder: the frame around it is finished, and the guides land with the reading views.",
  "guides.documentTitle": "{slug} — Guides",
  "guides.guideCopy": "Guide content for {slug}.",
  "account.title": "Account",
  "account.signedIn": "Protected account page. You are signed in.",
  "login.title": "Login",
  "login.instruction":
    "Demo login. Add {param} to any protected URL to simulate authentication.",
  "login.from": "You will be redirected to {from} after login.",
  "playground.title": "Playground",
  "playground.intro":
    "One component straight off the live graph, Button, in every form the site projects it in: the chip, the list entry, the command, the graph node and the card.",
  "playground.probe.notFound": "No component found at {address}.",
  "playground.probe.forms": "Its forms",
  "playground.probe.card": "Its card",
  "playground.probe.chip": "Chip",
  "playground.probe.row": "List entry",
  "playground.probe.command": "Command",
  "playground.probe.graphNode": "Graph node",
  "lobby.lens": "Home",
  "lobby.title": "The design system, as a graph",
  "lobby.pitch":
    "This site reads a knowledge graph of the design system and renders it. Components, the vocabulary describing them, and the standards the code is held to are one body of data seen through different lenses — so a component’s anatomy, the class defining it, and the rule governing it are a link apart rather than three documents to reconcile.",
  "lobby.provenance":
    "Nothing here is written twice. Every name and number below is read from the graph as the page is served; the prose around them is the only authored part.",
  "lobby.loading": "Loading the graph’s shape…",
  "lobby.examples.title": "A few of the components",
  "lobby.examples.lead":
    "Read live, in the graph’s own order. The names span tiers — global entries sit beside application ones, because the graph does not privilege either.",
  "lobby.doors.title": "The lenses",
  "lobby.doors.components.title": "Components",
  "lobby.doors.components.summary":
    "Every block the design system describes — anatomy, properties, and the relations tying one to another.",
  "lobby.doors.components.count": {
    one: "{count} component",
    other: "{count} components",
  },
  "lobby.doors.patterns.count": {
    one: "{count} pattern",
    other: "{count} patterns",
  },
  "lobby.doors.definitions.title": "Definitions",
  "lobby.doors.definitions.summary":
    "The vocabulary itself: the classes and properties the other lenses are written in, with the hierarchy drawn out.",
  "lobby.doors.standards.title": "Standards",
  "lobby.doors.standards.summary":
    "The rules the code is held to, grouped by category and readable end to end.",
  "lobby.doors.standards.count": {
    one: "{count} standard",
    other: "{count} standards",
  },
  "lobby.doors.guides.title": "Guides",
  "lobby.doors.guides.summary":
    "Long-form orientation. A placeholder for now — the reading views are not built yet.",
  "anatomy.slot": "{slot} · {cardinality}",
  "anatomy.cardinality": "{cardinality}",
  "anatomy.switch": "switch on {discriminator}",
  "anatomy.case": "case {value}",
  "catalog.title": "Components",
  "catalog.loading": "Loading the catalog…",
  "catalog.tiers": "Tiers",
  "catalog.kind": { one: "component", other: "components" },
  "catalog.empty": "No components in the graph.",
  "catalog.more": "Load more",
  "catalog.loadingMore": "Loading more…",
  "catalog.untiered": "Untiered",
  "notFound.title": "Page not found",
  "notFound.body": "The page you are looking for does not exist.",
  "block.version": "v{version}",
  "modifier.class": "Class",
  "modifier.family": "Family",
  "family.members": "Members",
  "family.modifiers": {
    one: "{count} modifier",
    other: "{count} modifiers",
  },
  "standard.category": "Category",
  "example.button": "Button",
  "example.chip": "Chip",
  "example.inlineCode": "inline code",
} as const;
