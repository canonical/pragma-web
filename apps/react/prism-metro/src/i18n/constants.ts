/**
 * Every string the app itself shows a reader, in English, by key. The lens
 * packages keep their own catalogs; these are the words the site adds around
 * them: its name, its rail, its lens labels, its landing, the words its
 * projections of the metro types fill their slots with, and its not-found
 * page. A value may hold `{name}` placeholders the translator fills, or be a
 * plural record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads.
 */
export const MESSAGES = {
  "site.name": "Metro",
  "site.caption": "network docs",
  "rail.utilities": "Utilities",
  "lens.stations": "Stations",
  "lens.lines": "Lines",
  "shell.loading": "Loading…",
  "home.title": "Overview",
  "home.lead":
    "The metro network read three ways: its stations, its lines, and the definitions that describe them, each counted from the graph.",
  "home.loading": "Counting the network…",
  "home.error":
    "The network could not be counted. Reload the page to try again.",
  "home.stations.count": { one: "{count} station", other: "{count} stations" },
  "home.stations.summary":
    "Every stop on the network, with the lines that call at it.",
  "home.lines.count": { one: "{count} line", other: "{count} lines" },
  "home.lines.summary":
    "Every line the network runs, with the stations it serves.",
  "home.definitions.count": { one: "{count} class", other: "{count} classes" },
  "home.definitions.summary":
    "The ontology the network is described in: its classes and their properties.",
  "station.platforms": "Platforms",
  "station.platforms.count": {
    one: "{count} platform",
    other: "{count} platforms",
  },
  "station.zone": "Zone",
  "station.lines": "Lines",
  "station.lines.separator": ", ",
  "notFound.title": "Page not found",
  "notFound.body": "No page of the metro docs lives at this address.",
} as const;
