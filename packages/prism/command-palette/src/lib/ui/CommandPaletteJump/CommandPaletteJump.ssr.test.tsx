// Scaffolded by @canonical/summon-component:react v0.46.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { COMPONENT_HREF } from "../../../../testing/fixtures.js";
import CommandPaletteJump from "./CommandPaletteJump.js";

describe("CommandPaletteJump SSR", () => {
  it("renders its field and its destinations' links", () => {
    const html = renderToString(
      createSiteTree({
        environment: createSearchEnvironment(),
        router: createSiteRouter(),
        children: (
          <CommandPaletteJump
            destinations={{
              places: [{ label: "Components", href: COMPONENT_HREF }],
              recent: [],
            }}
            onChoose={() => undefined}
          />
        ),
      }),
    );
    expect(html).toMatch(/^<div class="ds command-palette-jump">/);
    expect(html).toContain('aria-label="Jump to"');
    expect(html).toContain(`href="${COMPONENT_HREF}"`);
  });
});
