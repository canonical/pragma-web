import type { LinkComponentProps } from "@canonical/react-ds-global";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import createNodePage from "../../../testing/createNodePage.js";
import {
  ONTOLOGY_CLASS_HREF,
  ONTOLOGY_CLASS_NODE,
} from "../../../testing/fixtures.js";
import { EntityCard } from "../EntityCard/index.js";
import { EntityChip } from "../EntityChip/index.js";
import { EntityCommand } from "../EntityCommand/index.js";
import { EntityRow } from "../EntityRow/index.js";
import { defaultProjectionMaps } from "./constants.js";
import useProjectionMaps from "./hooks/useProjectionMaps.js";
import ProjectionsProvider from "./Provider.js";

/** Prints whether the maps in scope are the default ones. */
const MapsProbe = (): ReactElement => (
  <p>
    {useProjectionMaps() === defaultProjectionMaps ? "default maps" : "other"}
  </p>
);

/** A site's router link adapter, marking the anchors it renders. */
const RouterLink = ({
  href,
  className,
  children,
}: LinkComponentProps): ReactElement => (
  <a className={className} data-router-link="" href={href}>
    {children}
  </a>
);

describe("ProjectionsProvider", () => {
  it("hands its maps to every representation below it", () => {
    render(
      <ProjectionsProvider maps={defaultProjectionMaps}>
        <MapsProbe />
      </ProjectionsProvider>,
    );
    expect(screen.getByText("default maps")).toBeInTheDocument();
  });

  it("renders every representation's link to a home through its LinkComponent", () => {
    const { container } = render(
      createNodePage(
        ONTOLOGY_CLASS_NODE,
        (node) => (
          <>
            <EntityChip node={node} />
            <ul>
              <EntityRow node={node} />
              <EntityCommand node={node} />
            </ul>
            <EntityCard node={node} />
          </>
        ),
        { LinkComponent: RouterLink },
      ),
    );
    const links = [...container.querySelectorAll("a")];
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link.hasAttribute("data-router-link")).toBe(true);
      expect(link.getAttribute("href")).toBe(ONTOLOGY_CLASS_HREF);
    }
  });
});
