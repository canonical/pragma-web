/**
 * No part speaks English of its own: every story, given token messages
 * through its `messages` arg, shows no word of the English record beyond
 * its own data. Play functions are not run; they assert English.
 */

import type { DataViewsMessages } from "@canonical/dataviews-core";
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { waitForState } from "@canonical/dataviews-core/testing";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { act, cleanup, getConfig, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import preview from "../../../.storybook/preview.js";
import {
  createTokenMessages,
  findEnglish,
  serveMockApi,
  subscribeToBusy,
} from "../../../testing/index.js";
import * as graphqlStories from "../../docs/data-sources/Graphql.stories.js";
import * as restStories from "../../docs/data-sources/Rest.stories.js";
import * as buildARendererStories from "../../docs/guides/BuildARenderer/BuildARenderer.stories.js";
import * as compositionStories from "../../docs/guides/Composition.stories.js";
import * as actionBarStories from "../../lib/pattern/DataViews/common/controls/ActionBar/ActionBar.stories.js";
import * as filtersStories from "../../lib/pattern/DataViews/common/controls/Filters/Filters.stories.js";
import * as paginationStories from "../../lib/pattern/DataViews/common/controls/Pagination/Pagination.stories.js";
import * as queryBarNarrowStories from "../../lib/pattern/DataViews/common/controls/QueryBar/QueryBar.narrow.stories.js";
import * as queryBarQuickStories from "../../lib/pattern/DataViews/common/controls/QueryBar/QueryBar.quick.stories.js";
import * as queryBarStories from "../../lib/pattern/DataViews/common/controls/QueryBar/QueryBar.stories.js";
import * as savedViewsStories from "../../lib/pattern/DataViews/common/controls/SavedViews/SavedViews.stories.js";
import * as searchStories from "../../lib/pattern/DataViews/common/controls/Search/Search.stories.js";
import * as sortPanelStories from "../../lib/pattern/DataViews/common/controls/SortPanel/SortPanel.stories.js";
import * as dataCardsStories from "../../lib/pattern/DataViews/common/renderers/DataCards/DataCards.stories.js";
import * as dataChartStories from "../../lib/pattern/DataViews/common/renderers/DataChart/DataChart.stories.js";
import * as dataChartWithTableStories from "../../lib/pattern/DataViews/common/renderers/DataChartWithTable/DataChartWithTable.stories.js";
import * as tableStories from "../../lib/pattern/DataViews/common/renderers/DataTable/DataTable.stories.js";
import * as rootStories from "../../lib/pattern/DataViews/DataViews.stories.js";
import * as settingsStories from "../../lib/subcomponent/DataTableSettingsMenu/DataTableSettingsMenu.stories.js";
import * as barStories from "../../lib/subcomponent/PaginationBar/PaginationBar.stories.js";
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
  QueryBar: composeStories(queryBarStories),
  "QueryBar/Narrow": composeStories(queryBarNarrowStories),
  "QueryBar/Quick filters": composeStories(queryBarQuickStories),
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
  // The bar's stories place a control of their own beside it.
  QueryBar: ["Show only machines tagged ex-ssd"],
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
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };
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
        const markAnswered = () => {
          waiting -= 1;
          notify();
        };
        request.then(markAnswered, markAnswered);
      }
      notify();
      return request;
    });
  return {
    /** Hear each request and each change to what the page marks busy. */
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      const unsubscribeBusy = subscribeToBusy(document.body)(listener);
      return () => {
        listeners.delete(listener);
        unsubscribeBusy();
      };
    },
    /** Every answer has arrived, and the page shows what it says. */
    checkAtRest: () =>
      waiting === 0 &&
      (sent === 0 ||
        unanswered > 0 ||
        document.querySelector('[aria-busy="true"]') === null),
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
          const { container } = await act(async () =>
            render(<Story messages={tokenMessages} />),
          );
          // The page is read once every answer it waits on has arrived and
          // shows, so the words of the rows, the failures and the counts are
          // read too, not only the loading render's. Cleanup removes the
          // container, and an emptied page is not at rest.
          await getConfig().asyncWrapper(() =>
            waitForState(
              requests.subscribe,
              () => container.isConnected && requests.checkAtRest(),
              "every answer shown",
            ),
          );
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
