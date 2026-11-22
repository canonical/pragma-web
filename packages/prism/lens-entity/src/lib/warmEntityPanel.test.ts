import { createEnvironment } from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import createFetchSpy from "../../testing/createFetchSpy.js";
import { NORTHGATE_IRI } from "../../testing/fixtures.js";
import warmEntityPanel from "./warmEntityPanel.js";

/** A fetch that answers every operation with nothing found. */
const createEmptyFetch = (): ReturnType<typeof createFetchSpy> => {
  const fetchFn = createFetchSpy();
  fetchFn.mockImplementation((request) =>
    Promise.resolve({
      data:
        request.name === "EntityNamespacesQuery"
          ? { ontologies: [] }
          : request.name === "EntityPanelQuery"
            ? { node: null }
            : { outgoing: null, incoming: null },
    }),
  );
  return fetchFn;
};

describe("warmEntityPanel", () => {
  it("asks for the three operations the panel reads, for the IRI it names", async () => {
    const fetchFn = createEmptyFetch();
    await warmEntityPanel(createEnvironment({ fetchFn }), NORTHGATE_IRI);
    expect(
      fetchFn.mock.calls.map(([request, variables]) => [
        request.name,
        variables,
      ]),
    ).toEqual([
      ["EntityNamespacesQuery", {}],
      ["EntityPanelQuery", { id: NORTHGATE_IRI }],
      ["EntityStatementsQuery", { uri: NORTHGATE_IRI }],
    ]);
  });

  it("settles when the provider refuses the statements it does not serve", async () => {
    const fetchFn = createEmptyFetch();
    const answer = fetchFn.getMockImplementation();
    fetchFn.mockImplementation((request, ...rest) =>
      request.name === "EntityStatementsQuery"
        ? Promise.reject(new Error('Cannot query field "statements"'))
        : (answer?.(request, ...rest) ?? Promise.reject(new Error("none"))),
    );
    await expect(
      warmEntityPanel(createEnvironment({ fetchFn }), NORTHGATE_IRI),
    ).resolves.toBeUndefined();
  });

  it("makes no request when the store already holds the panel's data", async () => {
    const fetchFn = createEmptyFetch();
    const environment = createEnvironment({ fetchFn });
    await warmEntityPanel(environment, NORTHGATE_IRI);
    fetchFn.mockClear();
    await warmEntityPanel(environment, NORTHGATE_IRI);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
