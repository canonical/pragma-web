/**
 * No part speaks English of its own. Every story of the package renders with
 * every message of the record replaced by a token naming it, and nothing the
 * page shows or names — a text node, an accessible name, a value text —
 * carries a word or a phrase of the English record, outside the story's own
 * data. A string a part hard-coded, rather than read from the record, would
 * still be English here.
 *
 * The record is replaced where every part resolves it, so no story is
 * rewritten to pass `messages`: the swap goes through the same merge the
 * root's `messages` goes through. Stories render as a reader first sees
 * them, their play functions not run, since those assert the English words.
 *
 * Deviation: this mocks another package's entry point — the `bindings` module
 * every part resolves its words through — which is not this repo's habit. It
 * is what lets every story stand as written: the alternative is passing a
 * replacement to each of them, which would test the stories' own wiring
 * rather than the parts'. The mock delegates to the real module for
 * everything else.
 */

import type { DataViewsMessages } from "@canonical/dataviews-core";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import preview from "../../../.storybook/preview.js";
import { DELIVERY_WAIT } from "../../../testing/constants.js";
import findEnglish from "../../../testing/findEnglish.js";
import serveMockApi from "../../../testing/serveMockApi.js";
import * as dataCardsStories from "../../lib/_work_in_progress/DataCards/DataCards.stories.js";
import * as dataChartStories from "../../lib/_work_in_progress/DataChart/DataChart.stories.js";
import * as tableStories from "../../lib/_work_in_progress/DataTable/DataTable.stories.js";
import * as actionsStories from "../../lib/_work_in_progress/DataViews/common/Actions/Actions.stories.js";
import * as filtersStories from "../../lib/_work_in_progress/DataViews/common/Filters/Filters.stories.js";
import * as paginationStories from "../../lib/_work_in_progress/DataViews/common/Pagination/Pagination.stories.js";
import * as savedViewsStories from "../../lib/_work_in_progress/DataViews/common/SavedViews/SavedViews.stories.js";
import * as searchStories from "../../lib/_work_in_progress/DataViews/common/Search/Search.stories.js";
import * as settingsStories from "../../lib/_work_in_progress/DataViews/common/Settings/Settings.stories.js";
import * as sortPanelStories from "../../lib/_work_in_progress/DataViews/common/SortPanel/SortPanel.stories.js";
import * as graphqlStories from "../../lib/_work_in_progress/DataViews/DataViews.graphql.stories.js";
import * as restStories from "../../lib/_work_in_progress/DataViews/DataViews.rest.stories.js";
import * as compositionStories from "../../lib/_work_in_progress/DataViews/DataViews.stories.js";
import * as barStories from "../../lib/_work_in_progress/PaginationBar/PaginationBar.stories.js";
import * as switchStories from "../../lib/_work_in_progress/RendererSwitch/RendererSwitch.stories.js";
import {
  createGraphQLHandlers,
  createRestHandlers,
} from "../../storybook/machines/api/index.js";

vi.mock("@canonical/dataviews-core/bindings", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@canonical/dataviews-core/bindings")>();
  // Imported here, not above: this factory is hoisted over the file's
  // imports, so nothing the file imported is built yet. The factory runs once
  // for the module registry, so the replacement is built once.
  const { default: createTokenMessages } = await import(
    "../../../testing/createTokenMessages.js"
  );
  const replaced = createTokenMessages(actual.resolveMessages());
  return {
    ...actual,
    resolveMessages: (messages: Partial<DataViewsMessages> = {}) =>
      actual.resolveMessages({ ...replaced, ...messages }),
  };
});

setProjectAnnotations([preview]);

// Storybook's MSW addon serves the server-backed stories through a service
// worker, which jsdom lacks: msw/node answers the same handlers here instead.
serveMockApi([...createRestHandlers(), ...createGraphQLHandlers()]);

/** Every story of the package, by the part it shows. */
const parts = {
  DataTable: composeStories(tableStories),
  PaginationBar: composeStories(barStories),
  Composition: composeStories(compositionStories),
  "REST API": composeStories(restStories),
  "GraphQL API": composeStories(graphqlStories),
  Actions: composeStories(actionsStories),
  Filters: composeStories(filtersStories),
  Pagination: composeStories(paginationStories),
  SavedViews: composeStories(savedViewsStories),
  Search: composeStories(searchStories),
  Settings: composeStories(settingsStories),
  SortPanel: composeStories(sortPanelStories),
  RendererSwitch: composeStories(switchStories),
  DataCards: composeStories(dataCardsStories),
  DataChart: composeStories(dataChartStories),
};

/**
 * The text a story writes itself, which the library does not say: the name
 * a composition gives its search, the actions the action bar's stories
 * place in it, and what one of them counts in its own indicator.
 */
const AUTHORED_ANYWHERE: readonly string[] = ["Search machines"];

/** What one part's stories write themselves, beside the text every story may. */
const AUTHORED: Readonly<Record<string, readonly string[]>> = {
  Actions: ["Delete", "machines selected"],
  // The name a switch's story gives its own collection, which says the
  // record's "Show" without being its word, and the name it gives its own
  // table renderer, which is the chart's switch's word too.
  RendererSwitch: ["Show machines as", "Table"],
  // The cards' stories place a switch of their own, named the same way, and
  // one story's own cell writes a sentence saying the record's "from".
  DataCards: [
    "Show machines as",
    "Table",
    "Waiting on an address from the upstream pool.",
  ],
};

/** List every phrase a part's stories author, the shared ones included. */
const listAuthoredIn = (part: string): ReadonlySet<string> =>
  new Set([...AUTHORED_ANYWHERE, ...(AUTHORED[part] ?? [])]);

/** The English record, from the module every part's words were replaced in. */
const readEnglish = async (): Promise<DataViewsMessages> => {
  const actual = await vi.importActual<
    typeof import("@canonical/dataviews-core/bindings")
  >("@canonical/dataviews-core/bindings");
  return actual.resolveMessages();
};

/** What a story's requests to the mock endpoints have come to so far. */
type RequestsRead = {
  /** Requests sent to an endpoint that answers, still waiting on it. */
  readonly waiting: number;
  /**
   * Whether the page shows what its answers say: no request was sent, or
   * one waits on the endpoint that never answers, or nothing on the page
   * is still busy.
   */
  readonly settled: boolean;
};

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
  it("replaces every message, so a word left in a story is a part's own", async () => {
    const bindings = await import("@canonical/dataviews-core/bindings");
    const english = await readEnglish();
    for (const [key, message] of Object.entries(bindings.resolveMessages())) {
      expect(message).not.toBe(english[key as keyof DataViewsMessages]);
    }
  });

  for (const [part, stories] of Object.entries(parts)) {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${part} ${name}`, async () => {
        const english = await readEnglish();
        // A superseded request's failure some server-backed stories report is
        // not what this looks for.
        const errors = vi.spyOn(console, "error").mockImplementation(() => {});
        const requests = watchRequests();
        try {
          await act(async () => {
            render(<Story />);
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
