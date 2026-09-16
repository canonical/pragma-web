/**
 * The connected table places the root's pagination bar in its footer by
 * default. A renderer switch holding two connected tables drew a bar in
 * each, and without scripting, where every renderer is drawn in turn, two
 * bars paged one collection.
 *
 * A switch's tables take no footer, and one bar after the switch serves
 * both, as the cards' switch already did.
 */
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import preview from "../../../.storybook/preview.js";
import * as stories from "../../lib/_work_in_progress/RendererSwitch/RendererSwitch.stories.js";

setProjectAnnotations([preview]);

const { TableOrSummary } = composeStories(stories);

describe("the renderer switch over two connected tables", () => {
  it("draws one pagination bar, outside both tables", async () => {
    render(<TableOrSummary />);
    await waitFor(() =>
      expect(screen.getAllByRole("table").length).toBeGreaterThan(0),
    );
    expect(screen.getAllByRole("navigation", { name: "Pagination" })) //
      .toHaveLength(1);
    expect(document.querySelector(".ds.data-table > .footer")).toBeNull();
  });
});
