import { describe, expect, it } from "vitest";
import createPresentation from "./createPresentation.js";
import resetColumnArrangement from "./resetColumnArrangement.js";

describe("resetColumnArrangement", () => {
  it("removes the order, the hidden columns and every width, and nothing else", () => {
    expect(
      resetColumnArrangement({
        table: "t",
        presentation: {
          "table.t.order": ["cores"],
          "table.t.hidden": ["status"],
          "table.t.width.name": 200,
          "cards.size": "large",
        },
      }),
    ).toEqual({
      "table.t.order": undefined,
      "table.t.hidden": undefined,
      "table.t.width.name": undefined,
    });
    expect(
      resetColumnArrangement({
        table: "t",
        presentation: {
          "cards.size": "large",
          "table.u.order": ["cores"],
          "table.u.hidden": ["status"],
          "table.u.width.name": 200,
        },
      }),
    ).toEqual({});
  });

  it("clears the columns a followed link chose once adopted, with a view named or none", () => {
    const hidden = { "table.t.hidden": ["status"] };
    const underDefault = createPresentation({
      linked: { view: null, presentation: hidden },
    });
    const releaseDefault = underDefault.observe();
    underDefault.arrange(
      resetColumnArrangement({
        table: "t",
        presentation: underDefault.state.get().own,
      }),
    );
    expect(underDefault.state.get().presentation).toEqual({});
    releaseDefault();
    const underView = createPresentation({
      linked: { view: "v1", presentation: hidden },
    });
    underView.show({ id: "v1", presentation: {} });
    const releaseView = underView.observe();
    underView.arrange(
      resetColumnArrangement({
        table: "t",
        presentation: underView.state.get().own,
      }),
    );
    expect(underView.state.get().presentation).toEqual({});
    releaseView();
  });

  it("clears the viewer's own layer, so an open view's saved arrangement shows through", () => {
    const presentation = createPresentation();
    presentation.show({
      id: "v1",
      presentation: { "table.t.hidden": ["status"] },
    });
    presentation.arrange({
      "table.t.hidden": ["cores"],
      "table.t.width.name": 200,
    });
    presentation.arrange(
      resetColumnArrangement({
        table: "t",
        presentation: presentation.state.get().presentation,
      }),
    );
    expect(presentation.state.get().presentation).toEqual({
      "table.t.hidden": ["status"],
    });
  });
});
