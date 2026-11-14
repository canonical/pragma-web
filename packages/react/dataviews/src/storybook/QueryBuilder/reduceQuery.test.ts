import { describe, expect, it } from "vitest";
import reduceQuery from "./reduceQuery.js";
import type { Clause, QueryAction, QueryState } from "./types.js";

const DEPLOYED: Clause = {
  id: "c1",
  field: "status",
  operator: "is",
  value: "deployed",
};
const GPU: Clause = { id: "c2", field: "pool", operator: "is", value: "gpu" };

const start = (clauses: Clause[] = []): QueryState => ({
  clauses,
  text: "",
  edit: undefined,
  activeItem: "entry",
  focusPart: undefined,
  nextId: clauses.length + 1,
});

/** Runs the actions in turn from a state. */
const run = (state: QueryState, ...actions: QueryAction[]): QueryState =>
  actions.reduce(reduceQuery, state);

describe("reduceQuery", () => {
  describe("typeText and typePart", () => {
    it("keeps the entry's text, and a part's only while an edit is open", () => {
      expect(run(start(), { type: "typeText", text: "sta" }).text).toBe("sta");
      const idle = start();
      expect(run(idle, { type: "typePart", text: "is" })).toBe(idle);
      const editing = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "value" },
        { type: "typePart", text: "rea" },
      );
      expect(editing.edit?.text).toBe("rea");
    });
  });

  describe("choose", () => {
    it("starts a draft from a field, with its Entry on the operator", () => {
      const state = run(
        start(),
        { type: "typeText", text: "sta" },
        { type: "choose", optionId: "status" },
      );
      expect(state.clauses).toEqual([{ id: "clause-1", field: "status" }]);
      expect(state.text).toBe("");
      expect(state.edit).toMatchObject({ part: "operator", isDraft: true });
      expect(state.activeItem).toBe("clause-1:entry");
    });

    it("completes a draft and sends the stop back to the entry", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "choose", optionId: "is" },
        { type: "choose", optionId: "ready" },
      );
      expect(state.clauses).toEqual([
        { id: "clause-1", field: "status", operator: "is", value: "ready" },
      ]);
      expect(state.edit).toBeUndefined();
      expect(state.activeItem).toBe("entry");
    });

    it("settles an edit on its chip, focusing the part chosen", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "value" },
        { type: "choose", optionId: "ready" },
      );
      expect(state.clauses).toEqual([{ ...DEPLOYED, value: "ready" }]);
      expect(state.activeItem).toBe("c1");
      expect(state.focusPart).toEqual({ id: "c1", part: "value" });
    });

    it("drops the value when the field changes, and moves on to it", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "choose", optionId: "pool" },
      );
      expect(state.clauses).toEqual([
        { id: "c1", field: "pool", operator: "is" },
      ]);
      expect(state.edit).toMatchObject({ part: "value", isDraft: false });
      expect(state.edit?.original).toEqual(DEPLOYED);
    });

    it("keeps the value when the same field is chosen again", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "choose", optionId: "status" },
      );
      expect(state.clauses).toEqual([DEPLOYED]);
    });

    it("changes nothing when the edited chip has gone", () => {
      const state = run(start([DEPLOYED]), {
        type: "editPart",
        id: "c1",
        part: "value",
      });
      const orphan = { ...state, clauses: [] };
      expect(reduceQuery(orphan, { type: "choose", optionId: "ready" })).toBe(
        orphan,
      );
    });
  });

  describe("editPart", () => {
    it("opens an Entry on a chip's part, keeping the clause it started from", () => {
      const state = run(start([DEPLOYED]), {
        type: "editPart",
        id: "c1",
        part: "operator",
      });
      expect(state.edit).toEqual({
        id: "c1",
        part: "operator",
        text: "",
        isDraft: false,
        original: DEPLOYED,
      });
    });

    it("cancels another chip's edit first", () => {
      const state = run(
        start([DEPLOYED, GPU]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "choose", optionId: "owner" },
        { type: "editPart", id: "c2", part: "value" },
      );
      expect(state.clauses).toEqual([DEPLOYED, GPU]);
      expect(state.edit?.id).toBe("c2");
    });

    it("ignores a chip that is not there", () => {
      const state = start([DEPLOYED]);
      expect(
        run(state, { type: "editPart", id: "c9", part: "value" }).edit,
      ).toBeUndefined();
    });
  });

  describe("movePart", () => {
    it("walks to the next part, and back", () => {
      const forward = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "movePart", backward: false },
      );
      expect(forward.edit?.part).toBe("operator");
      expect(
        run(forward, { type: "movePart", backward: true }).edit?.part,
      ).toBe("field");
    });

    it("commits the edit past the last part, keeping what was chosen", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "value" },
        { type: "movePart", backward: false, optionId: "ready" },
      );
      expect(state.edit).toBeUndefined();
      expect(state.clauses).toEqual([{ ...DEPLOYED, value: "ready" }]);
      expect(state.activeItem).toBe("c1");
      expect(state.focusPart).toEqual({ id: "c1", part: "value" });
    });

    it("commits a complete draft past its last part, with the stop on the entry", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "movePart", backward: false, optionId: "is" },
        { type: "movePart", backward: false, optionId: "ready" },
      );
      expect(state.clauses).toEqual([
        { id: "clause-1", field: "status", operator: "is", value: "ready" },
      ]);
      expect(state.edit).toBeUndefined();
      expect(state.activeItem).toBe("entry");
    });

    it("drops an incomplete draft past its last part", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "movePart", backward: false },
        { type: "movePart", backward: false },
      );
      expect(state.clauses).toEqual([]);
      expect(state.activeItem).toBe("entry");
    });

    it("restores an edited chip left incomplete by a new field", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "movePart", backward: true, optionId: "pool" },
      );
      expect(state.clauses).toEqual([DEPLOYED]);
      expect(state.edit).toBeUndefined();
    });

    it("returns a draft's field from its operator to the entry, as text", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "movePart", backward: true },
      );
      expect(state.edit).toBeUndefined();
      expect(state.clauses).toEqual([]);
      expect(state.text).toBe("status");
      expect(state.activeItem).toBe("entry");
    });

    it("returns to an edited chip's field from its operator", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "operator" },
        { type: "movePart", backward: true },
      );
      expect(state.edit).toMatchObject({ part: "field", isDraft: false });
    });

    it("does nothing without an open edit", () => {
      const state = start([DEPLOYED]);
      expect(run(state, { type: "movePart", backward: false })).toBe(state);
    });
  });

  describe("moveStop", () => {
    it("moves the stop, keeping an edit whose Entry takes it", () => {
      const editing = run(start([DEPLOYED]), {
        type: "editPart",
        id: "c1",
        part: "value",
      });
      const kept = run(editing, { type: "moveStop", item: "c1:entry" });
      expect(kept.edit).toEqual(editing.edit);
      expect(kept.activeItem).toBe("c1:entry");
      expect(run(start(), { type: "moveStop", item: "c1" }).activeItem).toBe(
        "c1",
      );
    });

    it("keeps an edit when a press on its own chip claims the chip's item", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "moveStop", item: "clause-1" },
        { type: "editPart", id: "clause-1", part: "field" },
      );
      // The draft's field is its only Segment, so the Entry stays put.
      expect(state.clauses).toEqual([{ id: "clause-1", field: "status" }]);
      expect(state.edit).toMatchObject({ part: "operator", isDraft: true });
    });

    it("cancels an edit whose Entry loses the stop", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "moveStop", item: "entry" },
      );
      expect(state.clauses).toEqual([]);
      expect(state.edit).toBeUndefined();
      expect(state.activeItem).toBe("entry");
    });
  });

  describe("leave", () => {
    it("commits what was chosen, and the stop stays on the chip", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "value" },
        { type: "leave", optionId: "ready" },
      );
      expect(state.clauses).toEqual([{ ...DEPLOYED, value: "ready" }]);
      expect(state.edit).toBeUndefined();
      expect(state.focusPart).toBeUndefined();
    });

    it("ends an edit without sending focus back to a part", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "value" },
        { type: "leave" },
      );
      expect(state.edit).toBeUndefined();
      expect(state.clauses).toEqual([DEPLOYED]);
      expect(state.activeItem).toBe("c1");
      expect(state.focusPart).toBeUndefined();
    });

    it("drops a draft, moving the stop to the entry", () => {
      const state = run(
        start(),
        { type: "choose", optionId: "status" },
        { type: "leave" },
      );
      expect(state.clauses).toEqual([]);
      expect(state.activeItem).toBe("entry");
    });
  });

  describe("cancelEdit", () => {
    it("restores an edited chip and returns focus to the part", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "editPart", id: "c1", part: "field" },
        { type: "choose", optionId: "pool" },
        { type: "cancelEdit" },
      );
      expect(state.clauses).toEqual([DEPLOYED]);
      expect(state.activeItem).toBe("c1");
      expect(state.focusPart).toEqual({ id: "c1", part: "value" });
    });

    it("keeps a chip whose edit has no clause to restore", () => {
      const editing = run(start([DEPLOYED]), {
        type: "editPart",
        id: "c1",
        part: "value",
      });
      const state = reduceQuery(
        {
          ...editing,
          edit: editing.edit && { ...editing.edit, original: undefined },
        },
        { type: "cancelEdit" },
      );
      expect(state.clauses).toEqual([DEPLOYED]);
    });

    it("does nothing without an open edit", () => {
      const state = start([DEPLOYED]);
      expect(run(state, { type: "cancelEdit" })).toBe(state);
    });
  });

  describe("remove", () => {
    it("moves the stop to the next chip, else the previous, else the entry", () => {
      const both = start([DEPLOYED, GPU]);
      expect(run(both, { type: "remove", id: "c1" }).activeItem).toBe("c2");
      expect(run(both, { type: "remove", id: "c2" }).activeItem).toBe("c1");
      expect(
        run(start([DEPLOYED]), { type: "remove", id: "c1" }).activeItem,
      ).toBe("entry");
      expect(run(both, { type: "remove", id: "c9" }).activeItem).toBe("entry");
    });

    it("ends an edit of the chip it removes, and of any other", () => {
      const editing = run(start([DEPLOYED, GPU]), {
        type: "editPart",
        id: "c1",
        part: "value",
      });
      expect(run(editing, { type: "remove", id: "c1" }).edit).toBeUndefined();
      const other = run(editing, { type: "remove", id: "c2" });
      expect(other.edit).toBeUndefined();
      expect(other.clauses).toEqual([DEPLOYED]);
      expect(other.activeItem).toBe("c1");
    });

    it("drops a draft being built when another chip goes", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "choose", optionId: "pool" },
        { type: "remove", id: "c1" },
      );
      expect(state.clauses).toEqual([]);
      expect(state.edit).toBeUndefined();
      expect(state.activeItem).toBe("entry");
    });
  });

  describe("clear", () => {
    it("drops every clause, the text and any edit", () => {
      const state = run(
        start([DEPLOYED]),
        { type: "typeText", text: "sta" },
        { type: "editPart", id: "c1", part: "value" },
        { type: "clear" },
      );
      expect(state).toMatchObject({
        clauses: [],
        text: "",
        edit: undefined,
        activeItem: "entry",
      });
    });
  });
});
