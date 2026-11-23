import { describe, expect, it } from "vitest";
import spellPublicImports from "./spellPublicImports.js";

describe("spellPublicImports", () => {
  it("spells the package's hooks and DataViews imports as the public entry", () => {
    expect(
      spellPublicImports(
        [
          'import { useView } from "../../../../hooks/index.js";',
          'import { DataViews } from "../../../DataViews/index.js";',
        ].join("\n"),
      ),
    ).toBe(
      [
        'import { useView } from "@canonical/dataviews-react";',
        'import { DataViews } from "@canonical/dataviews-react";',
      ].join("\n"),
    );
  });

  it("spells the tutorial's own hooks and sibling parts as sibling files", () => {
    expect(
      spellPublicImports(
        [
          'import { useIsScripted } from "../../hooks/index.js";',
          'import Toolbar from "../Toolbar/index.js";',
        ].join("\n"),
      ),
    ).toBe(
      [
        'import { useIsScripted } from "./useIsScripted.js";',
        'import Toolbar from "./Toolbar.js";',
      ].join("\n"),
    );
  });

  it("drops the tutorial note and the blank line before it", () => {
    expect(
      spellPublicImports(
        "/**\n * A toolbar.\n *\n * @experimental Pre-release: a tutorial example, not exported from the\n * package.\n */\n",
      ),
    ).toBe("/**\n * A toolbar.\n */\n");
  });

  it("leaves other source as it is", () => {
    const source = 'import { useState } from "react";\n';
    expect(spellPublicImports(source)).toBe(source);
  });
});
