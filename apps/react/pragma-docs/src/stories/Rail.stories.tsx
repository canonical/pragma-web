/**
 * `@canonical/prism-core`'s chrome ships no Storybook of its own; its
 * stories live in the docs site, rendered over the site's styles.
 */

import {
  Rail as Component,
  collectLenses,
  routeLensFacet,
  routeShortcutFacet,
} from "@canonical/prism-core";
import { definitionsRoutes } from "@canonical/prism-lens-definitions";
import { route } from "@canonical/router-core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { GuidesIcon } from "#domains/guides";
import { standardsRoutes } from "#domains/standards";
import { ComponentsIcon, HomeIcon, JourneysIcon } from "#lib/LensIcons";
import { withRouter } from "../../.storybook/decorators/index.js";

/**
 * Name-compatible bare routes: the rail's links resolve without mounting
 * the app's real pages (whose layouts would nest a whole rail here).
 *
 * They carry the lens and shortcut facets: the rail's entries are collected
 * off this table and its digits off the router's, so a route without the
 * annotations renders no entry or no `kbd`. Keep these six in step with the
 * real route modules; the Definitions and Standards entries read the lens
 * packages' own declarations, so they cannot drift.
 */
const bareRoutes = {
  home: route({
    url: "/",
    content: () => null,
    meta: {
      ...routeShortcutFacet.of("1"),
      ...routeLensFacet.of({
        label: "Home",
        icon: HomeIcon,
        order: 1,
        tier: 2,
      }),
    },
  }),
  components: route({
    url: "/components",
    content: () => null,
    meta: {
      ...routeShortcutFacet.of("2"),
      ...routeLensFacet.of({
        label: "Components",
        icon: ComponentsIcon,
        order: 2,
        tier: 2,
      }),
    },
  }),
  definitions: route({
    url: "/definitions",
    content: () => null,
    meta: definitionsRoutes.definitions.meta,
  }),
  standards: route({
    url: "/standards",
    content: () => null,
    meta: standardsRoutes.standards.meta,
  }),
  journeys: route({
    url: "/journeys",
    content: () => null,
    meta: {
      ...routeShortcutFacet.of("5"),
      ...routeLensFacet.of({
        label: "Journeys",
        icon: JourneysIcon,
        order: 5,
        tier: 2,
      }),
    },
  }),
  guides: route({
    url: "/guides",
    content: () => null,
    meta: {
      ...routeShortcutFacet.of("6"),
      ...routeLensFacet.of({
        label: "Guides",
        icon: GuidesIcon,
        order: 6,
        tier: 1,
      }),
    },
  }),
} as const;

const meta: Meta<typeof Component> = {
  title: "Prism/Rail",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRouter({ routes: bareRoutes })],
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The primary rail: brand and the six lenses with the keyboard hints their
 * own routes allocate. Hover an entry to reveal its digit. */
export const Default: Story = {
  args: {
    brand: { label: "Pragma", caption: "design system docs", to: "home" },
    entries: collectLenses(bareRoutes),
  },
};
