import { describe, expect, it } from "vitest";
import group from "./group.js";
import route from "./route.js";
import wrapper from "./wrapper.js";

describe("group", () => {
  describe("over a route tuple", () => {
    it("prepends a wrapper to each route without nesting route trees", () => {
      const settingsLayout = wrapper({
        id: "settings:layout",
        component: ({ children }) => children,
      });

      const settingsRoutes = group(settingsLayout, [
        route({
          url: "/settings/profile",
          content: () => "profile",
        }),
        route({
          url: "/settings/billing",
          content: () => "billing",
        }),
      ] as const);

      expect(settingsRoutes).toHaveLength(2);
      expect(settingsRoutes.at(0)?.wrappers.at(0)).toBe(settingsLayout);
      expect(settingsRoutes.at(1)?.wrappers.at(0)).toBe(settingsLayout);
    });

    it("preserves existing wrapper order after prepending a new wrapper", () => {
      const appLayout = wrapper({
        id: "app:layout",
        component: ({ children }) => children,
      });

      const sectionLayout = wrapper({
        id: "section:layout",
        component: ({ children }) => children,
      });

      const sectionRoute = route({
        url: "/section",
        content: () => "section",
        wrappers: [sectionLayout] as const,
      });

      const [groupedRoute] = group(appLayout, [sectionRoute] as const);

      expect(groupedRoute.wrappers).toEqual([appLayout, sectionLayout]);
    });
  });

  describe("over a route record", () => {
    const appLayout = wrapper({
      id: "app:layout",
      component: ({ children }) => children,
    });

    const sectionLayout = wrapper({
      id: "section:layout",
      component: ({ children }) => children,
    });

    it("prepends the wrapper to every route and keeps each name", () => {
      const grouped = group(appLayout, {
        profile: route({ url: "/settings/profile", content: () => "profile" }),
        billing: route({ url: "/settings/billing", content: () => "billing" }),
      });

      expect(Object.keys(grouped)).toEqual(["profile", "billing"]);
      expect(grouped.profile.wrappers.at(0)).toBe(appLayout);
      expect(grouped.billing.wrappers.at(0)).toBe(appLayout);
    });

    it("preserves the existing wrapper order after the new wrapper", () => {
      const grouped = group(appLayout, {
        section: route({
          url: "/section",
          content: () => "section",
          wrappers: [sectionLayout] as const,
        }),
      });

      expect(grouped.section.wrappers).toEqual([appLayout, sectionLayout]);
    });

    it("stacks nested record groups outermost first", () => {
      const section = route({ url: "/section", content: () => "section" });

      const grouped = group(appLayout, group(sectionLayout, { section }));

      expect(grouped.section.wrappers).toEqual([appLayout, sectionLayout]);
    });

    it("keeps each route's parse and render", () => {
      const grouped = group(appLayout, {
        user: route({ url: "/users/:id", content: () => "user" }),
      });

      expect(grouped.user.parse("/users/7")).toEqual({ id: "7" });
      expect(grouped.user.render({ id: "7" })).toBe("/users/7");
    });

    it("leaves the input record and its routes untouched", () => {
      const input = {
        section: route({
          url: "/section",
          content: () => "section",
          wrappers: [sectionLayout] as const,
        }),
      };

      const grouped = group(appLayout, input);

      expect(grouped).not.toBe(input);
      expect(grouped.section).not.toBe(input.section);
      expect(input.section.wrappers).toEqual([sectionLayout]);
    });
  });
});
