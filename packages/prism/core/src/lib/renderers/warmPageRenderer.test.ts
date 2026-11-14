import {
  createOperationDescriptor,
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
} from "relay-runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setPrefetchEnvironment } from "../relay/index.js";
import { ENTITY_SOURCE_QUERY } from "../ui/EntitySource/constants.js";
import warmPageRenderer from "./warmPageRenderer.js";

const URI = "https://metro.example/data/central";

/** An environment whose network answers every request with `answer`. */
const createEnvironment = (
  answer: () => ReturnType<typeof Observable.from>,
) => {
  const fetchSource = vi.fn(answer);
  const environment = new Environment({
    network: Network.create(fetchSource),
    store: new Store(new RecordSource()),
  });
  return { environment, fetchSource };
};

/** What the store holds for `URI`'s source. */
const readStored = (environment: Environment): unknown =>
  environment.lookup(
    createOperationDescriptor(ENTITY_SOURCE_QUERY, { uri: URI }).fragment,
  ).data;

describe("warmPageRenderer", () => {
  afterEach(() => setPrefetchEnvironment(undefined));

  it("fetches the entity's Turtle into the store when the address asks for it", async () => {
    const { environment, fetchSource } = createEnvironment(() =>
      Observable.from({ data: { source: "<s> a <o> ." } }),
    );
    await warmPageRenderer(URI, { as: "turtle" }, environment);
    expect(fetchSource).toHaveBeenCalledTimes(1);
    expect(readStored(environment)).toEqual({ source: "<s> a <o> ." });
    // A warm store answers the next warm without a request.
    await warmPageRenderer(URI, { as: "turtle" }, environment);
    expect(fetchSource).toHaveBeenCalledTimes(1);
  });

  it("asks nothing for the page renderer or an address without as", async () => {
    const { environment, fetchSource } = createEnvironment(() =>
      Observable.from({ data: { source: "" } }),
    );
    await warmPageRenderer(URI, { as: "page" }, environment);
    await warmPageRenderer(URI, {}, environment);
    expect(fetchSource).not.toHaveBeenCalled();
  });

  it("warms the published prefetch environment when given none", async () => {
    const { environment, fetchSource } = createEnvironment(() =>
      Observable.from({ data: { source: null } }),
    );
    setPrefetchEnvironment(environment);
    await warmPageRenderer(URI, { as: "turtle" });
    expect(fetchSource).toHaveBeenCalledTimes(1);
    expect(readStored(environment)).toEqual({ source: null });
  });

  it("settles without an environment", async () => {
    await expect(
      warmPageRenderer(URI, { as: "turtle" }),
    ).resolves.toBeUndefined();
  });

  it("settles when the request fails, leaving the store cold", async () => {
    const { environment } = createEnvironment(() =>
      Observable.create((sink) => sink.error(new Error("down"))),
    );
    await expect(
      warmPageRenderer(URI, { as: "turtle" }, environment),
    ).resolves.toBeUndefined();
    expect(readStored(environment)).toEqual({ source: undefined });
  });
});
