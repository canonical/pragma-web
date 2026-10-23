import { route } from "@canonical/router-core";
import { createElement, type ReactElement } from "react";
import { routeLensFacet } from "../../src/lib/routeLens/index.js";
import { routeShortcutFacet } from "../../src/lib/routeShortcut/index.js";

/** A rail glyph: a filled square, as a lens declares an icon. */
const StoryIcon = (): ReactElement =>
  createElement(
    "svg",
    { "aria-hidden": true, height: 16, viewBox: "0 0 16 16", width: 16 },
    createElement("rect", {
      fill: "currentColor",
      height: 12,
      width: 12,
      x: 2,
      y: 2,
    }),
  );

/** Route content that renders nothing: the stories render the chrome. */
const BlankPage = (): null => null;

/**
 * A small site's route table: three lenses whose index routes each declare a
 * lens and claim a shortcut, and a term route under the third.
 */
export const STORY_ROUTES = {
  home: route({
    url: "/",
    content: BlankPage,
    meta: {
      ...routeLensFacet.of({
        label: "Home",
        icon: StoryIcon,
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
        icon: StoryIcon,
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
        icon: StoryIcon,
        order: 3,
        tier: 1,
      }),
      ...routeShortcutFacet.of("3"),
    },
  }),
  glossaryTerm: route({ url: "/glossary/:term", content: BlankPage }),
} as const;
