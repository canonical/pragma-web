/**
 * Resizing must never require a drag, must clamp every path the same way,
 * and must leave the presentation alone until it commits.
 * Pointer previews are coalesced to one publication per animation frame.
 * A press that does not travel places the edge with the next press.
 */
import {
  type ColumnLayout,
  createColumnLayout,
  createGridInteraction,
  type GridInteraction,
} from "@canonical/dataviews-core/bindings";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createMachineProvider from "../../../../../../testing/createMachineProvider.js";
import ResizeHandle from "./ResizeHandle.js";

/** A layout over a fresh provider's presentation, kept in memory. */
const createLayoutOf = (
  columns: Parameters<typeof createColumnLayout>[0]["columns"],
): ColumnLayout =>
  createColumnLayout({
    columns,
    presentation: createMachineProvider().provider.presentation,
  });

/**
 * The table's header row and header cell, as it draws them: divs with the
 * roles the handle looks for.
 */
const HeaderRow = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own header row is a div with this role, which the handle looks for
  // biome-ignore lint/a11y/useFocusableInteractive: the row is structure, as the table's is
  <div role="row">{children}</div>
);

const Table = ({ children }: { readonly children: ReactNode }) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own root is a div with this role, which the handle looks for
  <div role="table" aria-label="Machines">
    {children}
  </div>
);

const HeaderCell = ({
  children,
  style,
  labelledBy,
}: {
  readonly children: ReactNode;
  readonly style?: CSSProperties;
  readonly labelledBy?: string;
}) => (
  // biome-ignore lint/a11y/useSemanticElements: the table's own header cell is a div with this role, which the handle looks for
  // biome-ignore lint/a11y/useFocusableInteractive: the header is structure, as the table's is
  <div role="columnheader" aria-labelledby={labelledBy} style={style}>
    {children}
  </div>
);

let frames: FrameRequestCallback[] = [];
let cancelled: number[] = [];

const flushFrames = (): void => {
  const pending = [...frames];
  frames = [];
  act(() => {
    for (const frame of pending) {
      frame(0);
    }
  });
};

/** Where the pointer last was: a release lets go there, as a real one does. */
let pointerX = 0;

const recordPress = (event: PointerEvent): void => {
  pointerX = event.clientX;
};

const movePointer = (clientX: number): void => {
  pointerX = clientX;
  fireEvent.pointerMove(window, { clientX });
};

const releasePointer = (type: "pointerUp" | "pointerCancel"): void => {
  fireEvent[type](window, { clientX: pointerX });
};

const mount = ({
  width = 100,
  direction = "ltr",
}: {
  readonly width?: number;
  readonly direction?: "ltr" | "rtl";
} = {}): {
  layout: ColumnLayout;
  interaction: GridInteraction;
  handle: HTMLElement;
  sort: ReturnType<typeof vi.fn>;
  announce: ReturnType<typeof vi.fn>;
  rerender: (width: number) => void;
} => {
  const layout = createLayoutOf([
    { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50, maxPx: 300 } },
  ]);
  const interaction = createGridInteraction(layout);
  const sort = vi.fn();
  const announce = vi.fn();
  const draw = (resolved: number) => (
    <div style={{ direction }}>
      <HeaderRow>
        {/* jsdom inherits no direction, so the cell states its own. */}
        <HeaderCell labelledBy="name-label" style={{ direction }}>
          <button id="name-label" type="button" onClick={sort}>
            Name
          </button>
          <ResizeHandle
            interaction={interaction}
            columnId="name"
            name="Name"
            width={resolved}
            min={50}
            max={300}
            labelledBy="name-label"
            announce={announce}
          />
        </HeaderCell>
        <HeaderCell>Status</HeaderCell>
      </HeaderRow>
      <button type="button">Elsewhere</button>
    </div>
  );
  const view = render(draw(width));
  // The header cell spans 10 to 210 on screen, as jsdom lays out nothing.
  const cell = screen.getAllByRole("columnheader").at(0) as HTMLElement;
  vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ x: 10, y: 0, width: 200, height: 32 }),
  );
  return {
    layout,
    interaction,
    handle: screen.getByRole("separator"),
    sort,
    announce,
    rerender: (resolved) => {
      view.rerender(draw(resolved));
    },
  };
};

