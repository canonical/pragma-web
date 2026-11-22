import { createEnvironment } from "@canonical/prism-core";
import {
  createMemoryAdapter,
  createRouter,
  route,
} from "@canonical/router-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { searchRoutes } from "#domains/search";
import Shell from "./Shell.js";

/** What the palette reads of its props here. */
interface PaletteProps {
  readonly searchHref?: (text: string) => string;
}

const palette = vi.hoisted(() => ({
  props: undefined as PaletteProps | undefined,
}));

// Record the props the Shell gives the palette, which reads them only once
// a search answers.
vi.mock("@canonical/prism-command-palette", () => ({
  CommandPalette: (props: PaletteProps) => {
    palette.props = props;
    return null;
  },
}));

// Nothing here queries, so a fetch that never settles stands in for the
// network.
const environment = createEnvironment({
  fetchFn: () => new Promise<never>(() => {}),
});

/** A landing page the router matches at `/`. */
const Landing = () => <h1>Landing</h1>;

describe("Shell's palette", () => {
  it("is given the search page's address for a text when the routes hold the page (W8-A1)", async () => {
    render(
      <Shell
        environment={environment}
        router={createRouter(
          { landing: route({ url: "/", content: Landing }), ...searchRoutes },
          { adapter: createMemoryAdapter("/") },
        )}
      />,
    );
    await screen.findByRole("heading", { name: "Landing" });
    expect(palette.props?.searchHref?.("but")).toBe("/search?q=but");
  });

  it("is given no address when the routes hold no search page", async () => {
    render(
      <Shell
        environment={environment}
        router={createRouter(
          { landing: route({ url: "/", content: Landing }) },
          { adapter: createMemoryAdapter("/") },
        )}
      />,
    );
    await screen.findByRole("heading", { name: "Landing" });
    expect(palette.props).toBeDefined();
    expect(palette.props?.searchHref).toBeUndefined();
  });
});
