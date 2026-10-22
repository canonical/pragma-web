import { createRouter, route } from "@canonical/router-core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RouterProvider from "../RouterProvider/Provider.js";
import useHref from "./useHref.js";

const routes = {
  home: route({
    url: "/",
    content: () => "home",
  }),
  user: route({
    url: "/users/:id",
    content: () => "user",
  }),
};

function UserHref() {
  return (
    <span>
      {useHref<typeof routes, "user">("user", {
        params: { id: "42" },
        hash: "bio",
      })}
    </span>
  );
}

function HomeHref() {
  return <span>{useHref<typeof routes, "home">("home")}</span>;
}

describe("useHref", () => {
  it("resolves the same href as router.buildPath", () => {
    const router = createRouter(routes);
    const expected = router.buildPath("user", {
      params: { id: "42" },
      hash: "bio",
    });

    render(
      <RouterProvider router={router}>
        <UserHref />
      </RouterProvider>,
    );

    expect(expected).toBe("/users/42#bio");
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it("resolves a route without params with no options", () => {
    render(
      <RouterProvider router={createRouter(routes)}>
        <HomeHref />
      </RouterProvider>,
    );

    expect(screen.getByText("/")).toBeTruthy();
  });

  it("throws when no RouterProvider is present", () => {
    expect(() => {
      render(<HomeHref />);
    }).toThrow("RouterProvider is required to use router-react hooks.");
  });
});
