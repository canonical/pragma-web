import { render } from "@canonical/svelte-ssr-test";
import { describe, expect, it } from "vitest";
import Tabs from "./Tabs.svelte";
import type { TabsProps } from "./types.js";

const props = {
  "aria-label": "Directory sections",
  navigationRoot: {
    key: "directory",
    label: "Root",
    items: [
      { url: "/directory", label: "People" },
      { url: "/teams", label: "Teams" },
      { key: "soon", label: "Coming soon" },
      { url: "/archived", label: "Archived", disabled: true },
    ],
  },
  currentUrl: "/directory",
} satisfies TabsProps;

describe("Tabs SSR", () => {
  it("renders named navigation and native links", () => {
    const page = render(Tabs, { props });
    expect(
      page.getByRole("navigation", { name: "Directory sections" }),
    ).toBeTruthy();
    expect(
      page.getByRole("link", { name: "People" }).getAttribute("href"),
    ).toBe("/directory");
    expect(page.container.querySelectorAll("a")).toHaveLength(2);
    expect(page.container.textContent).not.toContain("Root");
  });

  it("marks only the matching URL as current", () => {
    const page = render(Tabs, { props });
    expect(
      page.getByRole("link", { name: "People" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(
      page.getByRole("link", { name: "Teams" }).hasAttribute("aria-current"),
    ).toBe(false);
    expect(page.container.querySelector('[role="tablist"]')).toBeNull();
    expect(page.container.querySelector("button")).toBeNull();
  });

  it("renders inert and disabled items without a destination", () => {
    const page = render(Tabs, { props });
    expect(page.getByText("Coming soon").tagName).toBe("SPAN");
    expect(page.getByText("Archived").getAttribute("aria-disabled")).toBe(
      "true",
    );
    expect(page.getByText("Archived").hasAttribute("href")).toBe(false);
  });

  it("forwards classes and native navigation attributes", () => {
    const page = render(Tabs, {
      props: {
        ...props,
        class: "custom",
        listClass: "custom-list",
        id: "sections",
      },
    });
    const nav = page.getByRole("navigation", { name: "Directory sections" });
    expect(nav.classList.contains("custom")).toBe(true);
    expect(nav.id).toBe("sections");
    expect(nav.querySelector("ul")?.classList.contains("custom-list")).toBe(
      true,
    );
  });

  it("supports an empty navigation root", () => {
    const page = render(Tabs, {
      props: { ...props, navigationRoot: { key: "empty" } },
    });
    expect(page.container.querySelectorAll("li")).toHaveLength(0);
  });
});
