import { describe, expect, it, vi } from "vitest";
import buildStoredView from "../../../testing/buildStoredView.js";
import createDeferred from "../../../testing/createDeferred.js";
import createManualSource from "../../../testing/createManualSource.js";
import createStandInViewStore from "../../../testing/createStandInViewStore.js";
import declare from "../../../testing/declare.js";
import readId from "../../../testing/readId.js";
import { createCollection } from "../collection/index.js";
import { createChannel } from "../observable/index.js";
import { createPresentation } from "../presentation/index.js";
import {
  createDataViewsProvider,
  readProviderHost,
} from "../provider/index.js";
import { DEFAULT_WINDOW, type Slice } from "../query/index.js";
import { INITIAL_VIEWS_STATE, NO_VIEW_OPEN } from "./constants.js";
import createViewCommands from "./createViewCommands.js";
import type {
  SavedView,
  ViewCreateResult,
  ViewStore,
  ViewsState,
} from "./types.js";

const collection = createCollection({
  fields: [
    { field: "status", kind: "choices", options: ["failed", "running"] },
  ],
  identify: readId,
});
const capabilities = declare({ filter: { status: ["isAny"] } });
const failedSlice: Slice = {
  filter: [{ field: "status", operator: "isAny", operands: ["failed"] }],
  search: null,
  sort: [],
  group: [],
};

/** The commands over a store, with `current` open and the views listed. */
const createCommandsOver = (
  store: ViewStore,
  current: SavedView | null = null,
  views: readonly SavedView[] = [],
) => {
  const provider = createDataViewsProvider({
    collection,
    source: createManualSource({ capabilities }).source,
  });
  const host = readProviderHost(provider);
  const adopt = vi.fn();
  const setBaseline = vi.fn();
  const dropView = vi.fn(() => ({ current: null }));
  const presentation = createPresentation();
  const applied: Partial<ViewsState>[] = [];
  const commands = createViewCommands({
    host: {
      schema: collection.schema,
      capabilities,
      state: host.state,
      view: host.view,
      transitions: host.transitions,
      adopt,
    },
    store,
    presentation,
    state: createChannel<ViewsState>({
      ...INITIAL_VIEWS_STATE,
      listing: { status: "ready" },
      views,
      current,
    }),
    async run(_command, prepare) {
      const prepared = prepare();
      if (typeof prepared !== "function") {
        return prepared;
      }
      const settlement = await prepared();
      if (settlement.apply !== undefined) {
        applied.push(settlement.apply());
      }
      return settlement.outcome;
    },
    setBaseline,
    listWith: (view) => [view],
    dropView,
    readFirstPage: () => DEFAULT_WINDOW,
  });
  return {
    commands,
    host,
    adopt,
    setBaseline,
    dropView,
    presentation,
    applied,
  };
};

const view = buildStoredView();
const revised = buildStoredView({ revision: 2 });
const unreadable = buildStoredView({ query: "nope=1" });

