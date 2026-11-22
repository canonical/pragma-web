import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../../../../testing/createWarmEnvironment.js";
import {
  CIRCLE_LINE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
  LINES_BINDING,
} from "../../../../../../testing/fixtures.js";
import { EntityDetail } from "../EntityDetail/index.js";

describe("ReferencedByGroup", () => {
  it("titles an incoming group with its label and count above its values", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = `/lines/${encodeURIComponent(CIRCLE_LINE_CURIE)}`;
    const { environment } = await createWarmEnvironment(url);
    const { container } = render(
      createEntitySite({
        url,
        environment,
        extensions: ["source", "statements"],
        children: (
          <EntityDetail
            binding={LINES_BINDING}
            label="Lines"
            uri={CIRCLE_LINE_CURIE}
          />
        ),
      }),
    );
    const groups = [...container.querySelectorAll(".ds.referenced-by-group")];
    expect(groups).toHaveLength(1);
    expect(
      [...(groups.at(0)?.children ?? [])].map(
        (child) => `${child.tagName}.${child.className}`,
      ),
    ).toEqual(["H3.title", "DIV.ds statement-group"]);
    expect(groups.at(0)?.querySelector(":scope > .title")?.textContent).toBe(
      "served by · 6",
    );
    expect(groups.at(0)?.querySelectorAll(".values a")).toHaveLength(6);
  });
});
