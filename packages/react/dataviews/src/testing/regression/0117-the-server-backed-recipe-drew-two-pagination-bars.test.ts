/**
 * The connected table places the root's pagination bar in its footer. The
 * consumer code the server-backed stories show still placed a bar beside the
 * table too, so an application copying it drew two bars paging one
 * collection, and the code no longer matched the screen the stories render.
 *
 * The recipe puts its bar in the table's footer.
 */

import { describe, expect, it } from "vitest";
import { SERVER_BACKED_RENDER_CODE } from "../../storybook/machines/constants.js";

describe("the server-backed consumer code", () => {
  it("pages through the table's footer alone", () => {
    expect(SERVER_BACKED_RENDER_CODE).toMatch(
      /footer=\{<DataViews\.Pagination sizes=\{\[[\d, ]+\]\} \/>\}/,
    );
    expect(
      SERVER_BACKED_RENDER_CODE.match(/<DataViews\.Pagination\b/g),
    ).toHaveLength(1);
  });
});
