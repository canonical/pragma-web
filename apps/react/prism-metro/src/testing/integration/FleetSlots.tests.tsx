import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import cardQuery, {
  type FleetSlotsCardTestQuery,
} from "#relay/__generated__/FleetSlotsCardTestQuery.graphql.js";
import chipQuery, {
  type FleetSlotsChipTestQuery,
} from "#relay/__generated__/FleetSlotsChipTestQuery.graphql.js";
import commandQuery, {
  type FleetSlotsCommandTestQuery,
} from "#relay/__generated__/FleetSlotsCommandTestQuery.graphql.js";
import graphNodeQuery, {
  type FleetSlotsGraphNodeTestQuery,
} from "#relay/__generated__/FleetSlotsGraphNodeTestQuery.graphql.js";
import rowQuery, {
  type FleetSlotsRowTestQuery,
} from "#relay/__generated__/FleetSlotsRowTestQuery.graphql.js";
import createProjectionTree from "../../../testing/createProjectionTree.js";
import {
  MOCK_CAR_TYPE,
  MOCK_FORMATION,
  MOCK_ROLLING_STOCK,
  MOCK_UNIT,
  resolveRoot,
} from "../../../testing/fixtures.js";
import { SiteCardSlot } from "../../domains/metro/lib/SiteCardSlot/index.js";
import { SiteChipSlot } from "../../domains/metro/lib/SiteChipSlot/index.js";
import { SiteCommandSlot } from "../../domains/metro/lib/SiteCommandSlot/index.js";
import { SiteGraphNodeSlot } from "../../domains/metro/lib/SiteGraphNodeSlot/index.js";
import { SiteRowSlot } from "../../domains/metro/lib/SiteRowSlot/index.js";

/**
 * The operations the tests render each site slot under: one node, read
 * through the `node` field, its site slot spread as the package's
 * dispatcher spreads it.
 */
const declareTestQueries = (): unknown => [
  graphql`
    query FleetSlotsChipTestQuery @relay_test_operation {
      node(id: "chip") {
        ...SiteChipSlot_node
      }
    }
  `,
  graphql`
    query FleetSlotsRowTestQuery @relay_test_operation {
      node(id: "row") {
        ...SiteRowSlot_node
      }
    }
  `,
  graphql`
    query FleetSlotsCardTestQuery @relay_test_operation {
      node(id: "card") {
        ...SiteCardSlot_node
      }
    }
  `,
  graphql`
    query FleetSlotsCommandTestQuery @relay_test_operation {
      node(id: "command") {
        ...SiteCommandSlot_node
      }
    }
  `,
  graphql`
    query FleetSlotsGraphNodeTestQuery @relay_test_operation {
      node(id: "graph-node") {
        ...SiteGraphNodeSlot_node
      }
    }
  `,
];
void declareTestQueries;

/** The fleet's types, each with the node a mock environment answers it as. */
const FLEET_TYPES = [
  ["RollingStock", MOCK_ROLLING_STOCK, "rolling-stock"],
  ["Formation", MOCK_FORMATION, "formation"],
  ["Unit", MOCK_UNIT, "unit"],
  ["CarType", MOCK_CAR_TYPE, "car-type"],
] as const;

/**
 * Render `children` under the site's providers, over a Relay mock
 * environment that answers `entity` for the operation's root field.
 */
const renderOver = (entity: object, children: ReactElement) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, { Node: resolveRoot(entity) }),
  );
  return render(createProjectionTree(environment, children));
};

/** The chip slot over the node its operation answers, as `typename`. */
const ChipOverNode = ({ typename }: { typename: string }): ReactElement => {
  const data = useLazyLoadQuery<FleetSlotsChipTestQuery>(chipQuery, {});
  if (!data.node) throw new Error("the mock environment resolved no node");
  return <SiteChipSlot node={data.node} typename={typename} />;
};

/** The row slot over the node its operation answers, as `typename`. */
const RowOverNode = ({ typename }: { typename: string }): ReactElement => {
  const data = useLazyLoadQuery<FleetSlotsRowTestQuery>(rowQuery, {});
  if (!data.node) throw new Error("the mock environment resolved no node");
  return (
    <ul>
      <SiteRowSlot node={data.node} typename={typename} />
    </ul>
  );
};

/** The card slot over the node its operation answers, as `typename`. */
const CardOverNode = ({ typename }: { typename: string }): ReactElement => {
  const data = useLazyLoadQuery<FleetSlotsCardTestQuery>(cardQuery, {});
  if (!data.node) throw new Error("the mock environment resolved no node");
  return <SiteCardSlot node={data.node} typename={typename} />;
};

/** The command slot over the node its operation answers, as `typename`. */
const CommandOverNode = ({ typename }: { typename: string }): ReactElement => {
  const data = useLazyLoadQuery<FleetSlotsCommandTestQuery>(commandQuery, {});
  if (!data.node) throw new Error("the mock environment resolved no node");
  return (
    <ul>
      <SiteCommandSlot node={data.node} typename={typename} />
    </ul>
  );
};

/** The graph node slot over the node its operation answers, as `typename`. */
const GraphNodeOverNode = ({
  typename,
}: {
  typename: string;
}): ReactElement => {
  const data = useLazyLoadQuery<FleetSlotsGraphNodeTestQuery>(
    graphNodeQuery,
    {},
  );
  if (!data.node) throw new Error("the mock environment resolved no node");
  return (
    <svg aria-label="Graph" role="img">
      <SiteGraphNodeSlot node={data.node} typename={typename} />
    </svg>
  );
};

describe("the site slots over the fleet's types", () => {
  it.each(FLEET_TYPES)(
    "chip a %s through its arm",
    (typename, entity, kebab) => {
      const { container } = renderOver(
        entity,
        <ChipOverNode typename={typename} />,
      );
      expect(container.querySelector(`.ds.${kebab}-chip`)).toHaveAttribute(
        "data-type",
        typename,
      );
    },
  );

  it.each(FLEET_TYPES)(
    "row a %s through its arm",
    (typename, entity, kebab) => {
      const { container } = renderOver(
        entity,
        <RowOverNode typename={typename} />,
      );
      expect(container.querySelector(`.ds.${kebab}-row`)).toHaveAttribute(
        "data-type",
        typename,
      );
    },
  );

  it.each(FLEET_TYPES)(
    "card a %s through its arm",
    (typename, entity, kebab) => {
      const { container } = renderOver(
        entity,
        <CardOverNode typename={typename} />,
      );
      expect(container.querySelector(`.ds.${kebab}-card`)).toHaveAttribute(
        "data-type",
        typename,
      );
    },
  );

  it.each(FLEET_TYPES)(
    "command a %s through its arm",
    (typename, entity, kebab) => {
      const { container } = renderOver(
        entity,
        <CommandOverNode typename={typename} />,
      );
      expect(container.querySelector(`.ds.${kebab}-command`)).toHaveAttribute(
        "data-type",
        typename,
      );
    },
  );

  it.each(FLEET_TYPES)(
    "draw a %s as a graph node through its arm",
    (typename, entity, kebab) => {
      const { container } = renderOver(
        entity,
        <GraphNodeOverNode typename={typename} />,
      );
      expect(
        container.querySelector(`.ds.${kebab}-graph-node`),
      ).toHaveAttribute("data-type", typename);
    },
  );
});
