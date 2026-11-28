// Ported from @canonical/react-ds-app SideNavigation Content

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Content from "./Content.svelte";

describe("Content SSR", () => {
  it("renders without throwing", () => {
    const page = render(Content, {
      props: {
        root: {
          key: "root",
          items: [{ key: "g", items: [{ url: "/one", label: "One" }] }],
        },
      },
    });
    expect(page.container.innerHTML).toContain("One");
    expect(page.container.innerHTML).toContain("ds side-navigation-content");
  });

  it("renders an empty landmark with no root", () => {
    const page = render(Content, {});
    expect(page.container.innerHTML).toContain("ds side-navigation-content");
    expect(page.container.querySelector("nav")).toBeTruthy();
  });
});
