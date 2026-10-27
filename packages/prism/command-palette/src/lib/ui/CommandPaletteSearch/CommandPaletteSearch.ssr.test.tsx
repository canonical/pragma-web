// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import CommandPaletteSearch from "./CommandPaletteSearch.js";

describe("CommandPaletteSearch SSR", () => {
  it("renders the empty field and its hint, sending no query", () => {
    const environment = createSearchEnvironment();
    const html = renderToString(
      createSiteTree({
        environment,
        router: createSiteRouter(),
        children: (
          <CommandPaletteSearch
            onChoose={() => undefined}
            onHighlight={() => undefined}
            session={0}
          />
        ),
      }),
    );
    expect(html).toContain('class="ds command-palette-search"');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain(
      "Type a name, a compact address or a word from a definition.",
    );
    expect(html).not.toContain('role="listbox"');
    expect(environment.mock.getAllOperations()).toHaveLength(0);
  });
});