describe("createViewCommands", () => {
  it("opens a view, adopting its query on the first page under its id", async () => {
    const { commands, adopt, setBaseline, applied } = createCommandsOver(
      createStandInViewStore({ get: async () => ({ status: "found", view }) }),
    );
    expect(await commands.open("v1")).toEqual({ status: "opened", view });
    expect(setBaseline).toHaveBeenCalledWith(failedSlice);
    expect(adopt).toHaveBeenCalledWith(
      { slice: failedSlice, window: DEFAULT_WINDOW },
      "view",
      "v1",
    );
    expect(applied).toEqual([{ current: view, views: [view] }]);
  });

  it("refuses to open a view whose query the collection cannot read", async () => {
    const { commands, applied } = createCommandsOver(
      createStandInViewStore({
        get: async () => ({ status: "found", view: unreadable }),
      }),
    );
    const outcome = await commands.open("v1");
    expect(outcome.status).toBe("refused");
    expect(applied).toEqual([]);
  });

  it("opens nothing for a view the store does not find", async () => {
    const { commands } = createCommandsOver(createStandInViewStore());
    expect(await commands.open("v1")).toEqual({ status: "missing" });
  });

  it("settles every command needing an open view as missing when none is", async () => {
    const { commands } = createCommandsOver(createStandInViewStore());
    expect(await commands.save()).toBe(NO_VIEW_OPEN);
    expect(await commands.rename("New")).toBe(NO_VIEW_OPEN);
    expect(await commands.remove()).toBe(NO_VIEW_OPEN);
  });

  it("saves the live query alone, which becomes the baseline", async () => {
    const update = vi.fn<ViewStore["update"]>(async () => ({
      status: "saved",
      view: revised,
    }));
    const { commands, host, setBaseline, applied } = createCommandsOver(
      createStandInViewStore({ update }),
      view,
    );
    host.setPredicate({
      field: "status",
      operator: "isAny",
      operands: ["failed"],
    });
    expect(await commands.save()).toEqual({ status: "saved", view: revised });
    expect(update).toHaveBeenCalledWith(view, { query: "status=failed" });
    expect(setBaseline).toHaveBeenCalledWith(failedSlice);
    expect(applied).toEqual([{ current: revised, views: [revised] }]);
  });

  it("opens the stored view on a conflict, moving the baseline only when it reads", async () => {
    const { commands, setBaseline, applied } = createCommandsOver(
      createStandInViewStore({
        update: async () => ({ status: "conflict", view: revised }),
        remove: async () => ({ status: "conflict", view: unreadable }),
      }),
      view,
    );
    expect(await commands.save()).toEqual({
      status: "conflict",
      view: revised,
    });
    expect(setBaseline).toHaveBeenCalledWith(failedSlice);
    expect(await commands.remove()).toEqual({
      status: "conflict",
      view: unreadable,
    });
    expect(setBaseline).toHaveBeenCalledTimes(1);
    expect(applied).toEqual([
      { current: revised, views: [revised] },
      { current: unreadable, views: [unreadable] },
    ]);
  });

  it("drops a view the store no longer has, and changes nothing for one it cannot read", async () => {
    const { commands, dropView, applied } = createCommandsOver(
      createStandInViewStore({
        update: async () => ({ status: "missing" }),
        remove: async () => ({ status: "unreadable", reason: "corrupt" }),
      }),
      view,
    );
    expect(await commands.save()).toEqual({ status: "missing" });
    expect(dropView).toHaveBeenCalledWith("v1");
    expect(await commands.remove()).toEqual({
      status: "unreadable",
      reason: "corrupt",
    });
    expect(applied).toHaveLength(1);
  });

  it("renames the open view to its trimmed name, keeping the baseline", async () => {
    const update = vi.fn<ViewStore["update"]>(async () => ({
      status: "saved",
      view: revised,
    }));
    const { commands, setBaseline } = createCommandsOver(
      createStandInViewStore({ update }),
      view,
    );
    expect(await commands.rename("  Renamed ")).toEqual({
      status: "saved",
      view: revised,
    });
    expect(update).toHaveBeenCalledWith(view, { name: "Renamed" });
    expect(setBaseline).not.toHaveBeenCalled();
  });

  it("refuses a name no view may take", async () => {
    const { commands } = createCommandsOver(createStandInViewStore(), view, [
      buildStoredView({ id: "v2", name: "Taken" }),
    ]);
    expect(await commands.rename(" ")).toEqual({
      status: "invalid",
      reason: "a view needs a name",
    });
    expect(await commands.saveAs("taken")).toEqual({
      status: "invalid",
      reason: 'a view named "Taken" already exists',
    });
  });

  it("changes nothing for a save the store cannot read", async () => {
    const { commands, applied } = createCommandsOver(
      createStandInViewStore({
        update: async () => ({ status: "unreadable", reason: "corrupt" }),
      }),
      view,
    );
    expect(await commands.rename("Renamed")).toEqual({
      status: "unreadable",
      reason: "corrupt",
    });
    expect(applied).toEqual([]);
  });

  it("removes the open view, dropping it", async () => {
    const { commands, dropView } = createCommandsOver(
      createStandInViewStore(),
      view,
    );
    expect(await commands.remove()).toEqual({ status: "removed" });
    expect(dropView).toHaveBeenCalledWith("v1");
  });

  it("saves as a new view, opening it under its id", async () => {
    const created = buildStoredView({ id: "v9", name: "Mine" });
    const create = vi.fn<ViewStore["create"]>(async () => ({
      status: "saved",
      view: created,
    }));
    const { commands, adopt, setBaseline, applied } = createCommandsOver(
      createStandInViewStore({ create }),
    );
    expect(await commands.saveAs(" Mine ")).toEqual({
      status: "saved",
      view: created,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Mine", query: "", presentation: {} }),
    );
    expect(setBaseline).toHaveBeenCalledWith(
      expect.objectContaining({ filter: [] }),
    );
    expect(adopt).toHaveBeenCalledWith(
      expect.objectContaining({ window: DEFAULT_WINDOW }),
      "view",
      "v9",
    );
    expect(applied).toEqual([{ current: created, views: [created] }]);
  });

  it("moves the changes made while saving as onto the new view", async () => {
    const answer = createDeferred<ViewCreateResult>();
    const { commands, presentation } = createCommandsOver(
      createStandInViewStore({ create: () => answer.promise }),
    );
    presentation.arrange({ width: 1 });
    const saving = commands.saveAs("Mine");
    presentation.arrange({ width: undefined, order: ["a"] });
    answer.resolve({
      status: "saved",
      view: buildStoredView({ id: "v9", presentation: { width: 1 } }),
    });
    await saving;
    expect(presentation.state.get().presentation).toEqual({
      width: null,
      order: ["a"],
    });
  });

  it("settles a creation the store did not save as its outcome", async () => {
    const { commands, applied } = createCommandsOver(
      createStandInViewStore({
        create: async () => ({ status: "unreadable", reason: "corrupt" }),
      }),
    );
    expect(await commands.saveAs("Mine")).toEqual({
      status: "unreadable",
      reason: "corrupt",
    });
    expect(applied).toEqual([]);
  });

  it("retries a creation whose outcome never arrived under the same id", async () => {
    const create = vi.fn<ViewStore["create"]>(async () => {
      throw new Error("offline");
    });
    const { commands } = createCommandsOver(createStandInViewStore({ create }));
    await expect(commands.saveAs("Mine")).rejects.toThrow("offline");
    await expect(commands.saveAs("Mine")).rejects.toThrow("offline");
    await expect(commands.saveAs("Other")).rejects.toThrow("offline");
    const ids = create.mock.calls.map(([draft]) => draft.id);
    expect(ids.at(1)).toBe(ids.at(0));
    expect(ids.at(2)).not.toBe(ids.at(0));
  });
});
