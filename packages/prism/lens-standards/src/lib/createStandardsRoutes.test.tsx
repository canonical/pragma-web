import {
  collectLenses,
  collectShortcuts,
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import createStandardsPage from "../../testing/createStandardsPage.js";
import {
  LINK_COMPONENT_URI,
  STANDARDS_BINDING_FIXTURE,
  STANDARDS_TEST_TIMEOUT_MS,
} from "../../testing/fixtures.js";
import standardEntityRecords from "../../testing/records/standardEntityRecords.js";
import standardsIndexRecords from "../../testing/records/standardsIndexRecords.js";
import createStandardsRoutes from "./createStandardsRoutes.js";
import { StandardsIcon } from "./StandardsIcon/index.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("createStandardsRoutes", () => {
  const routes = createStandardsRoutes(STANDARDS_BINDING_FIXTURE);

  it("carries exactly the two route names a site's table keeps", () => {
    expect(Object.keys(routes)).toEqual(["standards", "standardEntity"]);
    expect(routes.standards.url).toBe("/standards");
    expect(routes.standardEntity.url).toBe("/standards/:uri");
  });

  it("declares the lens on the index, and on the index only", () => {
    expect(collectLenses(routes)).toEqual([
      {
        name: "standards",
        label: "Standards",
        icon: StandardsIcon,
        order: 4,
        tier: 1,
      },
    ]);
  });

  it("claims the shortcut 4 for the index", () => {
    const { byKey, byRoute } = collectShortcuts(routes);
    expect([...byKey]).toEqual([["4", "standards"]]);
    expect(byRoute.get("standardEntity")).toBeUndefined();
  });

  it("warms the index with the binding's class", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void routes.standards.warm?.(
      {},
      {},
      {
        signal: new AbortController().signal,
      },
    );

    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardsIndexQuery");
    expect(variables).toMatchObject({ classUri: "cs:CodeStandard" });
  });

  it("warms a reading page with the binding's class and the address", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void routes.standardEntity.warm?.(
      { uri: LINK_COMPONENT_URI },
      {},
      {
        signal: new AbortController().signal,
      },
    );

    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("StandardEntityQuery");
    expect(variables).toEqual({
      uri: LINK_COMPONENT_URI,
      classUri: "cs:CodeStandard",
    });
  });

  it("mounts the index page over the binding's class", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const Content = routes.standards.content;
    const fetchFn = createFetchSpy();
    render(
      createStandardsPage(
        "/standards",
        standardsIndexRecords,
        fetchFn,
        <Content params={{}} search={{}} />,
      ),
    );

    expect(
      screen.getByRole("link", { name: "code.array.safe_access" }),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("mounts the reading page at the param's address", {
    timeout: STANDARDS_TEST_TIMEOUT_MS,
  }, () => {
    const Content = routes.standardEntity.content;
    const fetchFn = createFetchSpy();
    render(
      createStandardsPage(
        `/standards/${encodeURIComponent(LINK_COMPONENT_URI)}`,
        standardEntityRecords,
        fetchFn,
        <Content params={{ uri: LINK_COMPONENT_URI }} search={{}} />,
      ),
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "react.component.link_component",
      }),
    ).toBeInTheDocument();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("throws on a binding that names no class", () => {
    expect(() => createStandardsRoutes({ classUri: "" })).toThrow(
      /classUri must be a non-empty string/,
    );
  });
});
