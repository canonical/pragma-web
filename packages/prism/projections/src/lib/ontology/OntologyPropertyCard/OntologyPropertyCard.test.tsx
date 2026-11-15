// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_ONTOLOGY_PROPERTY,
  MOCK_ONTOLOGY_PROPERTY_HREF,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type OntologyPropertyCardTestQuery,
} from "../../../__generated__/OntologyPropertyCardTestQuery.graphql.js";
import { AmbientNamespaceProvider } from "../../projections/index.js";
import OntologyPropertyCard from "./OntologyPropertyCard.js";
import type { OntologyPropertyCardProps } from "./types.js";

/**
 * The operation the tests render OntologyPropertyCard under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareTestQuery = (): unknown => graphql`
  query OntologyPropertyCardTestQuery @relay_test_operation {
    ontologyProperty(uri: "test") {
      ...OntologyPropertyCard_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const OntologyPropertyCardTestNode = ({
  children,
}: {
  children: (node: OntologyPropertyCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyCardTestQuery>(testQuery, {});
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return children(node);
};

/**
 * Render `children` with the key of the OntologyProperty a Relay mock
 * environment answers, under the site's providers: `entity` over the matrix's
 * object property `modifier`. `unvalidated` is written over the answer after it
 * is generated.
 */
const renderWithNode = (
  children: (node: OntologyPropertyCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
  unvalidated: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) => {
    const payload = MockPayloadGenerator.generate(operation, {
      OntologyProperty: resolveRoot({ ...MOCK_ONTOLOGY_PROPERTY, ...entity }),
    });
    // A value the contract may add later, such as a new enum member, which
    // the generator refuses: written over the answer it generated.
    return {
      ...payload,
      data: {
        ...payload.data,
        ontologyProperty: { ...payload.data?.ontologyProperty, ...unvalidated },
      },
    };
  });
  return render(
    createSiteTree(
      environment,
      <OntologyPropertyCardTestNode>{children}</OntologyPropertyCardTestNode>,
    ),
  );
};

describe("OntologyPropertyCard", () => {
  it("reads the OntologyProperty through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <OntologyPropertyCard node={node} />
    ));
    expect(
      container.querySelector(".ds.ontology-property-card"),
    ).toHaveAttribute("data-type", "OntologyProperty");
  });

  it("fills the card's slots from the property, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <OntologyPropertyCard node={node} />
    ));
    expectSlotOrder(container);
    expect(container.querySelector(".mark use")?.getAttribute("href")).toBe(
      "/icons/tag.svg#tag",
    );
    expect(
      [...container.querySelectorAll(".title, .summary, .term, .detail")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "Modifier",
      "The modifier that changes how a block looks or behaves.",
      "Domain",
      "UIBlock",
      "Range",
      "ds:Modifier",
      "Inverse",
      "Modifies",
    ]);
    expect(
      [...container.querySelectorAll(".fact")].map((fact) =>
        fact.getAttribute("data-property"),
      ),
    ).toEqual(["domain", "range", "inverse"]);
    expect(
      container.querySelector(".detail code.identifier")?.textContent,
    ).toBe("ds:Modifier");
    expect(container.querySelector(".prefix")?.textContent).toBe("ds:");
    expect(container.querySelector(".address, .kind, .status")).toBeNull();
  });

  it("links its name to the property's home", () => {
    renderWithNode((node) => <OntologyPropertyCard node={node} />);
    expect(
      screen.getByRole("link", { name: "Modifier" }).getAttribute("href"),
    ).toBe(MOCK_ONTOLOGY_PROPERTY_HREF);
  });

  it("states no domain when the property is declared on no class", () => {
    const { container } = renderWithNode(
      (node) => <OntologyPropertyCard node={node} />,
      { domain: null },
    );
    expect(container.querySelector('[data-property="domain"]')).toBeNull();
  });

  it("names a property and its inverse without labels by their local names", () => {
    const { container } = renderWithNode(
      (node) => <OntologyPropertyCard node={node} />,
      {
        label: null,
        inverse: { uri: "https://ds.canonical.com/modifies", label: null },
      },
    );
    expect(container.querySelector(".title")?.textContent).toBe("modifier");
    expect(
      container.querySelector('[data-property="inverse"] .detail')?.textContent,
    ).toBe("modifies");
  });

  it("states no inverse when the property has none", () => {
    const { container } = renderWithNode(
      (node) => <OntologyPropertyCard node={node} />,
      { inverse: null },
    );
    expect(
      [...container.querySelectorAll(".term")].map((term) => term.textContent),
    ).toEqual(["Domain", "Range"]);
  });

  it("marks a functional property as its status", () => {
    const { container } = renderWithNode(
      (node) => <OntologyPropertyCard node={node} />,
      { functional: true },
    );
    expect(container.querySelector(".status")?.textContent).toBe("functional");
  });

  it("renders no summary for a property without a definition", () => {
    const { container } = renderWithNode(
      (node) => <OntologyPropertyCard node={node} />,
      { definition: null },
    );
    expect(container.querySelector(".summary")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <OntologyPropertyCard className="custom-class" node={node} />
    ));
    expect(
      container
        .querySelector(".ds.ontology-property-card")
        ?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds ontology-property-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <OntologyPropertyCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });

  it("shows its namespace's prefix only off the page's namespace", () => {
    const foreign = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <OntologyPropertyCard node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(foreign.container.querySelector(".prefix")?.textContent).toBe("ds:");
    foreign.unmount();
    const own = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="ds">
        <OntologyPropertyCard node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(own.container.querySelector(".prefix")).toBeNull();
  });
});
