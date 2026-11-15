import type { LinkComponentProps } from "@canonical/react-ds-global";
import { renderHook } from "@testing-library/react";
import { type ReactElement, type ReactNode, useContext } from "react";
import { describe, expect, it } from "vitest";
import { NO_SITE_SWITCHES } from "../../../testing/createSiteTree.js";
import ProjectionsContext from "./Context.js";
import ProjectionLinkProvider from "./ProjectionLinkProvider.js";

/** A site's router link adapter, reduced to the anchor it renders. */
const RouterLink = ({ href, children }: LinkComponentProps): ReactElement => (
  <a href={href}>{children}</a>
);

/** Another link, as a surface nested in the site renders its homes through. */
const TitleLink = ({ children }: LinkComponentProps): ReactElement => (
  <span>{children}</span>
);

/** A site's peek, reduced to nothing. */
const sitePeek = (): ReactNode => null;

/** Read what the nearest provider holds. */
const readProvided = () => useContext(ProjectionsContext);

describe("ProjectionLinkProvider", () => {
  it("holds the intrinsic anchor, no peek and no switches when given nothing", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider>{children}</ProjectionLinkProvider>
    );
    expect(renderHook(readProvided, { wrapper }).result.current).toEqual({
      LinkComponent: "a",
      peek: undefined,
      site: undefined,
    });
  });

  it("holds the link, the peek and the switches it is given", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider
        LinkComponent={RouterLink}
        peek={sitePeek}
        site={NO_SITE_SWITCHES}
      >
        {children}
      </ProjectionLinkProvider>
    );
    expect(renderHook(readProvided, { wrapper }).result.current).toEqual({
      LinkComponent: RouterLink,
      peek: sitePeek,
      site: NO_SITE_SWITCHES,
    });
  });

  it("takes what it is not given from the provider above", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider
        LinkComponent={RouterLink}
        peek={sitePeek}
        site={NO_SITE_SWITCHES}
      >
        <ProjectionLinkProvider LinkComponent={TitleLink}>
          {children}
        </ProjectionLinkProvider>
      </ProjectionLinkProvider>
    );
    expect(renderHook(readProvided, { wrapper }).result.current).toEqual({
      LinkComponent: TitleLink,
      peek: sitePeek,
      site: NO_SITE_SWITCHES,
    });
  });

  it("inherits the link component in a provider given only a peek", () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider LinkComponent={RouterLink}>
        <ProjectionLinkProvider peek={sitePeek}>
          {children}
        </ProjectionLinkProvider>
      </ProjectionLinkProvider>
    );
    const provided = renderHook(readProvided, { wrapper }).result.current;
    expect(provided?.LinkComponent).toBe(RouterLink);
    expect(provided?.peek).toBe(sitePeek);
    expect(provided?.site).toBeUndefined();
  });

  it("replaces the outer peek and switches with the inner ones", () => {
    const innerPeek = (): ReactNode => null;
    const innerSite = { ...NO_SITE_SWITCHES };
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <ProjectionLinkProvider
        LinkComponent={RouterLink}
        peek={sitePeek}
        site={NO_SITE_SWITCHES}
      >
        <ProjectionLinkProvider peek={innerPeek} site={innerSite}>
          {children}
        </ProjectionLinkProvider>
      </ProjectionLinkProvider>
    );
    const provided = renderHook(readProvided, { wrapper }).result.current;
    expect(provided?.LinkComponent).toBe(RouterLink);
    expect(provided?.peek).toBe(innerPeek);
    expect(provided?.site).toBe(innerSite);
  });
});
