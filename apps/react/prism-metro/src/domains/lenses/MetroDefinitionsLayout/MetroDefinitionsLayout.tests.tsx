import {
  AmbientNamespaceProvider,
  useForeignPrefix,
} from "@canonical/prism-projections";
import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { appRoutes, notFoundRoute } from "../../../routes.js";
import MetroDefinitionsLayout from "./MetroDefinitionsLayout.js";

/** Route content that shows the prefix a `metro:` identity gets. */
function PrefixProbe(): ReactElement {
  return (
    <p data-testid="prefix">{useForeignPrefix("metro:Station") ?? "none"}</p>
  );
}

describe("MetroDefinitionsLayout", () => {
  it("declares no namespace over the site's, so every prefix shows", () => {
    render(
      <RouterProvider
        router={createRouter(appRoutes, {
          adapter: createMemoryAdapter("/definitions"),
          notFound: notFoundRoute,
        })}
      >
        <AmbientNamespaceProvider namespace="metro">
          <MetroDefinitionsLayout>
            <PrefixProbe />
          </MetroDefinitionsLayout>
        </AmbientNamespaceProvider>
      </RouterProvider>,
    );
    expect(screen.getByTestId("prefix")).toHaveTextContent("metro:");
  });
});
