import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createReferencesPage from "../../../../testing/createReferencesPage.js";
import { ONTOLOGY_CLASS_HREF } from "../../../../testing/fixtures.js";
import { markdownComponents } from "../constants.js";

const ProseLink = markdownComponents.a;

describe("ProseReferencesProvider", () => {
  it("renders its prose", () => {
    render(createReferencesPage(<p>Some prose.</p>));
    expect(screen.getByText("Some prose.")).toBeInTheDocument();
  });

  it("hands its references to every prose link below it", () => {
    render(
      createReferencesPage(
        <p>
          See <ProseLink href="ds:UIBlock">the block</ProseLink> and{" "}
          <ProseLink href="metro:station/kings-cross">the station</ProseLink>.
        </p>,
      ),
    );
    expect(
      screen.getByRole("link", { name: "the block" }).getAttribute("href"),
    ).toBe(ONTOLOGY_CLASS_HREF);
    expect(
      screen.getByText("the station").closest(".ds.node-chip"),
    ).not.toBeNull();
  });
});
