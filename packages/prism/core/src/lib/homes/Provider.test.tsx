import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { LENS_ROUTES } from "../../../testing/fixtures.js";
import useHome from "./hooks/useHome.js";
import HomesProvider from "./Provider.js";
import type { Homes } from "./types.js";

/** Prints the home of a `Term` node. */
const TermHome = (): ReactElement => (
  <p>{useHome({ __typename: "Term", uri: "ds:UIBlock" }) ?? "no home"}</p>
);

const renderWith = (homes: Homes) =>
  render(
    <RouterProvider
      router={createRouter(LENS_ROUTES, { adapter: createMemoryAdapter("/") })}
    >
      <HomesProvider homes={homes}>
        <TermHome />
      </HomesProvider>
    </RouterProvider>,
  );

describe("HomesProvider", () => {
  it("renders its children", () => {
    renderWith({});
    expect(screen.getByText("no home")).toBeInTheDocument();
  });

  it("hands its homes to every useHome below it", () => {
    renderWith({ Term: () => "/glossary/term" });
    expect(screen.getByText("/glossary/term")).toBeInTheDocument();
  });
});
