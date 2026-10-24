/**
 * The lens's components take the native props of their root element and
 * spread them onto it, so a site can give any of them an `id`, a `data-*`
 * hook or a class of its own, which merges after the component's own.
 */

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { useLazyLoadQuery } from "react-relay";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  METRO_NAMESPACES,
  NORTHGATE_CURIE,
  STATIONS_BINDING,
} from "../../../testing/fixtures.js";
import type { EntityPageQuery } from "../../__generated__/EntityPageQuery.graphql.js";
import entityPageQueryNode from "../../__generated__/EntityPageQuery.graphql.js";
import buildEntityPageVariables from "../../lib/buildEntityPageVariables.js";
import { EntityFilterProvider } from "../../lib/ui/EntityFilterProvider/index.js";
import { EntityIndex } from "../../lib/ui/EntityIndexPage/common/index.js";
import { EntityIndexPage } from "../../lib/ui/EntityIndexPage/index.js";
import {
  EntityControls,
  EntityStatus,
} from "../../lib/ui/EntityLayout/common/index.js";
import { EntityLayout } from "../../lib/ui/EntityLayout/index.js";
import {
  EntityDetail,
  EntityHeading,
  EntitySummary,
  FieldList,
  KeyValueList,
  Relations,
} from "../../lib/ui/EntityPage/common/index.js";
import { EntityPage } from "../../lib/ui/EntityPage/index.js";

/** The native props each probed root receives, derived from `name`. */
const nativeProps = (name: string) =>
  ({ className: "site", "data-probe": name, id: `${name}-root` }) as const;

/** Expect the root carrying `name`'s native props to merge its class. */
const expectRoot = (name: string, componentClass: string): void => {
  const root = document.getElementById(`${name}-root`);
  expect(root, name).toHaveAttribute("data-probe", name);
  expect(root?.className, name).toBe(`ds ${componentClass} site`);
};

/** The entity page's parts over the warm store, each given native props. */
const EntityPartsProbe = () => {
  const { node } = useLazyLoadQuery<EntityPageQuery>(
    entityPageQueryNode,
    buildEntityPageVariables(
      STATIONS_BINDING,
      NORTHGATE_CURIE,
      METRO_NAMESPACES,
    ),
  );
  if (node === null || node === undefined) throw new Error("no Northgate");
  return (
    <>
      <EntityHeading
        address={node._meta.curie}
        title={node._meta.title}
        {...nativeProps("heading")}
      />
      <EntitySummary node={node} {...nativeProps("summary")} />
      <KeyValueList
        pairs={[{ id: "probe", term: "Term", value: "Value" }]}
        {...nativeProps("key-values")}
      />
      <FieldList
        meta={node._meta}
        namespaces={METRO_NAMESPACES}
        {...nativeProps("fields")}
      />
      <Relations
        meta={node._meta}
        namespaces={METRO_NAMESPACES}
        {...nativeProps("relations")}
      />
    </>
  );
};

/** Render `children` at `url` over a store the route's warm filled. */
const renderWarm = async (url: string, children: ReactNode) => {
  const { environment } = await createWarmEnvironment(url);
  render(createEntitySite({ url, environment, children }));
};

describe("native props", () => {
  it("reach the root of the index page and the index", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderWarm(
      "/stations",
      <>
        <EntityIndexPage
          binding={STATIONS_BINDING}
          label="Stations"
          {...nativeProps("index-page")}
        />
        <EntityIndex binding={STATIONS_BINDING} {...nativeProps("index")} />
      </>,
    );
    expectRoot("index-page", "entity-index-page");
    expectRoot("index", "entity-index");
  });

  it("reach the root of the entity page and each of its parts", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderWarm(
      "/stations/metro%3Anorthgate",
      <>
        <EntityPage
          binding={STATIONS_BINDING}
          label="Stations"
          uri={NORTHGATE_CURIE}
          {...nativeProps("page")}
        />
        <EntityDetail
          binding={STATIONS_BINDING}
          label="Stations"
          uri={NORTHGATE_CURIE}
          {...nativeProps("detail")}
        />
        <EntityPartsProbe />
      </>,
    );
    expectRoot("page", "entity-page");
    expectRoot("detail", "entity-detail");
    expectRoot("heading", "entity-heading");
    expectRoot("summary", "entity-summary");
    expectRoot("key-values", "key-value-list");
    expectRoot("fields", "field-list");
    expectRoot("relations", "relations");
  });

  it("reach the root of the layout", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderWarm(
      "/stations",
      <EntityLayout
        binding={STATIONS_BINDING}
        label="Stations"
        rail={null}
        {...nativeProps("layout")}
      >
        {null}
      </EntityLayout>,
    );
    expectRoot("layout", "document-layout");
  });

  it("reach the root of the strip's controls and status", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderWarm(
      "/stations",
      <EntityFilterProvider>
        <EntityControls {...nativeProps("controls")} />
        <EntityStatus binding={STATIONS_BINDING} {...nativeProps("status")} />
      </EntityFilterProvider>,
    );
    expectRoot("controls", "entity-controls");
    expectRoot("status", "entity-status");
  });
});
