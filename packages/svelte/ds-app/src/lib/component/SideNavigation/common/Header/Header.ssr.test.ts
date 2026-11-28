// Ported from @canonical/react-ds-app SideNavigation Header

import { render } from "@canonical/svelte-ssr-test";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Header from "./Header.svelte";

describe("Header SSR", () => {
  it("renders without throwing", () => {
    const page = render(Header, {
      props: {
        brand: createRawSnippet(() => ({
          render: () => "<span>Test content</span>",
        })),
      },
    });
    expect(page.container.innerHTML).toContain("Test content");
    expect(page.container.innerHTML).toContain("ds side-navigation-header");
  });
});
