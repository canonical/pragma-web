/**
 * Static fixtures shared by the package's suites.
 */

import { route } from "@canonical/router-core";
import { createElement, type ReactElement } from "react";
import { routeLensFacet } from "../src/lib/routeLens/index.js";
import { routeShortcutFacet } from "../src/lib/routeShortcut/index.js";

/** A decorative rail glyph, as a lens declares one. */
const FixtureIcon = (): ReactElement =>
  createElement("svg", { "aria-hidden": true, "data-icon": "fixture" });

/** Route content that renders nothing. */
const BlankPage = (): null => null;

/**
 * A small site's route table: three lenses whose index routes each declare a
 * lens and claim a shortcut, and one parameterised route that declares
 * neither.
 */
export const LENS_ROUTES = {
  home: route({
    url: "/",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Home",
        icon: FixtureIcon,
        order: 1,
        tier: 2,
      }),
      ...routeShortcutFacet.of("1"),
    },
  }),
  catalog: route({
    url: "/catalog",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Catalog",
        icon: FixtureIcon,
        order: 2,
        tier: 1,
      }),
      ...routeShortcutFacet.of("2"),
    },
  }),
  glossary: route({
    url: "/glossary",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Glossary",
        icon: FixtureIcon,
        order: 3,
        tier: 1,
      }),
      ...routeShortcutFacet.of("3"),
    },
  }),
  glossaryTerm: route({ url: "/glossary/:term", content: BlankPage }),
} as const;
