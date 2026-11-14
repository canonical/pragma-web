import {
  createEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { afterEach, describe, expect, it } from "vitest";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import componentEntityRecordsButton from "./__fixtures__/componentEntityRecordsButton.js";
import { componentEntityVariables } from "./entityQuery.js";
import warmComponentEntity from "./warmComponentEntity.js";

const BUTTON = { uri: "ds:global.component.button" };
const BUTTON_IRI = "https://ds.canonical.com/global.component.button";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmComponentEntity", () => {
  it("prefetches the entity query with the entity page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmComponentEntity(BUTTON);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("ComponentEntityQuery");
    expect(variables).toEqual(componentEntityVariables(BUTTON));
  });

  it("settles at once when no environment is published", async () => {
    await expect(warmComponentEntity(BUTTON)).resolves.toBeUndefined();
  });

  it("warms the component's Turtle at the IRI it answers with", async () => {
    const fetchFn = createFetchSpy();
    fetchFn.mockImplementation((request) =>
      Promise.resolve(
        request.name === "EntitySourceQuery"
          ? { data: { source: "<s> a <o> ." } }
          : { errors: [{ message: "the store holds the component" }] },
      ),
    );
    const environment = createEnvironment({
      records: componentEntityRecordsButton,
      fetchFn,
    });
    setPrefetchEnvironment(environment);
    const warmed = warmComponentEntity(BUTTON, { as: "turtle" });
    setPrefetchEnvironment(undefined);
    await warmed;

    expect(
      fetchFn.mock.calls.map(([request, variables]) => [
        request.name,
        variables,
      ]),
    ).toContainEqual(["EntitySourceQuery", { uri: BUTTON_IRI }]);
  });

  it("warms no Turtle for an address no component answers to", async () => {
    const fetchFn = createFetchSpy();
    fetchFn.mockResolvedValue({ data: { component: null } });
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    await warmComponentEntity(BUTTON, { as: "turtle" });

    expect(fetchFn.mock.calls.map(([request]) => request.name)).toEqual([
      "ComponentEntityQuery",
    ]);
  });
});
