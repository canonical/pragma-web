/**
 * Every string the app itself shows a reader, in English, by key. The lens
 * packages keep their own catalogs; these are the words the site adds around
 * them: its name, its rail, its lens labels, its not-found page and the
 * network lens's pages. A `{name}` in a message is a value `formatMessage`
 * fills in.
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
  "network.placeholder": "{component} goes here",
  "shell.loading": "Loading…",
  "notFound.title": "Page not found",
  "notFound.body": "No page of the metro docs lives at this address.",
} as const;
