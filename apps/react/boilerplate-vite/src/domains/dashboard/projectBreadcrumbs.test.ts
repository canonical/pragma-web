import type { NavRoot } from "@canonical/react-ds-app";
import { describe, expect, it } from "vitest";
import projectBreadcrumbs from "./projectBreadcrumbs.js";

const root: NavRoot = {
  key: "root",
  items: [
    {
      key: "pages",
      items: [
        { url: "/overview", label: "Overview" },
        {
          key: "images",
          label: "Images",
          items: [{ url: "/images/local", label: "Local" }],
        },
      ],
    },
    {
      key: "networking",
      label: "Networking",
      items: [{ key: "networks", label: "Networks", disabled: true }],
    },
  ],
};

describe("projectBreadcrumbs", () => {
  it("projects a top-level item onto a trail of itself, marked current", () => {
    expect(projectBreadcrumbs(root, "/overview")).toEqual([
      { key: "current", label: "Overview", current: true },
    ]);
  });

  it("keeps navigable ancestors and drops the groups, which carry no URL", () => {
    const withParent: NavRoot = {
      key: "root",
      items: [
        {
          key: "pages",
          items: [
            { url: "/instances", label: "Instances" },
            { url: "/instances/web-01", label: "web-01" },
          ],
        },
      ],
    };
    const nested = {
      ...withParent,
      items: [
        {
          key: "pages",
          items: [
            {
              url: "/instances",
              label: "Instances",
              items: [{ url: "/instances/web-01", label: "web-01" }],
            },
          ],
        },
      ],
    } as NavRoot;

    expect(projectBreadcrumbs(nested, "/instances/web-01")).toEqual([
      { url: "/instances", label: "Instances" },
      { key: "current", label: "web-01", current: true },
    ]);
  });

  it("drops an expandable parent that has no URL of its own", () => {
    expect(projectBreadcrumbs(root, "/images/local")).toEqual([
      { key: "current", label: "Local", current: true },
    ]);
  });

  it("returns no trail for a URL that is not in the tree", () => {
    expect(projectBreadcrumbs(root, "/elsewhere")).toEqual([]);
  });
});
