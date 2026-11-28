// Ported from @canonical/react-ds-app SideNavigation Footer

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Footer from "./Footer.svelte";

describe("Footer SSR", () => {
  it("renders without throwing", () => {
    const page = render(Footer, {
      props: {
        root: {
          key: "footer",
          items: [{ label: "Log out", control: "button" }],
        },
      },
    });
    expect(page.container.innerHTML).toContain("Log out");
    expect(page.container.innerHTML).toContain("ds side-navigation-footer");
  });

  it("renders an empty region with no data", () => {
    const page = render(Footer, {});
    expect(page.container.innerHTML).toContain("ds side-navigation-footer");
  });
});