/** Press the handle and release it where it was: a press, not a drag. */
const pressHandle = (handle: HTMLElement, clientX = 205): void => {
  fireEvent.pointerDown(handle, { isPrimary: true, clientX });
  act(() => {
    releasePointer("pointerUp");
  });
};

beforeEach(() => {
  frames = [];
  cancelled = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => {
    cancelled.push(handle);
  });
  // jsdom's window never has the focus; a reader's does.
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  window.addEventListener("pointerdown", recordPress, true);
});

afterEach(() => {
  window.removeEventListener("pointerdown", recordPress, true);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ResizeHandle", () => {
  it("takes its name from the column header it sits in", () => {
    const { handle } = mount();
    expect(handle).toHaveAccessibleName("Name");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(handle).toHaveAttribute("aria-valuenow", "100");
    expect(handle.tabIndex).toBe(0);
  });

  it("previews a drag and commits it as a user-fixed width", () => {
    const { layout, interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    expect(interaction.state.get().status).toBe("resizing");
    movePointer(160);
    flushFrames();
    expect(interaction.state.get()).toMatchObject({ previewWidth: 160 });
    // The authority is untouched while the preview is live.
    expect(layout.state.get().overrides["name"]).toBeUndefined();
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 160 });
    expect(interaction.state.get().status).toBe("idle");
  });

  it("publishes at most one preview per animation frame", () => {
    const { interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(140);
    movePointer(180);
    expect(frames).toHaveLength(1);
    flushFrames();
    expect(interaction.state.get()).toMatchObject({ previewWidth: 180 });
  });

  it("clamps a drag to the column's declared bounds", () => {
    const { layout, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(1000);
    flushFrames();
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 300 });
  });

  it("abandons the drag when the pointer is cancelled", () => {
    const { layout, interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(160);
    flushFrames();
    releasePointer("pointerCancel");
    expect(interaction.state.get().status).toBe("idle");
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("drops a pending frame when the drag ends before it runs", () => {
    const { handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(160);
    expect(frames).toHaveLength(1);
    releasePointer("pointerUp");
    expect(cancelled).toHaveLength(1);
  });

  it("stops listening once the drag is over", () => {
    const { interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    releasePointer("pointerUp");
    movePointer(400);
    flushFrames();
    expect(interaction.state.get().status).toBe("idle");
  });

  it("abandons a live drag on Escape", () => {
    const { layout, interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(160);
    flushFrames();
    fireEvent.keyDown(handle, { key: "Escape" });
    expect(interaction.state.get().status).toBe("idle");
    expect(layout.state.get().overrides["name"]).toBeUndefined();
    // The listeners went with it.
    movePointer(400);
    flushFrames();
    expect(interaction.state.get().status).toBe("idle");
  });

  it("does nothing on Escape with no drag in progress", () => {
    const { layout, interaction, handle } = mount();
    fireEvent.keyDown(handle, { key: "Escape" });
    expect(interaction.state.get().status).toBe("idle");
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("resizes from the keyboard through the same commands", () => {
    const { layout, handle } = mount();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 116 });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 84 });
  });

  it.each([
    ["ArrowLeft", 116],
    ["ArrowRight", 84],
  ])(
    "right to left, the arrow towards the trailing edge widens: %s",
    (key, px) => {
      const { layout, handle } = mount({ direction: "rtl" });
      fireEvent.keyDown(handle, { key });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px });
    },
  );

  it("right to left, widens the column as the pointer drags left", () => {
    const { layout, interaction, handle } = mount({ direction: "rtl" });
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(40);
    flushFrames();
    expect(interaction.state.get()).toMatchObject({ previewWidth: 160 });
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 160 });
  });

  it("commits where a drag let go, though no frame ran before the release", () => {
    const { layout, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(150);
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 150 });
  });

  it("commits nothing for a drag let go where it started", () => {
    const { layout, interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(150);
    flushFrames();
    movePointer(100);
    releasePointer("pointerUp");
    expect(layout.state.get().overrides["name"]).toBeUndefined();
    expect(interaction.state.get().status).toBe("idle");
  });

  it("takes the native props of its root, merging the class name", () => {
    const { handle } = mount();
    const root = handle.parentElement;
    expect(root).toHaveClass("ds", "data-table-resize-handle");
    expect(root?.firstElementChild).toBe(handle);
  });

  it("leaves other keys to whatever else wants them", () => {
    const { layout, interaction, handle } = mount();
    const event = fireEvent.keyDown(handle, { key: "a" });
    expect(event).toBe(true);
    expect(interaction.state.get().status).toBe("idle");
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("abandons a running drag when a second pointer goes down", () => {
    const { interaction, handle } = mount();
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 200 });
    movePointer(260);
    // One drag is live, not two: the first drag's listeners went with it.
    expect(frames).toHaveLength(1);
    flushFrames();
    expect(interaction.state.get()).toMatchObject({ previewWidth: 160 });
    releasePointer("pointerUp");
    movePointer(400);
    flushFrames();
    expect(interaction.state.get().status).toBe("idle");
  });

  it("abandons a drag the unmounting table can no longer finish", () => {
    const layout = createLayoutOf([
      { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } },
    ]);
    const interaction = createGridInteraction(layout);
    const { unmount } = render(
      <ResizeHandle
        interaction={interaction}
        columnId="name"
        name="Name"
        width={100}
        min={50}
        max={Number.POSITIVE_INFINITY}
        labelledBy="name-label"
        announce={() => {}}
      />,
    );
    fireEvent.pointerDown(screen.getByRole("separator"), {
      isPrimary: true,
      clientX: 100,
    });
    unmount();
    movePointer(400);
    flushFrames();
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("reports the bounds it holds the column to", () => {
    const { handle } = mount();
    expect(handle).toHaveAttribute("aria-valuemin", "50");
    expect(handle).toHaveAttribute("aria-valuemax", "300");
    // Without a maximum ARIA would imply 100, so the width is also spoken.
    expect(handle).toHaveAttribute("aria-valuetext", "100 pixels");
  });

  it("holds a later resize to the declared bounds, not to the override", () => {
    const { layout, handle } = mount();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    // The first resize committed a fixed override, which carries no bounds
    // of its own: the declared ones must still hold every later drag.
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 116 });
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(1000);
    flushFrames();
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 300 });
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(-1000);
    flushFrames();
    releasePointer("pointerUp");
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 50 });
  });

  it("steps no further than a bound, after an override too", () => {
    const { layout, handle } = mount({ width: 290 });
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    // The column now carries a fixed override with no bounds of its own.
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 274 });
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 300 });
  });

  it("commits nothing at a bound, and still owns the key", () => {
    const { layout, handle } = mount({ width: 300 });
    expect(fireEvent.keyDown(handle, { key: "ArrowRight" })).toBe(false);
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("reveals nothing outside a table, through a drag and after it", () => {
    const layout = createLayoutOf([
      { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } },
    ]);
    const interaction = createGridInteraction(layout);
    const view = (width: number) => (
      <ResizeHandle
        interaction={interaction}
        columnId="name"
        name="Name"
        width={width}
        min={50}
        max={Number.POSITIVE_INFINITY}
        labelledBy="name-label"
        announce={() => {}}
      />
    );
    const { rerender } = render(view(100));
    const handle = screen.getByRole("separator");
    expect(handle).not.toHaveAttribute("aria-valuemax");
    fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
    movePointer(120);
    flushFrames();
    rerender(view(120));
    releasePointer("pointerUp");
    rerender(view(140));
    rerender(view(160));
    expect(interaction.state.get().status).toBe("idle");
  });
  describe("a press, then a press where the column should end", () => {
    it("starts placing on a press that does not travel, and commits nothing", () => {
      const { layout, interaction, handle, announce } = mount();
      fireEvent.pointerDown(handle, { isPrimary: true, clientX: 205 });
      movePointer(209);
      act(() => {
        releasePointer("pointerUp");
      });
      expect(interaction.state.get().status).toBe("idle");
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
      expect(handle).toHaveAccessibleDescription(
        "Click or tap in the header row where the Name column should end. Press the edge again or Escape to cancel.",
      );
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(
        "Click or tap in the header row where the Name column should end. Press the edge again or Escape to cancel.",
      );
    });

    it("treats a press past the slop as a drag", () => {
      const { layout, handle } = mount();
      fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
      movePointer(108);
      act(() => {
        releasePointer("pointerUp");
      });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
      // No frame ran; the release still commits where it let go.
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 108 });
    });

    it("moves the edge to the second press, clamped, without sorting", () => {
      const { layout, handle, sort } = mount();
      pressHandle(handle);
      const button = screen.getByRole("button", { name: "Name" });
      act(() => {
        fireEvent.pointerDown(button, { isPrimary: true, clientX: 170 });
      });
      fireEvent.click(button);
      expect(sort).not.toHaveBeenCalled();
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 160 });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
      // The press was consumed once: the next click is the control's own.
      fireEvent.click(button);
      expect(sort).toHaveBeenCalledTimes(1);
    });

    it("clamps the second press to the column's bounds", () => {
      const { layout, handle } = mount();
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(screen.getByText("Status"), {
          isPrimary: true,
          clientX: 900,
        });
      });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 300 });
    });

    it("measures from the cell's right edge right to left", () => {
      const { layout, handle } = mount({ direction: "rtl" });
      pressHandle(handle, 12);
      act(() => {
        fireEvent.pointerDown(screen.getByRole("button", { name: "Name" }), {
          isPrimary: true,
          clientX: 60,
        });
      });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 150 });
    });

    it("commits nothing for a second press where the edge already is", () => {
      const { layout, handle } = mount();
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(screen.getByText("Status"), {
          isPrimary: true,
          clientX: 110,
        });
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("ends placing on a press on the handle again, beginning no drag", () => {
      const { layout, interaction, handle } = mount();
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(handle, { isPrimary: true, clientX: 205 });
      });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
      expect(interaction.state.get().status).toBe("idle");
      act(() => {
        releasePointer("pointerUp");
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("ends placing on a press outside the header row, which does its own job", () => {
      const { layout, handle } = mount();
      pressHandle(handle);
      const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
      const click = vi.fn();
      elsewhere.addEventListener("click", click);
      act(() => {
        fireEvent.pointerDown(elsewhere, { isPrimary: true, clientX: 170 });
      });
      fireEvent.click(elsewhere);
      expect(click).toHaveBeenCalledTimes(1);
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("ends placing on a press that targets no element", () => {
      const { layout, handle } = mount();
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(window, { isPrimary: true, clientX: 170 });
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("ends placing on Escape with focus elsewhere in the header cell", () => {
      const { handle } = mount();
      pressHandle(handle);
      const sort = screen.getByRole("button", { name: "Name" });
      sort.focus();
      fireEvent.keyDown(sort, { key: "Escape" });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("keeps placing on Escape outside the header cell", () => {
      const { handle } = mount();
      pressHandle(handle);
      fireEvent.keyDown(screen.getByRole("button", { name: "Elsewhere" }), {
        key: "Escape",
      });
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
    });

    it("ends placing on Escape", () => {
      const { layout, handle } = mount();
      pressHandle(handle);
      fireEvent.keyDown(handle, { key: "Escape" });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
      act(() => {
        fireEvent.pointerDown(screen.getByText("Status"), {
          isPrimary: true,
          clientX: 170,
        });
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
    });

    it("ends placing once focus leaves the header cell, not within it", () => {
      const { handle } = mount();
      act(() => {
        handle.focus();
      });
      pressHandle(handle);
      act(() => {
        screen.getByRole("button", { name: "Name" }).focus();
      });
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
      act(() => {
        handle.focus();
      });
      act(() => {
        screen.getByRole("button", { name: "Elsewhere" }).focus();
      });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("ends placing once focus leaves the header cell from its sort control", () => {
      const { handle } = mount();
      act(() => {
        handle.focus();
      });
      pressHandle(handle);
      act(() => {
        screen.getByRole("button", { name: "Name" }).focus();
      });
      act(() => {
        screen.getByRole("button", { name: "Elsewhere" }).focus();
      });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("places the edge from the width the column has now, not the one placing began at", () => {
      const { layout, handle, rerender } = mount();
      pressHandle(handle);
      fireEvent.keyDown(handle, { key: "ArrowRight" });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 116 });
      rerender(116);
      // The cell starts at 10: a press at 110 puts the edge back at 100.
      act(() => {
        fireEvent.pointerDown(screen.getByText("Status"), {
          isPrimary: true,
          clientX: 110,
        });
      });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 100 });
    });

    it("keeps placing while the window, not the column, loses focus", () => {
      const { handle } = mount();
      act(() => {
        handle.focus();
      });
      pressHandle(handle);
      vi.mocked(document.hasFocus).mockReturnValue(false);
      fireEvent.blur(handle);
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
    });

    it("swallows no click once another press follows a consumed one", () => {
      const { handle, sort } = mount();
      pressHandle(handle);
      const button = screen.getByRole("button", { name: "Name" });
      act(() => {
        fireEvent.pointerDown(button, { isPrimary: true, clientX: 170 });
      });
      // The consumed press never clicked; the next press is the reader's.
      fireEvent.pointerDown(button, { isPrimary: true, clientX: 170 });
      fireEvent.click(button);
      expect(sort).toHaveBeenCalledTimes(1);
    });

    it.each([
      ["a cancelled pointer", () => fireEvent.pointerCancel(window)],
      ["a key", () => fireEvent.keyDown(window, { key: "Tab" })],
    ])("swallows no click once %s follows a consumed press", (_what, end) => {
      const { handle, sort } = mount();
      pressHandle(handle);
      const button = screen.getByRole("button", { name: "Name" });
      act(() => {
        fireEvent.pointerDown(button, { isPrimary: true, clientX: 170 });
      });
      // The consumed press never clicked; what came next ends the wait.
      end();
      fireEvent.click(button);
      expect(sort).toHaveBeenCalledTimes(1);
    });

    it("keeps a wobble within the slop a press, however long it lasts", () => {
      const { layout, interaction, handle } = mount();
      fireEvent.pointerDown(handle, { isPrimary: true, clientX: 205 });
      movePointer(209);
      // Nothing is previewed within the slop, so no frame waits to run.
      expect(frames).toHaveLength(0);
      flushFrames();
      act(() => {
        releasePointer("pointerUp");
      });
      expect(interaction.state.get().status).toBe("idle");
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
    });

    it("keeps a gesture that travelled the slop a drag, back within it or not", () => {
      const { layout, handle } = mount();
      fireEvent.pointerDown(handle, { isPrimary: true, clientX: 100 });
      movePointer(110);
      movePointer(104);
      flushFrames();
      act(() => {
        releasePointer("pointerUp");
      });
      expect(layout.effective("name")).toEqual({ kind: "fixed", px: 104 });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });

    it("leaves a secondary button's press to whatever else wants it", () => {
      const { layout, interaction, handle } = mount();
      fireEvent.pointerDown(handle, {
        isPrimary: true,
        button: 2,
        clientX: 205,
      });
      expect(interaction.state.get().status).toBe("idle");
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(screen.getByText("Status"), {
          isPrimary: true,
          button: 2,
          clientX: 170,
        });
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).toHaveAttribute("data-mode", "placing");
    });

    it("stops listening for the second press once it unmounts", () => {
      const layout = createLayoutOf([
        { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } },
      ]);
      const interaction = createGridInteraction(layout);
      const { unmount } = render(
        <HeaderRow>
          <HeaderCell>
            <ResizeHandle
              interaction={interaction}
              columnId="name"
              name="Name"
              width={100}
              min={50}
              max={Number.POSITIVE_INFINITY}
              labelledBy="name-label"
              announce={() => {}}
            />
          </HeaderCell>
        </HeaderRow>,
      );
      pressHandle(screen.getByRole("separator"));
      unmount();
      fireEvent.pointerDown(document.body, { isPrimary: true, clientX: 170 });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
    });

    it.each([
      ["outside a header cell", false],
      ["in a header cell outside a header row", true],
    ])("places nothing %s", (_where, inCell) => {
      const layout = createLayoutOf([
        { id: "name", sizing: { kind: "flex", weight: 1, minPx: 50 } },
      ]);
      const interaction = createGridInteraction(layout);
      const control = (
        <ResizeHandle
          interaction={interaction}
          columnId="name"
          name="Name"
          width={100}
          min={50}
          max={Number.POSITIVE_INFINITY}
          labelledBy="name-label"
          announce={() => {}}
        />
      );
      render(
        <>
          {inCell ? <HeaderCell>{control}</HeaderCell> : control}
          <button type="button">Elsewhere</button>
        </>,
      );
      const handle = screen.getByRole("separator");
      pressHandle(handle);
      act(() => {
        fireEvent.pointerDown(screen.getByRole("button"), {
          isPrimary: true,
          clientX: 170,
        });
      });
      expect(layout.state.get().overrides["name"]).toBeUndefined();
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
      // Focus leaving a handle with no cell around it ends placing too.
      pressHandle(handle);
      act(() => {
        handle.focus();
      });
      act(() => {
        handle.blur();
      });
      expect(handle.parentElement).not.toHaveAttribute("data-mode");
    });
  });
});

describe("ResizeHandle in a table, a press then a press", () => {
  /** The handle's header row inside a table, laid out on screen. */
  const mountInTable = () => {
    const layout = createLayoutOf([
      {
        id: "name",
        sizing: { kind: "flex", weight: 1, minPx: 50, maxPx: 300 },
      },
    ]);
    const interaction = createGridInteraction(layout);
    render(
      <Table>
        <HeaderRow>
          <HeaderCell>
            <ResizeHandle
              interaction={interaction}
              columnId="name"
              name="Name"
              width={100}
              min={50}
              max={300}
              labelledBy="name-label"
              announce={() => {}}
            />
          </HeaderCell>
        </HeaderRow>
      </Table>,
    );
    const cell = screen.getByRole("columnheader");
    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 10, y: 0, width: 100, height: 32 }),
    );
    vi.spyOn(screen.getByRole("row"), "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 10, y: 0, width: 100, height: 32 }),
    );
    return { layout, handle: screen.getByRole("separator") };
  };

  it("widens the column into the space the table leaves past the row", () => {
    const { layout, handle } = mountInTable();
    pressHandle(handle);
    act(() => {
      fireEvent.pointerDown(screen.getByRole("table"), {
        isPrimary: true,
        clientX: 250,
        clientY: 16,
      });
    });
    expect(layout.effective("name")).toEqual({ kind: "fixed", px: 240 });
  });

  it("places nothing for a press in the table below the header row", () => {
    const { layout, handle } = mountInTable();
    pressHandle(handle);
    act(() => {
      fireEvent.pointerDown(screen.getByRole("table"), {
        isPrimary: true,
        clientX: 250,
        clientY: 80,
      });
    });
    expect(layout.state.get().overrides["name"]).toBeUndefined();
    expect(handle.parentElement).not.toHaveAttribute("data-mode");
  });

  it("places nothing for a press above the header row", () => {
    const { layout, handle } = mountInTable();
    pressHandle(handle);
    act(() => {
      fireEvent.pointerDown(screen.getByRole("table"), {
        isPrimary: true,
        clientX: 250,
        clientY: -8,
      });
    });
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });

  it("places nothing for a press outside the table", () => {
    const { layout, handle } = mountInTable();
    pressHandle(handle);
    act(() => {
      fireEvent.pointerDown(document.body, {
        isPrimary: true,
        clientX: 250,
        clientY: 16,
      });
    });
    expect(layout.state.get().overrides["name"]).toBeUndefined();
  });
});
