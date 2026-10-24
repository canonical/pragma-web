// Scaffolded by @canonical/summon-component:react v0.43.0

import { HomesProvider } from "@canonical/prism-core";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { MockPayloadGenerator } from "relay-test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import createSearchEnvironment from "../../../../testing/createSearchEnvironment.js";
import createSiteRouter from "../../../../testing/createSiteRouter.js";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  COMPONENT_HREF,
  COMPONENT_NODE,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import testQuery, {
  type CommandPaletteResultTestQuery,
} from "../../../__generated__/CommandPaletteResultTestQuery.graphql.js";
import { CommandPaletteTitle } from "../CommandPaletteTitle/index.js";
import CommandPaletteResult from "./CommandPaletteResult.js";
import type { CommandPaletteResultProps } from "./types.js";

/* v8 ignore start -- relay-compiler reads this tag; nothing calls it at runtime */
/**
 * The operation the tests render CommandPaletteResult under: one Node, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of
 * as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CommandPaletteResultTestQuery @relay_test_operation {
    node(id: "test") {
      ...CommandPaletteResult_node @alias
    }
  }
`;
void declareTestQuery;
/* v8 ignore stop */

/** Run the test operation and render the result over the node it returns. */
const ResultOverNode = (
  props: Omit<CommandPaletteResultProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CommandPaletteResultTestQuery>(testQuery, {});
  const node = data.node?.CommandPaletteResult_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <CommandPaletteResult {...props} node={node} />;
};

/**
 * Render the result of `entity` as an option of a listbox, under the site's
 * providers and the palette's inert title, as the palette lists it.
 */
const renderResult = (
  entity: NodePayload,
  props: Partial<Omit<CommandPaletteResultProps, "node">> = {},
) => {
  const environment = createSearchEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, { Node: () => entity }),
  );
  const router = createSiteRouter();
  const onChoose = vi.fn();
  const view = render(
    createSiteTree({
      environment,
      router,
      children: (
        <ProjectionsProvider
          LinkComponent={CommandPaletteTitle}
          maps={defaultProjectionMaps}
        >
          <div aria-label="Results" role="listbox">
            <ResultOverNode
              aria-selected={false}
              id="results-0"
              onChoose={onChoose}
              role="option"
              {...props}
            />
          </div>
        </ProjectionsProvider>
      ),
    }),
  );
  return { ...view, router, onChoose };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CommandPaletteResult", () => {
  it("renders its type's command arm as the option it is given", () => {
    renderResult(ONTOLOGY_CLASS_NODE, { "aria-selected": true });
    const option = screen.getByRole("option", { name: /Layout/ });
    expect(option.tagName).toBe("LI");
    expect(option).toHaveAttribute("id", "results-0");
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(option).toHaveClass("ontology-class-command");
    expect(option).not.toHaveAttribute("aria-disabled");
    expect(option).not.toHaveAttribute("aria-description");
  });

  it("holds its title as text, never as a link", () => {
    const { container } = renderResult(COMPONENT_NODE);
    expect(screen.getByText("Layout switcher")).toHaveClass(
      "command-palette-title",
      "title",
    );
    expect(container.querySelector("a")).toBeNull();
  });

  it("closes the palette and opens its node's home when clicked", async () => {
    const { router, onChoose } = renderResult(COMPONENT_NODE);
    fireEvent.click(screen.getByRole("option"));
    expect(onChoose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.getState().location.pathname).toBe(COMPONENT_HREF);
    });
  });

  it("is a disabled option, described as having no page, that does nothing when its type has no home", () => {
    const { router, onChoose } = renderResult(STATION_NODE);
    const navigate = vi.spyOn(router, "navigate");
    const option = screen.getByRole("option", { name: /Layton/ });
    expect(option).toHaveAttribute("aria-disabled", "true");
    expect(option).toHaveAccessibleDescription(
      "This result has no page on this site.",
    );
    fireEvent.click(option);
    expect(onChoose).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("throws when its home matches no route of the site's router", () => {
    const environment = createSearchEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: () => COMPONENT_NODE,
      }),
    );
    const onChoose = vi.fn();
    const errors: unknown[] = [];
    const captureError = (event: ErrorEvent): void => {
      event.preventDefault();
      errors.push(event.error);
    };
    window.addEventListener("error", captureError);
    render(
      createSiteTree({
        environment,
        router: createSiteRouter(),
        children: (
          <HomesProvider homes={{ Component: () => "/nowhere" }}>
            <ul>
              <ResultOverNode onChoose={onChoose} role="option" />
            </ul>
          </HomesProvider>
        ),
      }),
    );
    fireEvent.click(screen.getByRole("option"));
    window.removeEventListener("error", captureError);
    expect(onChoose).not.toHaveBeenCalled();
    expect(String(errors.at(0))).toContain(
      "The home /nowhere of ds:global.component.layout-switcher matches no route",
    );
  });
});
