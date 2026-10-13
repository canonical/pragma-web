import { render } from "@canonical/svelte-ssr-test";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import Tag from "./Tag.svelte";

describe("Tag", () => {
  it("renders status as non-interactive text with a visual modifier", () => {
    const page = render(Tag, {
      props: {
        value: "Active",
        criticality: "success",
        "aria-label": "Status: Active",
      },
    });
    const tag = page.container.querySelector(".ds.tag");

    expect(tag?.tagName).toBe("SPAN");
    expect(tag?.classList).toContain("success");
    expect(tag?.textContent?.trim()).toBe("Active");
    expect(tag?.getAttribute("aria-label")).toBe("Status: Active");
    expect(tag?.querySelector("button, a")).toBeNull();
    expect(tag?.querySelector(".lead, .icon, .badge")).toBeNull();
  });

  it("leaves density to the surrounding shell", () => {
    const page = render(Tag, {
      props: { value: "Active" },
    });
    const tag = page.container.querySelector(".ds.tag");

    expect(tag?.className).toBe("ds tag");
    expect(tag?.hasAttribute("density")).toBe(false);
  });

  it("renders a lead before its value", () => {
    const page = render(Tag, {
      props: { lead: "Status", value: "Active" },
    });
    const tag = page.container.querySelector(".ds.tag");

    expect(tag?.querySelector(".lead")?.textContent).toBe("Status:");
    expect(tag?.querySelector(".value")?.textContent).toBe("Active");
    expect(tag?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "Status: Active",
    );
  });

  it("renders an icon, lead, value and badge without leaking content props", () => {
    const page = render(Tag, {
      props: {
        lead: "Status",
        value: "Active",
        icon: createRawSnippet(() => ({
          render: () => '<svg viewBox="0 0 16 16"></svg>',
        })),
        badge: createRawSnippet(() => ({
          render: () => "<span>3</span>",
        })),
      },
    });
    const tag = page.container.querySelector(".ds.tag");

    expect(Array.from(tag?.children ?? [], (child) => child.className)).toEqual(
      ["icon", "lead", "value", "badge"],
    );
    expect(tag?.querySelector(".icon")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(tag?.querySelector(".badge")?.textContent).toBe("3");
    expect(tag?.querySelector("button, a")).toBeNull();
    for (const attribute of ["lead", "value", "icon", "badge"]) {
      expect(tag?.hasAttribute(attribute)).toBe(false);
    }
  });

  it("renders the value as text rather than markup", () => {
    const page = render(Tag, {
      props: { value: "<strong>Active</strong>" },
    });
    const tag = page.container.querySelector(".ds.tag");

    expect(tag?.querySelector(".value")?.textContent).toBe(
      "<strong>Active</strong>",
    );
    expect(tag?.querySelector("strong")).toBeNull();
  });
});
