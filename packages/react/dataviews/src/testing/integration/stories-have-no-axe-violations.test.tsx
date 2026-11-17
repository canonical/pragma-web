/**
 * Every swept story has no axe violation once rendered or played. jsdom lays
 * nothing out, so contrast is left to a browser.
 */

import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import { afterAll, describe, it } from "vitest";
import preview from "../../../.storybook/preview.js";
import expectNoAxeViolations from "../../../testing/expectNoAxeViolations.js";
import { FACETED_FILTER_STORIES } from "../../../testing/fixtures.js";
import serveMockApi from "../../../testing/serveMockApi.js";
import * as dataCardsStories from "../../lib/_work_in_progress/DataCards/DataCards.stories.js";
import * as dataChartStories from "../../lib/_work_in_progress/DataChart/DataChart.stories.js";
import * as dataChartWithTableStories from "../../lib/_work_in_progress/DataChartWithTable/DataChartWithTable.stories.js";
import * as tableStories from "../../lib/_work_in_progress/DataTable/DataTable.stories.js";
import * as filtersStories from "../../lib/_work_in_progress/DataViews/common/Filters/Filters.stories.js";
import * as settingsStories from "../../lib/_work_in_progress/DataViews/common/Settings/Settings.stories.js";
import * as panelStories from "../../lib/_work_in_progress/DataViews/common/SortPanel/SortPanel.stories.js";
import * as compositionStories from "../../lib/_work_in_progress/DataViews/DataViews.composition.stories.js";
import * as graphqlStories from "../../lib/_work_in_progress/DataViews/DataViews.graphql.stories.js";
import * as restStories from "../../lib/_work_in_progress/DataViews/DataViews.rest.stories.js";
import * as rootStories from "../../lib/_work_in_progress/DataViews/DataViews.stories.js";
import {
  createGraphQLHandlers,
  createRestHandlers,
} from "../../storybook/machines/api/index.js";

// The package's own preview, as Storybook applies it, so every story here
// renders with the parameters and annotations it has in Storybook.
setProjectAnnotations([preview]);

// Storybook's MSW addon serves the stories' handlers through a service
// worker, which jsdom lacks: msw/node answers the same handlers here instead.
serveMockApi([...createRestHandlers(), ...createGraphQLHandlers()]);

/** The composition's stories over a link the provider refused a clause of. */
const REFUSED_LINK_STORIES: ReadonlySet<string> = new Set([
  "LinkWithARefusedFilter",
  "LinkWithARefusedSort",
]);

/** The filters' stories checked once played: faceted, or clearing a row. */
const PLAYED_FILTER_STORIES: ReadonlySet<string> = new Set([
  ...FACETED_FILTER_STORIES,
  "FurtherConjunctsApplied",
]);

const filters = Object.entries(composeStories(filtersStories));

/** The stories checked as first rendered, by the part they show. */
const rendered = {
  DataViews: composeStories(rootStories),
  DataTable: composeStories(tableStories),
  SortPanel: composeStories(panelStories),
  Settings: composeStories(settingsStories),
  Filters: Object.fromEntries(
    filters.filter(([name]) => !PLAYED_FILTER_STORIES.has(name)),
  ),
};

/** The stories checked once their play function has run, by part. */
const played = {
  "REST API": composeStories(restStories),
  "GraphQL API": composeStories(graphqlStories),
  DataCards: composeStories(dataCardsStories),
  DataChart: composeStories(dataChartStories),
  DataChartWithTable: composeStories(dataChartWithTableStories),
  // The links with a refused clause, on a memory location and no mock API.
  Composition: Object.fromEntries(
    Object.entries(composeStories(compositionStories)).filter(([name]) =>
      REFUSED_LINK_STORIES.has(name),
    ),
  ),
  Filters: Object.fromEntries(
    filters.filter(([name]) => PLAYED_FILTER_STORIES.has(name)),
  ),
};

describe("stories have no axe violations", () => {
  for (const [part, stories] of Object.entries(rendered)) {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${part} ${name}`, async () => {
        const { container } = render(<Story />);
        await expectNoAxeViolations(container);
      });
    }
  }

  for (const [part, stories] of Object.entries(played)) {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${part} ${name}`, async () => {
        // A story's run removes the one before it; its own markup is in the
        // page until the next.
        await Story.run();
        await expectNoAxeViolations(document.body);
      });
    }
  }

  // The last story run is removed by no later one.
  afterAll(() => {
    document.body.innerHTML = "";
  });
});
