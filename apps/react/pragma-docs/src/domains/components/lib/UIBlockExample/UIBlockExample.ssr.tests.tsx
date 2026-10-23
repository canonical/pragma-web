// Scaffolded by @canonical/summon-component:react v0.43.0

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MESSAGES } from "#i18n";
import UIBlockExample from "./UIBlockExample.js";

describe("UIBlockExample SSR", () => {
  it("renders the published component's markup on the server", () => {
    const html = renderToString(<UIBlockExample example="button" />);
    expect(html).toContain('class="ds button');
    expect(html).toContain('type="button"');
    expect(html).toContain(MESSAGES["example.button"]);
  });
});
