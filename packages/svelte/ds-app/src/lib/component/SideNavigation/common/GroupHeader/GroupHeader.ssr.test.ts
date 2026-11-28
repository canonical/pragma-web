// Ported from @canonical/react-ds-app SideNavigation GroupHeader

import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import GroupHeader from "./GroupHeader.svelte";

describe("GroupHeader SSR", () => {
  it("renders without throwing", () => {
    const page = render(GroupHeader, { props: { children: "Hardware" } });
    expect(page.container.innerHTML).toContain(
      "ds side-navigation-group-header",
    );
    expect(page.container.innerHTML).toContain("Hardware");
  });
});
