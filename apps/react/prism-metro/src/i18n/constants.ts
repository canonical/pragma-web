/**
 * The locale the app formats numbers and measures in. The catalog below is
 * written in it, so the two change together.
 */
export const LOCALE = "en";

/**
 * Every string the app itself shows a reader, in English, by key. The lens
 * packages keep their own catalogs; these are the words the site adds around
 * them: its name, its rail, its lens labels, the fleet lens's headings and
 * states, and its not-found page.
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
  "fleet.passengers": "{count} passengers",
  "fleet.platformFit.shortest": "Shortest platform {length}",
  "fleet.platformFit.overhang":
    "{station}: {excess} past its {platform} platform",
  "fleet.platformFit.stations": "station",
  "fleet.unit": "Unit {position}",
  "fleet.cabFront": "{title}, cab at the front",
  "fleet.cabRear": "{title}, cab at the rear",
  "shell.loading": "Loading…",
  "notFound.title": "Page not found",
  "notFound.body": "No page of the metro docs lives at this address.",
} as const;
