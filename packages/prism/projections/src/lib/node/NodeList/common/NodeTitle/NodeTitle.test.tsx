import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createSiteTree, {
  createStoreOnlyEnvironment,
} from "../../../../../../testing/createSiteTree.js";
import NodeTitle from "./NodeTitle.js";

/** Render a title under the site's providers, whose homes name the classes. */
const renderTitle = (typename: string) =>
  render(
    createSiteTree(
      createStoreOnlyEnvironment(),
      <NodeTitle curie="ds:Layout" title="Layout" typename={typename} />,
    ),
  );

describe("NodeTitle", () => {
  it("links the title to its node's home", () => {
    renderTitle("OntologyClass");
    const link = screen.getByRole("link", { name: "Layout" });
    expect(link).toHaveAttribute("href", "/things/ds%3ALayout");
  });

  it("shows the title alone when its node has no home", () => {
    renderTitle("Station");
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
