/**
 * The v1 lens routes that have no views yet — honest minimal stubs
 * (P-4.1). Each states what lands on its canvas and which P-item builds
 * it; the lens layout around them is the finished product. Home keeps its
 * existing page (`#domains/marketing`); `/guides/:slug` (the reading
 * detail) already exists there too and stays. Components graduated to its
 * real views (`#domains/components`, P-5) and left this file; Definitions
 * graduated to the explorer triptych (`./definitions`, P-5) and left too;
 * Standards graduated to the reading views (`./standards`, P-5) and left
 * as well.
 *
 * They render inside `GuidesLayout`, whose strip is empty: a stub has no
 * trail, controls or status to show, so every strip socket renders its
 * sensible empty.
 *
 * `guides` does declare two things: its keyboard shortcut
 * (`routeShortcutFacet`) and its lens (`routeLensFacet`). A stub is still a
 * destination, and the digit and the rail entry belong to whichever route
 * owns the address — being unbuilt does not change who declares them.
 */

import { routeLensFacet, routeShortcutFacet } from "@canonical/prism-core";
import { route } from "@canonical/router-core";
import { GuidesIcon } from "#lib/LensIcons";
import LensPlaceholder from "./LensPlaceholder.js";

const routes = {
  guides: route({
    url: "/guides",
    meta: {
      ...routeShortcutFacet.of("6"),
      ...routeLensFacet.of({
        label: "Guides",
        icon: GuidesIcon,
        order: 6,
        tier: 1,
      }),
    },
    content: () => (
      <LensPlaceholder
        builtBy="P-5 (reading views)"
        lands="Long-form reading: foundations, setup, the analog map — prose that references entities through chips."
        title="Guides"
      />
    ),
  }),
} as const;

export default routes;
