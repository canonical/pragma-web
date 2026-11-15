/**
 * No part speaks English of its own: every story, given token messages
 * through its `messages` arg, shows no word of the English record beyond
 * its own data. Play functions are not run; they assert English.
 */

import type { DataViewsMessages } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import preview from "../../../.storybook/preview.js";
import { DELIVERY_WAIT } from "../../../testing/constants.js";
import createTokenMessages from "../../../testing/createTokenMessages.js";
import findEnglish from "../../../testing/findEnglish.js";
import serveMockApi from "../../../testing/serveMockApi.js";
import type { RequestsRead } from "../../../testing/types.js";
import * as buildARendererStories from "../../lib/_work_in_progress/BuildARenderer/BuildARenderer.stories.js";
import * as dataCardsStories from "../../lib/_work_in_progress/DataCards/DataCards.stories.js";
import * as dataChartStories from "../../lib/_work_in_progress/DataChart/DataChart.stories.js";
import * as dataChartWithTableStories from "../../lib/_work_in_progress/DataChartWithTable/DataChartWithTable.stories.js";
import * as tableStories from "../../lib/_work_in_progress/DataTable/DataTable.stories.js";
import * as actionBarStories from "../../lib/_work_in_progress/DataViews/common/ActionBar/ActionBar.stories.js";
import * as filtersStories from "../../lib/_work_in_progress/DataViews/common/Filters/Filters.stories.js";
import * as paginationStories from "../../lib/_work_in_progress/DataViews/common/Pagination/Pagination.stories.js";
import * as savedViewsStories from "../../lib/_work_in_progress/DataViews/common/SavedViews/SavedViews.stories.js";
import * as searchStories from "../../lib/_work_in_progress/DataViews/common/Search/Search.stories.js";
import * as settingsStories from "../../lib/_work_in_progress/DataViews/common/Settings/Settings.stories.js";
import * as sortPanelStories from "../../lib/_work_in_progress/DataViews/common/SortPanel/SortPanel.stories.js";
import * as compositionStories from "../../lib/_work_in_progress/DataViews/DataViews.composition.stories.js";
import * as graphqlStories from "../../lib/_work_in_progress/DataViews/DataViews.graphql.stories.js";
import * as restStories from "../../lib/_work_in_progress/DataViews/DataViews.rest.stories.js";
import * as rootStories from "../../lib/_work_in_progress/DataViews/DataViews.stories.js";
import * as barStories from "../../lib/_work_in_progress/PaginationBar/PaginationBar.stories.js";
import {
  createGraphQLHandlers,
  createRestHandlers,
} from "../../storybook/machines/api/index.js";

setProjectAnnotations([preview]);

// Storybook's MSW addon serves the server-backed stories through a service
// worker, which jsdom lacks: msw/node answers the same handlers here instead.
serveMockApi([...createRestHandlers(), ...createGraphQLHandlers()]);

/** Every story of the package, by the part it shows. */
const parts = {
  DataViews: composeStories(rootStories),
  DataTable: composeStories(tableStories),
  PaginationBar: composeStories(barStories),
  Composition: composeStories(compositionStories),
  "REST API": composeStories(restStories),
  "GraphQL API": composeStories(graphqlStories),
  ActionBar: composeStories(actionBarStories),
  Filters: composeStories(filtersStories),
  Pagination: composeStories(paginationStories),
  SavedViews: composeStories(savedViewsStories),
  Search: composeStories(searchStories),
  Settings: composeStories(settingsStories),
  SortPanel: composeStories(sortPanelStories),
  DataCards: composeStories(dataCardsStories),
  DataChart: composeStories(dataChartStories),
  DataChartWithTable: composeStories(dataChartWithTableStories),
  "Build your own renderer": composeStories(buildARendererStories),
};

/**
 * The text a story writes itself, which the library does not say: the name
 * a composition gives its search, the actions the action bar's stories
 * place in it, and what one of them counts in its own indicator.
 */
const AUTHORED_ANYWHERE: readonly string[] = ["Search machines"];

/** What one part's stories write themselves, beside the text every story may. */
const AUTHORED: Readonly<Record<string, readonly string[]>> = {
  ActionBar: ["Delete", "machines selected"],
  // The root's own story places a child that counts the page's rows.
  DataViews: ["machines on this page"],
  // The cards' stories place a switch of their own, named the same way, and
  // one story's own cell writes a sentence saying the record's "from".
  // The tutorial's list names its own sort controls.
  "Build your own renderer": ["Sort by host"],
  DataCards: [
    "Show machines as",
    "Table",
    "Waiting on an address from the upstream pool.",
  ],
};

/** List every phrase a part's stories author, the shared ones included. */
const listAuthoredIn = (part: string): ReadonlySet<string> =>
  new Set([...AUTHORED_ANYWHERE, ...(AUTHORED[part] ?? [])]);

/** The English record every part falls back on. */
const english = resolveMessages();

/** Every message as a token naming it, given to each story as its words. */
const tokenMessages = createTokenMessages(english);

/**
 * Watch the requests a story sends, from the moment it renders: each one is
 * counted as it is sent, and as it is answered or abandoned. A request to
 * the endpoint that never answers is never waited on, and a page waiting on
 * one is as settled as it gets.
 *
 * @note Impure: wraps the global fetch until restored.
 */
const watchRequests = () => {
  const send = globalThis.fetch;
  let sent = 0;
  let unanswered = 0;
  let waiting = 0;
  const spy = vi
    .spyOn(globalThis, "fetch")
    .mockImplementation((input, init) => {
      const request = send(input, init);
      sent += 1;
      const url = input instanceof Request ? input.url : String(input);
      if (new URL(url).pathname.split("/").includes("unanswered")) {
        unanswered += 1;
      } else {
        waiting += 1;
        const answered = () => {
          waiting -= 1;
        };
        request.then(answered, answered);
      }
      return request;
    });
  return {
    read: (): RequestsRead => ({
      waiting,
      settled:
        sent === 0 ||
        unanswered > 0 ||
        document.querySelector('[aria-busy="true"]') === null,
    }),
    restore: () => {
      spy.mockRestore();
    },
  };
};

afterEach(() => {
  cleanup();
});

describe("stories speak only the messages", () => {
  it("replaces every message, so a word left in a story is a part's own", () => {
    for (const [key, message] of Object.entries(
      resolveMessages(tokenMessages),
    )) {
      expect(message).not.toBe(english[key as keyof DataViewsMessages]);
    }
  });

  for (const [part, stories] of Object.entries(parts)) {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${part} ${name}`, async () => {
        // A superseded request's failure some server-backed stories report is
        // not what this looks for.
        const errors = vi.spyOn(console, "error").mockImplementation(() => {});
        const requests = watchRequests();
        try {
          await act(async () => {
            render(<Story messages={tokenMessages} />);
          });
          // The page is read once every answer it waits on has arrived and
          // shows, so the words of the rows, the failures and the counts are
          // read too, not only the loading render's.
          await waitFor(() => {
            expect(requests.read()).toEqual({ waiting: 0, settled: true });
          }, DELIVERY_WAIT);
          expect(
            findEnglish(document.body, english, listAuthoredIn(part)),
          ).toEqual([]);
        } finally {
          requests.restore();
          errors.mockRestore();
        }
      });
    }
  }
});
