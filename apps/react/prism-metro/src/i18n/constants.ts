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
  "shell.loading": "Loading…",
  "notFound.title": "Page not found",
  "notFound.body": "No page of the metro docs lives at this address.",
} as const;
