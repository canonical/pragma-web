import { createEnvironment } from "@canonical/prism-core";
import { render, screen, within } from "@testing-library/react";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createFetchSpy from "../../../testing/createFetchSpy.js";
import createRecordedFetch from "../../../testing/createRecordedFetch.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  CENTRAL_EXCHANGE_CURIE,
  CIRCLE_LINE_CURIE,
  ENTITY_TEST_TIMEOUT_MS,
  NORTHGATE_CURIE,
  NORTHGATE_IRI,
  UNKNOWN_ADDRESS,
} from "../../../testing/fixtures.js";
import { MESSAGES } from "../i18n/index.js";
import EntityPage from "./EntityPage.js";

/** A station whose class's graph carries a comment and no definition. */
const HARBOURSIDE_CURIE = "metro:harbourside";

/** A fare zone, whose class declares no relation. */
const COASTAL_ZONE_CURIE = "geo:coastal-zone";

/** The annotation property every station inherits. */
const NOTE_IRI = "https://metro.example/onto#note";

/** The stations lens's entity URL for an address. */
const stationUrl = (address: string): string =>
  `/stations/${encodeURIComponent(address)}`;

/** Render the entity route at `address` over a store its warm filled. */
const renderStation = async (address: string) => {
  const url = stationUrl(address);
  const { environment, fetchFn } = await createWarmEnvironment(url);
  return { fetchFn, ...render(createEntitySite({ url, environment })) };
};

/** Read each body row of the fields table as its cells' text. */
const readFieldRows = (): string[][] =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      [...row.querySelectorAll(".cell")].map((cell) => cell.textContent ?? ""),
    );

describe("EntityPage", () => {
  it("renders a station reached by its compact address, from the warm store", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { fetchFn } = await renderStation(NORTHGATE_CURIE);

    expect(
      screen.getByRole("heading", { level: 1, name: "Northgate" }),
    ).toBeInTheDocument();
    expect(screen.getByText(NORTHGATE_CURIE)).toBeInTheDocument();
    expect(screen.getByText("The northern terminus.")).toBeInTheDocument();
    expect(
      document.querySelector(".ds.entity-summary .type")?.textContent,
    ).toBe("Instance of Station");
    expect(document.querySelector(".ds.entity-summary .comment")).toBeNull();
    expect(document.querySelector("title")?.textContent).toBe(
      "Northgate — Stations",
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("renders the same station reached by its absolute IRI", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(NORTHGATE_IRI);
    expect(
      screen.getByRole("heading", { level: 1, name: "Northgate" }),
    ).toBeInTheDocument();
  });

  it("tables the six fields of the station's class, own and inherited", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(NORTHGATE_CURIE);

    expect(readFieldRows()).toEqual([
      [
        "platformCount",
        "metro:platformCount",
        "Datatype",
        "Int",
        "at most one",
      ],
      ["servesLine", "metro:servesLine", "Object", "metro:Line", "one or more"],
      ["location", "geo:location", "Object", "geo:GeoPoint", "at most one"],
      ["inZone", "geo:inZone", "Object", "geo:Zone", "at most one"],
      ["nameinherited", "metro:name", "Datatype", "String", "exactly one"],
      ["noteinherited", "metro:note", "Annotation", "String", "at most one"],
    ]);
  });

  it("lists the object-kind fields as the class's relations", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(NORTHGATE_CURIE);

    const relations = screen.getByRole("region", { name: "Relations" });
    expect(
      within(relations)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual([
      "servesLine to metro:Line, one or more",
      "location to geo:GeoPoint, at most one",
      "inZone to geo:Zone, at most one",
    ]);
  });

  it("accepts an instance of a subclass of the bound class", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(CENTRAL_EXCHANGE_CURIE);
    expect(
      screen.getByRole("heading", { level: 1, name: "Central Exchange" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector(".ds.entity-summary .type")?.textContent,
    ).toBe("Instance of Interchange");
  });

  it("renders the comment the graph asserts, after the definition", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(HARBOURSIDE_CURIE);
    expect(
      document.querySelector(".ds.entity-summary .comment")?.textContent,
    ).toBe("Step-free to all platforms.");
    expect(document.querySelector(".ds.entity-summary .definition")).toBeNull();
  });

  it("says so when the class declares no relation", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    render(
      createEntitySite({
        url: stationUrl(COASTAL_ZONE_CURIE),
        environment: createEnvironment({ fetchFn: createRecordedFetch() }),
        children: (
          <EntityPage
            binding={{ id: "zones", classUri: "geo:Zone", typename: "Zone" }}
            label="Zones"
            uri={COASTAL_ZONE_CURIE}
          />
        ),
      }),
    );
    const relations = await screen.findByRole("region", { name: "Relations" });
    expect(relations).toHaveTextContent(MESSAGES["relations.empty"]);
    expect(within(relations).queryByRole("list")).toBeNull();
  });

  it("names a property kind the contract does not, by the graph's own word", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = stationUrl(NORTHGATE_CURIE);
    const warm = await createWarmEnvironment(url);
    // A newer contract's kind on one property, as a provider ahead of this
    // lens would serve it.
    const records = warm.environment
      .getStore()
      .getSource()
      .toJSON() as RecordMap;
    const environment = createEnvironment({
      records: {
        ...records,
        [NOTE_IRI]: { ...records[NOTE_IRI], kind: "RELATION" },
      },
      fetchFn: createFetchSpy(),
    });
    render(createEntitySite({ url, environment }));

    expect(readFieldRows().at(-1)).toEqual([
      "noteinherited",
      "metro:note",
      "RELATION",
      "String",
      "at most one",
    ]);
  });

  it("renders not-found for a node of another class", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(CIRCLE_LINE_CURIE);
    expect(screen.getByRole("status")).toHaveTextContent(
      `Nothing in the graph answers to ${CIRCLE_LINE_CURIE}.`,
    );
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(document.querySelector("title")?.textContent).toBe(
      `${CIRCLE_LINE_CURIE} — Stations`,
    );
  });

  it("renders not-found for an address nothing answers to", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    await renderStation(UNKNOWN_ADDRESS);
    expect(screen.getByRole("status")).toHaveTextContent(
      `Nothing in the graph answers to ${UNKNOWN_ADDRESS}.`,
    );
  });

  it("renders not-found when the graph does not know the bound class", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const url = stationUrl(NORTHGATE_CURIE);
    const { environment } = await createWarmEnvironment(url);
    render(
      createEntitySite({
        url,
        environment,
        children: (
          <EntityPage
            binding={{
              id: "stations",
              classUri: "metro:Nowhere",
              typename: "Station",
            }}
            label="Stations"
            uri={NORTHGATE_CURIE}
          />
        ),
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      `Nothing in the graph answers to ${NORTHGATE_CURIE}.`,
    );
  });

  it("shows its loading state over a cold store", () => {
    render(
      createEntitySite({
        url: stationUrl(NORTHGATE_CURIE),
        environment: createEnvironment({ fetchFn: createFetchSpy() }),
      }),
    );
    expect(screen.getByText(MESSAGES["page.loading"])).toBeInTheDocument();
  });
});
