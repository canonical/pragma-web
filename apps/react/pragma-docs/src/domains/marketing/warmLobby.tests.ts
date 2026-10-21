import { afterEach, describe, expect, it } from "vitest";
import { createEnvironment, setPrefetchEnvironment } from "#relay";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import { lobbyVariables } from "./lobbyQuery.js";
import warmLobby from "./warmLobby.js";

afterEach(() => {
  // The prefetch environment is module state shared across this file's tests.
  setPrefetchEnvironment(undefined);
});

describe("warmLobby", () => {
  it("prefetches the lobby query with the lobby page's variables", () => {
    const fetchFn = createFetchSpy();
    setPrefetchEnvironment(createEnvironment({ fetchFn }));

    void warmLobby();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request, variables] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("LobbyQuery");
    expect(variables).toEqual(lobbyVariables());
  });
});
