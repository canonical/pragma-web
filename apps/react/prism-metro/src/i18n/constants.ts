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
  "lens.network": "Network",
  "network.map.title": "Map of the metro network",
  "network.loading": "Loading the network…",
  "network.error": "The network could not be loaded.",
  "network.notFound.title": "Not on the network",
  "network.notFound.body":
    "No line or station of the network lives at this address.",
  "network.inspector.lines": "Lines",
  "network.inspector.stations": "Stations",
  "network.inspector.hint": "Choose a station on the map or in the list.",
  "network.station.kind.Station": "Station",
  "network.station.kind.Interchange": "Interchange",
  "network.station.zone": "Fare zone",
  "network.station.platforms": "Platforms",
  "network.station.transfer": "Transfer",
  "network.station.minutes": "{minutes} min",
  "network.station.routes": "Routes",
  "network.station.unrouted":
    "{title} is in the graph, but no route calls at it, so the map does not draw it.",
  "network.station.unrouted.link": "Read its entry in the stations lens",
  "network.station.previous": "Previous",
  "network.station.next": "Next",
  "network.station.terminus": "Terminus",
  "network.line.code": "Code",
  "network.line.service": "Service",
  "network.line.loop": "Loop",
  "network.line.linear": "End to end",
  "network.line.stops": "Stops",
  "network.line.ends": "Ends",
  "network.line.interchanges": "Interchanges",
  "network.strip.direction": "Direction",
  "network.strip.continues": "continues",
  "shell.loading": "Loading…",
  "home.title": "Overview",
  "home.lead":
    "The metro network read four ways: its map, its stations, its lines, and the definitions that describe them, each counted from the graph.",
  "home.loading": "Counting the network…",
  "home.error":
    "The network could not be counted. Reload the page to try again.",
  "home.network.count": {
    one: "{count} interchange",
    other: "{count} interchanges",
  },
  "home.network.summary":
    "Every line on one schematic map, and the interchanges where they meet.",
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
  "interchange.word": "interchange",
  "interchange.transfer": "Transfer",
  "interchange.transfer.minutes": {
    one: "{count} minute",
    other: "{count} minutes",
  },
  "interchange.lines.count": { one: "{count} line", other: "{count} lines" },
  "line.stops": "Stops",
  "line.stops.count": { one: "{count} stop", other: "{count} stops" },
  "line.ends": "Ends",
  "line.ends.value": "{first} to {last}",
  "line.loop": "loop",
  "zone.stations.count": {
    one: "{count} station",
    other: "{count} stations",
  },
  "notFound.title": "Page not found",
  "notFound.body": "No page of the metro docs lives at this address.",
} as const;
