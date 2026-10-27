/**
 * The locale the app formats numbers and measures in. The catalog below is
 * written in it, so the two change together.
 */
export const LOCALE = "en";

/**
 * Every string the app itself shows a reader, in English, by key. The lens
 * packages keep their own catalogs; these are the words the site adds around
 * them: its name, its rail, its lens labels, its landing, the words its
 * projections of the metro types fill their slots with, the fleet lens's
 * headings and states, and its not-found page. A value may hold `{name}` placeholders the translator fills, or be a
 * plural record whose branch the `count` value selects: the shape
 * `@canonical/i18n-core`'s `createTranslator` reads.
 */
export const MESSAGES = {
  "site.name": "Metro",
  "site.caption": "network docs",
  "rail.utilities": "Utilities",
  "lens.stations": "Stations",
  "lens.lines": "Lines",
  "lens.fleet": "Fleet",
  "fleet.index.loading": "Loading the fleet…",
  "fleet.index.error": "The fleet could not be loaded.",
  "fleet.stocks.kind": { one: "rolling stock", other: "rolling stocks" },
  "fleet.index.empty": "The graph lists no rolling stock.",
  "fleet.page.loading": "Loading…",
  "fleet.page.error": "This page could not be loaded.",
  "fleet.formations": "Formations",
  "fleet.carTypes": "Car types",
  "fleet.units": "Units",
  "fleet.platformFit": "Platform fit",
  "fleet.platformFit.none": "No line runs this formation.",
  "fleet.fits": "Fits",
  "fleet.overhangs": "Overhangs",
  "fleet.reversed": "reversed",
  "fleet.notFound": "Nothing in the fleet lives at {address}.",
  "fleet.facts": "Facts",
  "fleet.fact.formations": "Formations",
  "fleet.fact.length": "Length",
  "fleet.fact.capacity": "Capacity",
  "fleet.fact.cars": "Cars",
  "fleet.fact.units": "Units",
  "fleet.fact.lines": "Lines",
  "fleet.fact.stock": "Rolling stock",
  "fleet.fact.code": "Code",
  "fleet.fact.cab": "Driving cab",
  "fleet.yes": "Yes",
  "fleet.no": "No",
  "fleet.range": "{min} to {max}",
  "fleet.passengers.count": {
    one: "{count} passenger",
    other: "{count} passengers",
  },
  "fleet.formations.count": {
    one: "{count} formation",
    other: "{count} formations",
  },
  "fleet.units.count": { one: "{count} unit", other: "{count} units" },
  "fleet.cars.count": { one: "{count} car", other: "{count} cars" },
  "fleet.lines.separator": ", ",
  "fleet.platformFit.shortest": "Shortest platform {length}",
  "fleet.platformFit.overhang":
    "{station}: {excess} past its {platform} platform",
  "fleet.unit": "Unit {position}",
  "fleet.cabFront": "{title}, cab at the front",
  "fleet.cabRear": "{title}, cab at the rear",
  "shell.loading": "Loading…",
  "home.title": "Overview",
  "home.lead":
    "The metro network read four ways: its stations, its lines, the definitions that describe them, and the fleet that runs on them, each counted from the graph.",
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
  "home.fleet.count": {
    one: "{count} rolling stock",
    other: "{count} rolling stocks",
  },
  "home.fleet.summary":
    "Every train the network runs: its formations drawn to scale, and how they fit the platforms.",
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
