import { createEnvironment } from "@canonical/prism-core";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import createEntitySite from "../../../testing/createEntitySite.js";
import createRecordedFetch from "../../../testing/createRecordedFetch.js";
import createWarmEnvironment from "../../../testing/createWarmEnvironment.js";
import {
  ENTITY_TEST_TIMEOUT_MS,
  STATION_COUNT,
} from "../../../testing/fixtures.js";
import EntityFilterContext from "../EntityFilterProvider/Context.js";
import { MESSAGES } from "../i18n/constants.js";
import EntityIndexPage from "./EntityIndexPage.js";

describe("EntityIndexPage", () => {
  it("lists every station as a row linked to its home, from the warm store", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment, fetchFn } = await createWarmEnvironment("/stations");
    render(createEntitySite({ url: "/stations", environment }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Stations" }),
    ).toBeInTheDocument();
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(STATION_COUNT);
    expect(screen.getByRole("link", { name: "Northgate" })).toHaveAttribute(
      "href",
      "/stations/metro%3Anorthgate",
    );
    // An interchange is a station of its own GraphQL type, homed alike.
    expect(
      screen.getByRole("link", { name: "Central Exchange" }),
    ).toHaveAttribute("href", "/stations/metro%3Acentral-exchange");
    expect(document.querySelector("title")?.textContent).toBe("Stations");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("renders the cards view as one article per station", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment } = await createWarmEnvironment("/stations");
    render(
      createEntitySite({
        url: "/stations",
        environment,
        children: (
          <EntityFilterContext
            value={{ filter: { text: "", view: "cards" }, setFilter: () => {} }}
          >
            <EntityIndexPage
              binding={{
                id: "stations",
                classUri: "metro:Station",
                typename: "Station",
              }}
              label="Stations"
            />
          </EntityFilterContext>
        ),
      }),
    );

    expect(screen.getAllByRole("article")).toHaveLength(STATION_COUNT);
    expect(screen.queryByRole("list")).toBeNull();
    expect(document.querySelector(".ds.entity-index")).toHaveAttribute(
      "data-view",
      "cards",
    );
  });

  it("pages through the class with an explicit Load more", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    const { environment, fetchFn } = await createWarmEnvironment("/stations", {
      cap: 5,
    });
    render(createEntitySite({ url: "/stations", environment }));

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    fireEvent.click(
      screen.getByRole("button", { name: MESSAGES["index.more"] }),
    );
    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(STATION_COUNT);
    });
    expect(
      screen.queryByRole("button", { name: MESSAGES["index.more"] }),
    ).toBeNull();
    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [request] = fetchFn.mock.lastCall ?? [];
    expect(request?.name).toBe("EntityIndexPaginationQuery");
  });

  it("says so when the graph holds no instance of the class", {
    timeout: ENTITY_TEST_TIMEOUT_MS,
  }, async () => {
    render(
      createEntitySite({
        url: "/stations",
        environment: createEnvironment({ fetchFn: createRecordedFetch() }),
        children: (
          <EntityIndexPage
            binding={{
              id: "stations",
              classUri: "metro:Nowhere",
              typename: "Station",
            }}
            label="Stations"
          />
        ),
      }),
    );

    expect(screen.getByText(MESSAGES["index.loading"])).toBeInTheDocument();
    expect(
      await screen.findByText(MESSAGES["index.empty"]),
    ).toBeInTheDocument();
  });
});
